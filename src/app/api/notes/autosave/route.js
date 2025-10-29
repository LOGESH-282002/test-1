import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { verifyToken, getTokenFromRequest } from '@/lib/auth'
import { sanitizeInput } from '@/lib/validation'

export const dynamic = 'force-dynamic'

// POST autosave note
export async function POST(request) {
  try {
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

    const { id, title, content, encrypted_content, is_encrypted = false } = await request.json()

    // Sanitize input
    const sanitizedTitle = sanitizeInput(title || 'Untitled Note')
    const sanitizedContent = sanitizeInput(content || '')

    const updateData = {
      title: sanitizedTitle,
      content: sanitizedContent,
      encrypted_content: encrypted_content || null,
      is_encrypted,
      last_autosave: new Date().toISOString(),
    }

    let note

    if (id) {
      // Update existing note
      const { data, error } = await supabaseAdmin
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
          last_autosave
        `)
        .single()

      if (error) {
        console.error('Database error:', error)
        return NextResponse.json(
          { error: 'Failed to autosave note' },
          { status: 500 }
        )
      }

      note = data
    } else {
      // Create new draft note
      const { data, error } = await supabaseAdmin
        .from('notes')
        .insert([
          {
            ...updateData,
            is_draft: true,
            is_public: false,
            author_id: decoded.userId,
          },
        ])
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
          last_autosave
        `)
        .single()

      if (error) {
        console.error('Database error:', error)
        return NextResponse.json(
          { error: 'Failed to create draft note' },
          { status: 500 }
        )
      }

      note = data
    }

    return NextResponse.json({
      message: 'Note autosaved',
      note,
    })
  } catch (error) {
    console.error('Autosave error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}