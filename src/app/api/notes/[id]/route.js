import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { verifyToken, getTokenFromRequest } from '@/lib/auth'
import { validateNote, sanitizeInput } from '@/lib/validation'
import crypto from 'crypto'

export const dynamic = 'force-dynamic'

// GET single note
export async function GET(request, { params }) {
  try {
    const { id } = params

    // First try to get note by public link
    const { data: publicNote, error: publicError } = await supabaseAdmin
      .from('notes')
      .select(`
        id,
        title,
        content,
        encrypted_content,
        is_encrypted,
        is_public,
        is_draft,
        public_link_id,
        created_at,
        updated_at,
        categories (
          id,
          name,
          color,
          icon
        ),
        note_labels (
          labels (
            id,
            name,
            color
          )
        ),
        users (
          id,
          name,
          email
        )
      `)
      .eq('public_link_id', id)
      .eq('is_public', true)
      .eq('is_draft', false)
      .single()

    if (!publicError && publicNote) {
      return NextResponse.json({ note: publicNote })
    }

    // If not found as public link, check if user owns the note
    const token = getTokenFromRequest(request)
    
    if (!token) {
      return NextResponse.json(
        { error: 'Note not found or access denied' },
        { status: 404 }
      )
    }

    const decoded = verifyToken(token)
    
    if (!decoded) {
      return NextResponse.json(
        { error: 'Invalid or expired token' },
        { status: 401 }
      )
    }

    const { data: note, error } = await supabaseAdmin
      .from('notes')
      .select(`
        id,
        title,
        content,
        encrypted_content,
        is_encrypted,
        is_public,
        is_draft,
        public_link_id,
        created_at,
        updated_at,
        categories (
          id,
          name,
          color,
          icon
        ),
        note_labels (
          labels (
            id,
            name,
            color
          )
        ),
        users (
          id,
          name,
          email
        )
      `)
      .eq('id', id)
      .eq('author_id', decoded.userId)
      .single()

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json(
        { error: 'Note not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ note })
  } catch (error) {
    console.error('Get note error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// PUT update note
export async function PUT(request, { params }) {
  try {
    const { id } = params
    const token = getTokenFromRequest(request)
    
    if (!token) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const decoded = verifyToken(token)
    
    if (!decoded) {
      return NextResponse.json(
        { error: 'Invalid or expired token' },
        { status: 401 }
      )
    }

    const { title, content, is_public, is_draft, is_encrypted, encrypted_content, category_id, label_ids, is_autosave = false } = await request.json()

    // Validate input
    const validation = validateNote(title, content)
    if (!validation.isValid) {
      return NextResponse.json(
        { error: 'Validation failed', details: validation.errors },
        { status: 400 }
      )
    }

    // Sanitize input
    const sanitizedTitle = sanitizeInput(title)
    const sanitizedContent = sanitizeInput(content)

    // Get current note to check ownership and current state
    const { data: currentNote, error: fetchError } = await supabaseAdmin
      .from('notes')
      .select('id, is_public, public_link_id')
      .eq('id', id)
      .eq('author_id', decoded.userId)
      .single()

    if (fetchError) {
      return NextResponse.json(
        { error: 'Note not found' },
        { status: 404 }
      )
    }

    // Generate or remove public link ID based on visibility change
    let publicLinkId = currentNote.public_link_id
    if (is_public !== undefined && is_draft !== undefined) {
      if (is_public && !is_draft && !publicLinkId) {
        publicLinkId = crypto.randomBytes(16).toString('base64url')
      } else if (!is_public && publicLinkId) {
        publicLinkId = null
      }
    }

    // Prepare update data
    const updateData = {
      title: sanitizedTitle,
      content: sanitizedContent,
      encrypted_content: encrypted_content || null,
      is_encrypted: is_encrypted !== undefined ? is_encrypted : undefined,
      is_public: is_public !== undefined ? is_public : undefined,
      is_draft: is_draft !== undefined ? is_draft : undefined,
      public_link_id: publicLinkId,
      category_id: category_id !== undefined ? category_id : undefined,
    }

    // Add autosave timestamp if this is an autosave
    if (is_autosave) {
      updateData.last_autosave = new Date().toISOString()
    }

    // Remove undefined values
    Object.keys(updateData).forEach(key => {
      if (updateData[key] === undefined) {
        delete updateData[key]
      }
    })

    const { data: note, error } = await supabaseAdmin
      .from('notes')
      .update(updateData)
      .eq('id', id)
      .eq('author_id', decoded.userId)
      .select(`
        id,
        title,
        content,
        encrypted_content,
        is_encrypted,
        is_public,
        is_draft,
        public_link_id,
        created_at,
        updated_at,
        last_autosave,
        categories (
          id,
          name,
          color,
          icon
        ),
        note_labels (
          labels (
            id,
            name,
            color
          )
        ),
        users (
          id,
          name,
          email
        )
      `)
      .single()

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json(
        { error: 'Failed to update note' },
        { status: 500 }
      )
    }

    // Update labels if provided
    if (label_ids !== undefined) {
      // First, remove all existing labels
      await supabaseAdmin
        .from('note_labels')
        .delete()
        .eq('note_id', id)

      // Then add new labels
      if (label_ids.length > 0) {
        const labelInserts = label_ids.map(labelId => ({
          note_id: id,
          label_id: labelId
        }))

        const { error: labelError } = await supabaseAdmin
          .from('note_labels')
          .insert(labelInserts)

        if (labelError) {
          console.error('Label assignment error:', labelError)
          // Don't fail the entire operation, just log the error
        }
      }
    }

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json(
        { error: 'Failed to update note' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      message: is_autosave ? 'Note autosaved' : 'Note updated successfully',
      note,
    })
  } catch (error) {
    console.error('Update note error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// DELETE note
export async function DELETE(request, { params }) {
  try {
    const { id } = params
    const token = getTokenFromRequest(request)
    
    if (!token) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const decoded = verifyToken(token)
    
    if (!decoded) {
      return NextResponse.json(
        { error: 'Invalid or expired token' },
        { status: 401 }
      )
    }

    const { error } = await supabaseAdmin
      .from('notes')
      .delete()
      .eq('id', id)
      .eq('author_id', decoded.userId)

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json(
        { error: 'Failed to delete note' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      message: 'Note deleted successfully',
    })
  } catch (error) {
    console.error('Delete note error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}