'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { toast } from 'react-hot-toast'
import { useAuth } from '@/contexts/AuthContext'
import NoteForm from '@/components/NoteForm'
import { ArrowLeft, Edit } from 'lucide-react'
import Link from 'next/link'

export default function EditNotePage() {
  const params = useParams()
  const router = useRouter()
  const { token, user, loading } = useAuth()
  const [note, setNote] = useState(null)
  const [noteLoading, setNoteLoading] = useState(true)

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login')
      return
    }
    
    if (user) {
      fetchNote()
    }
  }, [user, loading, params.id])

  const fetchNote = async () => {
    try {
      const response = await fetch(`/api/notes/${params.id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })
      
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch note')
      }

      // Check if user owns this note
      if (data.note.users.id !== user.id) {
        toast.error('You can only edit your own notes')
        router.push('/')
        return
      }

      setNote(data.note)
    } catch (error) {
      toast.error(error.message)
      router.push('/')
    } finally {
      setNoteLoading(false)
    }
  }

  const handleNoteUpdated = (updatedNote) => {
    router.push(`/notes/${updatedNote.id}`)
  }

  if (loading || noteLoading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-primary-200 border-t-primary-600 mx-auto mb-4"></div>
          <p className="text-neutral-600 animate-pulse">Loading note...</p>
        </div>
      </div>
    )
  }

  if (!user || !note) {
    return null
  }

  return (
    <div className="max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <Link 
          href={`/notes/${note.id}`}
          className="inline-flex items-center space-x-2 text-neutral-600 hover:text-primary-600 transition-colors mb-6"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to note</span>
        </Link>
        
        <div className="flex items-center space-x-4 mb-6">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-primary-600 to-secondary-600 rounded-xl blur-sm opacity-75"></div>
            <div className="relative bg-gradient-to-r from-primary-600 to-secondary-600 p-3 rounded-xl">
              <Edit className="h-8 w-8 text-white" />
            </div>
          </div>
          
          <div>
            <h1 className="text-4xl font-bold gradient-text">Edit Note</h1>
            <p className="text-neutral-600 mt-2">
              Update your note content and settings
            </p>
          </div>
        </div>
      </div>

      {/* Form */}
      <NoteForm note={note} onSubmit={handleNoteUpdated} isEditing={true} />
    </div>
  )
}