import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { verifyToken, getTokenFromRequest } from '@/lib/auth'
import { sanitizeInput } from '@/lib/validation'

export const dynamic = 'force-dynamic'

// GET all labels for authenticated user
export async function GET(request) {
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

    const { data: labels, error } = await supabaseAdmin
      .from('labels')
      .select('*')
      .eq('author_id', decoded.userId)
      .order('name', { ascending: true })

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json(
        { error: 'Failed to fetch labels' },
        { status: 500 }
      )
    }

    return NextResponse.json({ labels })
  } catch (error) {
    console.error('Get labels error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST create new label
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

    // Check if label name already exists for this user
    const { data: existingLabel } = await supabaseAdmin
      .from('labels')
      .select('id')
      .eq('name', sanitizedName)
      .eq('author_id', decoded.userId)
      .single()

    if (existingLabel) {
      return NextResponse.json(
        { error: 'Label name already exists' },
        { status: 400 }
      )
    }

    // Create label
    const { data: label, error } = await supabaseAdmin
      .from('labels')
      .insert([
        {
          name: sanitizedName,
          color: color || '#10b981',
          author_id: decoded.userId,
        },
      ])
      .select('*')
      .single()

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json(
        { error: 'Failed to create label' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      message: 'Label created successfully',
      label,
    })
  } catch (error) {
    console.error('Create label error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}