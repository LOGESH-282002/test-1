'use client'

import { useState, useEffect, useCallback } from 'react'
import { toast } from 'react-hot-toast'
import { useAuth } from '@/contexts/AuthContext'
import { useInfiniteScroll } from '@/hooks/useInfiniteScroll'
import NoteCard from '@/components/NoteCard'
import NoteFilters from '@/components/NoteFilters'
import NoteSorting, { sortNotes } from '@/components/NoteSorting'
import QuickSort from '@/components/QuickSort'
import Logo from '@/components/Logo'
import { PenTool, Sparkles, TrendingUp, Users, StickyNote, Plus, Lock, Globe, Loader2 } from 'lucide-react'

export default function HomePage() {
  const { token, user } = useAuth()
  const [notes, setNotes] = useState([])
  const [loading, setLoading] = useState(true)
  const [showDrafts, setShowDrafts] = useState(true)
  const [pagination, setPagination] = useState({
    page: 1,
    hasMore: true,
    total: 0
  })
  const [filters, setFilters] = useState({
    search: '',
    category: '',
    labels: [],
    dateFilter: 'all',
    visibility: 'all',
    encryption: 'all'
  })
  const [sortBy, setSortBy] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('notes_sort_preference') || 'updated_desc'
    }
    return 'updated_desc'
  })

  useEffect(() => {
    if (token) {
      resetAndFetchNotes()
    } else {
      setLoading(false)
    }
  }, [token, showDrafts, sortBy, filters])

  const resetAndFetchNotes = useCallback(async () => {
    setLoading(true)
    setNotes([])
    setPagination({ page: 1, hasMore: true, total: 0 })
    await fetchNotes(1, true)
  }, [showDrafts, sortBy, filters])

  const fetchMoreNotes = useCallback(async () => {
    if (!pagination.hasMore || loading) return
    await fetchNotes(pagination.page + 1, false)
  }, [pagination.hasMore, pagination.page, loading])

  const handleFiltersChange = useCallback((newFilters) => {
    setFilters(newFilters)
  }, [])

  const handleSortChange = useCallback((newSort) => {
    setSortBy(newSort)
    if (typeof window !== 'undefined') {
      localStorage.setItem('notes_sort_preference', newSort)
    }
  }, [])

  const fetchNotes = async (page = 1, reset = false) => {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '20',
        drafts: showDrafts.toString(),
        sort: sortBy,
        ...(filters.search && { search: filters.search }),
        ...(filters.category && { category: filters.category }),
        ...(filters.labels.length > 0 && { labels: filters.labels.join(',') }),
        ...(filters.dateFilter !== 'all' && { date: filters.dateFilter }),
        ...(filters.visibility !== 'all' && { visibility: filters.visibility }),
        ...(filters.encryption !== 'all' && { encryption: filters.encryption })
      })

      const response = await fetch(`/api/notes?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch notes')
      }

      if (reset) {
        setNotes(data.notes)
      } else {
        setNotes(prev => [...prev, ...data.notes])
      }

      setPagination({
        page: data.pagination.page,
        hasMore: data.pagination.hasMore,
        total: data.pagination.total
      })
    } catch (error) {
      toast.error(error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteNote = async (noteId) => {
    if (!token) {
      toast.error('Please login to delete notes')
      return
    }

    try {
      const response = await fetch(`/api/notes/${noteId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to delete note')
      }

      setNotes(notes.filter(note => note.id !== noteId))
      setPagination(prev => ({ ...prev, total: prev.total - 1 }))
      toast.success('Note deleted successfully')
    } catch (error) {
      toast.error(error.message)
    }
  }

  // Infinite scroll hook
  const { lastElementRef, isFetching } = useInfiniteScroll(
    fetchMoreNotes,
    pagination.hasMore && !loading
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-primary-200 border-t-primary-600 mx-auto mb-4"></div>
          <p className="text-neutral-600 animate-pulse">Loading your notes...</p>
        </div>
      </div>
    )
  }

  if (!token) {
    return (
      <div className="space-y-12">
        {/* Hero Section */}
        <div className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary-100/50 via-secondary-50/30 to-accent-100/50 rounded-3xl"></div>
          <div className="relative text-center py-20 px-8">
            <div className="flex justify-center mb-6">
              <Logo size="xl" showText={false} />
            </div>
            
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              <span className="gradient-text">Welcome to NotesApp</span>
            </h1>
            
            <p className="text-xl md:text-2xl text-neutral-600 mb-8 max-w-3xl mx-auto leading-relaxed">
              Your secure, private space for thoughts, ideas, and memories. 
              Create, organize, and share your notes with confidence.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
              <a href="/register" className="btn-primary inline-flex items-center space-x-2">
                <Sparkles className="h-5 w-5" />
                <span>Get Started</span>
              </a>
              <a href="/login" className="btn-secondary inline-flex items-center space-x-2">
                <span>Sign In</span>
              </a>
            </div>
            
            {/* Features */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-2xl mx-auto">
              <div className="text-center">
                <div className="relative inline-block mb-4">
                  <div className="absolute inset-0 bg-gradient-to-r from-primary-600 to-secondary-600 rounded-full blur-sm opacity-20"></div>
                  <div className="relative bg-gradient-to-r from-primary-100 to-secondary-100 p-4 rounded-full">
                    <Lock className="h-8 w-8 text-primary-600 mx-auto" />
                  </div>
                </div>
                <h3 className="font-bold text-neutral-900 mb-2">Secure & Private</h3>
                <p className="text-sm text-neutral-600">End-to-end encryption keeps your notes safe</p>
              </div>
              <div className="text-center">
                <div className="relative inline-block mb-4">
                  <div className="absolute inset-0 bg-gradient-to-r from-secondary-600 to-accent-600 rounded-full blur-sm opacity-20"></div>
                  <div className="relative bg-gradient-to-r from-secondary-100 to-accent-100 p-4 rounded-full">
                    <StickyNote className="h-8 w-8 text-secondary-600 mx-auto" />
                  </div>
                </div>
                <h3 className="font-bold text-neutral-900 mb-2">Auto-Save</h3>
                <p className="text-sm text-neutral-600">Never lose your thoughts with automatic saving</p>
              </div>
              <div className="text-center">
                <div className="relative inline-block mb-4">
                  <div className="absolute inset-0 bg-gradient-to-r from-accent-600 to-primary-600 rounded-full blur-sm opacity-20"></div>
                  <div className="relative bg-gradient-to-r from-accent-100 to-primary-100 p-4 rounded-full">
                    <Globe className="h-8 w-8 text-accent-600 mx-auto" />
                  </div>
                </div>
                <h3 className="font-bold text-neutral-900 mb-2">Share Easily</h3>
                <p className="text-sm text-neutral-600">Share notes publicly with secure links</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="spacing-responsive">
      {/* Header */}
      <div className="flex flex-col space-y-4 sm:flex-row sm:items-start sm:justify-between sm:space-y-0">
        <div className="flex-1">
          <h1 className="text-responsive-xl font-bold text-neutral-900 mb-2">My Notes</h1>
          <p className="text-responsive text-neutral-600">Organize your thoughts and ideas</p>
        </div>
        
        <div className="flex flex-col space-y-3 sm:space-y-4 sm:items-end">
          <div className="flex items-center space-x-2 flex-wrap gap-2">
            <button
              onClick={() => setShowDrafts(!showDrafts)}
              className={`btn-compact touch-manipulation ${
                showDrafts 
                  ? 'bg-primary-100 text-primary-700' 
                  : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
              }`}
            >
              <span className="sm:hidden">{showDrafts ? 'Hide Drafts' : 'Show Drafts'}</span>
              <span className="hidden sm:inline">{showDrafts ? 'Hide Drafts' : 'Show Drafts'}</span>
            </button>
            
            <span className="btn-compact bg-neutral-100 text-neutral-500">
              {notes.length} of {pagination.total} {pagination.total === 1 ? 'note' : 'notes'}
            </span>
            
            <span className="btn-compact bg-neutral-50 text-neutral-400 hidden lg:inline">
              {sortBy === 'updated_desc' ? 'Latest first' :
               sortBy === 'updated_asc' ? 'Oldest first' :
               sortBy === 'created_desc' ? 'Newest first' :
               sortBy === 'created_asc' ? 'Oldest created' :
               sortBy === 'title_asc' ? 'A-Z' : 'Z-A'}
            </span>
          </div>
          
          <div className="flex items-center space-x-2 sm:space-x-3">
            {/* Quick sort for mobile */}
            <div className="sm:hidden">
              <QuickSort currentSort={sortBy} onSortChange={handleSortChange} />
            </div>
            
            <a href="/create" className="btn-primary inline-flex items-center space-x-2 touch-manipulation">
              <Plus className="h-4 w-4" />
              <span className="hidden xs:inline sm:inline">New Note</span>
              <span className="xs:hidden sm:hidden">New</span>
            </a>
          </div>
        </div>
      </div>

      {/* Filters and Sorting */}
      <div className="space-y-3 sm:space-y-4">
        <NoteFilters 
          onFiltersChange={handleFiltersChange} 
          activeFilters={filters}
          onSortChange={handleSortChange}
          currentSort={sortBy}
        />
        
        {/* Desktop-only advanced sorting */}
        <div className="hidden lg:flex justify-end">
          <NoteSorting currentSort={sortBy} onSortChange={handleSortChange} />
        </div>
      </div>

      {/* Notes Grid */}
      {notes.length === 0 && !loading ? (
        <div className="text-center py-20">
          <div className="relative inline-block mb-6">
            <div className="absolute inset-0 bg-gradient-to-r from-primary-600 to-secondary-600 rounded-full blur-lg opacity-20"></div>
            <div className="relative bg-gradient-to-r from-primary-100 to-secondary-100 p-8 rounded-full">
              <StickyNote className="h-16 w-16 text-primary-600 mx-auto" />
            </div>
          </div>
          
          <h3 className="text-2xl font-bold text-neutral-900 mb-4">No notes found</h3>
          <p className="text-neutral-600 mb-8 max-w-md mx-auto">
            {Object.values(filters).some(f => f && f !== 'all' && (!Array.isArray(f) || f.length > 0)) 
              ? 'Try adjusting your filters to find what you\'re looking for.'
              : 'Start capturing your thoughts and ideas. Create your first note to get started.'
            }
          </p>
          
          <a href="/create" className="btn-primary inline-flex items-center space-x-2">
            <PenTool className="h-5 w-5" />
            <span>Create Your First Note</span>
          </a>
        </div>
      ) : (
        <>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {notes.map((note, index) => (
              <div 
                key={note.id} 
                className="animate-fade-in" 
                style={{ animationDelay: `${index * 0.05}s` }}
                ref={index === notes.length - 1 ? lastElementRef : null}
              >
                <NoteCard
                  note={note}
                  onDelete={handleDeleteNote}
                />
              </div>
            ))}
          </div>
          
          {/* Loading indicator for infinite scroll */}
          {(isFetching || loading) && (
            <div className="flex justify-center py-8">
              <div className="flex items-center space-x-2 text-neutral-600">
                <Loader2 className="h-5 w-5 animate-spin" />
                <span>Loading more notes...</span>
              </div>
            </div>
          )}
          
          {/* End of results indicator */}
          {!pagination.hasMore && notes.length > 0 && (
            <div className="text-center py-8">
              <div className="inline-flex items-center space-x-2 text-neutral-500 bg-neutral-100 px-4 py-2 rounded-full text-sm">
                <StickyNote className="h-4 w-4" />
                <span>You've reached the end of your notes</span>
              </div>
            </div>
          )}
        </>
      )}
      
      {/* Floating Action Button for mobile */}
      <a href="/create" className="floating-action md:hidden">
        <PenTool className="h-6 w-6" />
      </a>
    </div>
  )
}