import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { verifyToken, getTokenFromRequest } from '@/lib/auth'
import { sanitizeInput } from '@/lib/validation'

export const dynamic = 'force-dynamic'

// PUT update label
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

    const { name, color } = await request.json()

    // Validate input
    if (!name || name.trim().length < 1) {
      return NextResponse.json(
        { error: 'Label name is required' },
        { status: 400 }
      )
    }

    if (name.length > 50) {
      return NextResponse.json(
        { error: 'Label name must be less than 50 characters' },
        { status: 400 }
      )
    }

    // Sanitize input
    const sanitizedName = sanitizeInput(name)

    // Check if label exists and user owns it
    const { data: existingLabel, error: fetchError } = await supabaseAdmin
      .from('labels')
      .select('id')
      .eq('id', id)
      .eq('author_id', decoded.userId)
      .single()

    if (fetchError || !existingLabel) {
      return NextResponse.json(
        { error: 'Label not found' },
        { status: 404 }
      )
    }

    // Check if new name conflicts with existing labels
    const { data: nameConflict } = await supabaseAdmin
      .from('labels')
      .select('id')
      .eq('name', sanitizedName)
      .eq('author_id', decoded.userId)
      .neq('id', id)
      .single()

    if (nameConflict) {
      return NextResponse.json(
        { error: 'Label name already exists' },
        { status: 400 }
      )
    }

    // Update label
    const { data: label, error } = await supabaseAdmin
      .from('labels')
      .update({
        name: sanitizedName,
        color: color || '#10b981',
      })
      .eq('id', id)
      .eq('author_id', decoded.userId)
      .select('*')
      .single()

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json(
        { error: 'Failed to update label' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      message: 'Label updated successfully',
      label,
    })
  } catch (error) {
    console.error('Update label error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// DELETE label
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

    // Check if label exists and user owns it
    const { data: existingLabel, error: fetchError } = await supabaseAdmin
      .from('labels')
      .select('id')
      .eq('id', id)
      .eq('author_id', decoded.userId)
      .single()

    if (fetchError || !existingLabel) {
      return NextResponse.json(
        { error: 'Label not found' },
        { status: 404 }
      )
    }

    // Delete label (note_labels will be automatically deleted due to CASCADE)
    const { error } = await supabaseAdmin
      .from('labels')
      .delete()
      .eq('id', id)
      .eq('author_id', decoded.userId)

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json(
        { error: 'Failed to delete label' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      message: 'Label deleted successfully',
    })
  } catch (error) {
    console.error('Delete label error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}