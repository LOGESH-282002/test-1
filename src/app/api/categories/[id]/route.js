import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { verifyToken, getTokenFromRequest } from '@/lib/auth'
import { sanitizeInput } from '@/lib/validation'

export const dynamic = 'force-dynamic'

// PUT update category
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

    // Check if category exists and user owns it (and it's not default)
    const { data: existingCategory, error: fetchError } = await supabaseAdmin
      .from('categories')
      .select('id, is_default')
      .eq('id', id)
      .eq('author_id', decoded.userId)
      .single()

    if (fetchError || !existingCategory) {
      return NextResponse.json(
        { error: 'Category not found' },
        { status: 404 }
      )
    }

    if (existingCategory.is_default) {
      return NextResponse.json(
        { error: 'Cannot modify default categories' },
        { status: 403 }
      )
    }

    // Check if new name conflicts with existing categories
    const { data: nameConflict } = await supabaseAdmin
      .from('categories')
      .select('id')
      .eq('name', sanitizedName)
      .eq('author_id', decoded.userId)
      .neq('id', id)
      .single()

    if (nameConflict) {
      return NextResponse.json(
        { error: 'Category name already exists' },
        { status: 400 }
      )
    }

    // Update category
    const { data: category, error } = await supabaseAdmin
      .from('categories')
      .update({
        name: sanitizedName,
        description: sanitizedDescription,
        color: color || '#6366f1',
        icon: icon || 'folder',
      })
      .eq('id', id)
      .eq('author_id', decoded.userId)
      .select('*')
      .single()

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json(
        { error: 'Failed to update category' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      message: 'Category updated successfully',
      category,
    })
  } catch (error) {
    console.error('Update category error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// DELETE category
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

    // Check if category exists and user owns it (and it's not default)
    const { data: existingCategory, error: fetchError } = await supabaseAdmin
      .from('categories')
      .select('id, is_default')
      .eq('id', id)
      .eq('author_id', decoded.userId)
      .single()

    if (fetchError || !existingCategory) {
      return NextResponse.json(
        { error: 'Category not found' },
        { status: 404 }
      )
    }

    if (existingCategory.is_default) {
      return NextResponse.json(
        { error: 'Cannot delete default categories' },
        { status: 403 }
      )
    }

    // Check if category is being used by any notes
    const { data: notesUsingCategory, error: notesError } = await supabaseAdmin
      .from('notes')
      .select('id')
      .eq('category_id', id)
      .eq('author_id', decoded.userId)
      .limit(1)

    if (notesError) {
      console.error('Database error checking notes:', notesError)
      return NextResponse.json(
        { error: 'Failed to check category usage' },
        { status: 500 }
      )
    }

    if (notesUsingCategory && notesUsingCategory.length > 0) {
      return NextResponse.json(
        { error: 'Cannot delete category that is being used by notes' },
        { status: 400 }
      )
    }

    // Delete category
    const { error } = await supabaseAdmin
      .from('categories')
      .delete()
      .eq('id', id)
      .eq('author_id', decoded.userId)

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json(
        { error: 'Failed to delete category' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      message: 'Category deleted successfully',
    })
  } catch (error) {
    console.error('Delete category error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}