import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { verifyToken, getTokenFromRequest } from '@/lib/auth'

export const dynamic = 'force-dynamic'

// GET search notes with advanced filters
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
    const query = searchParams.get('q') || ''
    const categoryId = searchParams.get('category')
    const labelIds = searchParams.get('labels')?.split(',').filter(Boolean) || []
    const dateFilter = searchParams.get('date') || 'all'
    const includeDrafts = searchParams.get('drafts') === 'true'
    const sortBy = searchParams.get('sort') || 'updated_desc'
    const page = parseInt(searchParams.get('page')) || 1
    const limit = parseInt(searchParams.get('limit')) || 20
    const offset = (page - 1) * limit

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

    // Build the base query
    let dbQuery = supabaseAdmin
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

    // Apply draft filter
    if (!includeDrafts) {
      dbQuery = dbQuery.eq('is_draft', false)
    }

    // Apply category filter
    if (categoryId) {
      dbQuery = dbQuery.eq('category_id', categoryId)
    }

    // Apply text search filter
    if (query) {
      dbQuery = dbQuery.or(`title.ilike.%${query}%,content.ilike.%${query}%`)
    }

    // Apply date filter
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
      
      dbQuery = dbQuery.gte('updated_at', filterDate.toISOString())
    }

    const { data: notes, error, count } = await dbQuery
      .range(offset, offset + limit - 1)

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json(
        { error: 'Failed to search notes' },
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
      total: count,
      page,
      limit,
      hasMore: (offset + limit) < count
    })
  } catch (error) {
    console.error('Search notes error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}