import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { verifyToken, getTokenFromRequest } from '@/lib/auth'
import { sanitizeInput } from '@/lib/validation'

export const dynamic = 'force-dynamic'

// GET all categories for authenticated user
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

    const { data: categories, error } = await supabaseAdmin
      .from('categories')
      .select('*')
      .or(`author_id.eq.${decoded.userId},is_default.eq.true`)
      .order('name', { ascending: true })

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json(
        { error: 'Failed to fetch categories' },
        { status: 500 }
      )
    }

    return NextResponse.json({ categories })
  } catch (error) {
    console.error('Get categories error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST create new category
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

    const { name, description, color, icon } = await request.json()

    // Validate input
    if (!name || name.trim().length < 1) {
      return NextResponse.json(
        { error: 'Category name is required' },
        { status: 400 }
      )
    }

    if (name.length > 100) {
      return NextResponse.json(
        { error: 'Category name must be less than 100 characters' },
        { status: 400 }
      )
    }

    // Sanitize input
    const sanitizedName = sanitizeInput(name)
    const sanitizedDescription = sanitizeInput(description || '')

    // Check if category name already exists for this user
    const { data: existingCategory } = await supabaseAdmin
      .from('categories')
      .select('id')
      .eq('name', sanitizedName)
      .eq('author_id', decoded.userId)
      .single()

    if (existingCategory) {
      return NextResponse.json(
        { error: 'Category name already exists' },
        { status: 400 }
      )
    }

    // Create category
    const { data: category, error } = await supabaseAdmin
      .from('categories')
      .insert([
        {
          name: sanitizedName,
          description: sanitizedDescription,
          color: color || '#6366f1',
          icon: icon || 'folder',
          author_id: decoded.userId,
          is_default: false,
        },
      ])
      .select('*')
      .single()

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json(
        { error: 'Failed to create category' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      message: 'Category created successfully',
      category,
    })
  } catch (error) {
    console.error('Create category error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}