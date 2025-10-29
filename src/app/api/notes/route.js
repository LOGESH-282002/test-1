import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { verifyToken, getTokenFromRequest } from '@/lib/auth'
import { validateNote, sanitizeInput } from '@/lib/validation'
import crypto from 'crypto'

export const dynamic = 'force-dynamic'

// GET all notes for authenticated user
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

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page')) || 1
    const limit = Math.min(parseInt(searchParams.get('limit')) || 20, 50) // Cap at 50 for performance
    const offset = (page - 1) * limit
    const includeDrafts = searchParams.get('drafts') === 'true'
    const sortBy = searchParams.get('sort') || 'updated_desc'
    
    // Advanced filters
    const searchQuery = searchParams.get('search')
    const categoryId = searchParams.get('category')
    const labelIds = searchParams.get('labels')?.split(',').filter(Boolean) || []
    const visibilityFilter = searchParams.get('visibility') || 'all'
    const encryptionFilter = searchParams.get('encryption') || 'all'
    const dateFilter = searchParams.get('date') || 'all'

    // Parse sort parameter
    const getSortConfig = (sortBy) => {
      switch (sortBy) {
        case 'updated_asc':
          return { column: 'updated_at', ascending: true }
        case 'updated_desc':
          return { column: 'updated_at', ascending: false }
        case 'created_asc':
          return { column: 'created_at', ascending: true }
        case 'created_desc':
          return { column: 'created_at', ascending: false }
        case 'title_asc':
          return { column: 'title', ascending: true }
        case 'title_desc':
          return { column: 'title', ascending: false }
        default:
          return { column: 'updated_at', ascending: false }
      }
    }

    const sortConfig = getSortConfig(sortBy)

    let query = supabaseAdmin
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
      .eq('author_id', decoded.userId)
      .order(sortConfig.column, { ascending: sortConfig.ascending })

    // Apply filters
    if (!includeDrafts) {
      query = query.eq('is_draft', false)
    }

    // Visibility filter
    if (visibilityFilter !== 'all') {
      switch (visibilityFilter) {
        case 'private':
          query = query.eq('is_public', false)
          break
        case 'public':
          query = query.eq('is_public', true)
          break
        case 'draft':
          query = query.eq('is_draft', true)
          break
        case 'published':
          query = query.eq('is_draft', false)
          break
      }
    }

    // Encryption filter
    if (encryptionFilter !== 'all') {
      query = query.eq('is_encrypted', encryptionFilter === 'encrypted')
    }

    // Category filter
    if (categoryId) {
      query = query.eq('category_id', categoryId)
    }

    // Text search filter
    if (searchQuery) {
      query = query.or(`title.ilike.%${searchQuery}%,content.ilike.%${searchQuery}%`)
    }

    // Date filter
    if (dateFilter !== 'all') {
      const now = new Date()
      let filterDate = new Date()
      
      switch (dateFilter) {
        case 'today':
          filterDate.setHours(0, 0, 0, 0)
          break
        case 'week':
          filterDate.setDate(now.getDate() - 7)
          break
        case 'month':
          filterDate.setMonth(now.getMonth() - 1)
          break
        case 'year':
          filterDate.setFullYear(now.getFullYear() - 1)
          break
      }
      
      query = query.gte('updated_at', filterDate.toISOString())
    }

    const { data: notes, error, count } = await query
      .range(offset, offset + limit - 1)

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json(
        { error: 'Failed to fetch notes' },
        { status: 500 }
      )
    }

    // Filter by labels if specified (post-processing since Supabase doesn't support complex joins in filters)
    let filteredNotes = notes
    if (labelIds.length > 0) {
      filteredNotes = notes.filter(note => 
        note.note_labels?.some(nl => labelIds.includes(nl.labels.id))
      )
    }

    return NextResponse.json({ 
      notes: filteredNotes,
      pagination: {
        page,
        limit,
        total: count,
        hasMore: (offset + limit) < count,
        totalPages: Math.ceil(count / limit)
      }
    })
  } catch (error) {
    console.error('Get notes error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST create new note
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

    const { title, content, is_public = false, is_draft = true, is_encrypted = false, encrypted_content, category_id, label_ids = [] } = await request.json()

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

    // Generate public link ID if note is public
    const publicLinkId = is_public && !is_draft ? crypto.randomBytes(16).toString('base64url') : null

    // Create note
    const { data: note, error } = await supabaseAdmin
      .from('notes')
      .insert([
        {
          title: sanitizedTitle,
          content: sanitizedContent,
          encrypted_content: encrypted_content || null,
          is_encrypted,
          is_public,
          is_draft,
          public_link_id: publicLinkId,
          category_id: category_id || null,
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
        last_autosave,
        categories (
          id,
          name,
          color,
          icon
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
        { error: 'Failed to create note' },
        { status: 500 }
      )
    }

    // Add labels if provided
    if (label_ids && label_ids.length > 0) {
      const labelInserts = label_ids.map(labelId => ({
        note_id: note.id,
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

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json(
        { error: 'Failed to create note' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      message: 'Note created successfully',
      note,
    })
  } catch (error) {
    console.error('Create note error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}