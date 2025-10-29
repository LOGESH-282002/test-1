'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import NoteForm from '@/components/NoteForm'
import { PenTool, Sparkles, Lightbulb, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default function CreateNotePage() {
  const router = useRouter()
  const { user, loading } = useAuth()

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login')
    }
  }, [user, loading, router])

  const handleNoteCreated = (note) => {
    router.push(`/notes/${note.id}`)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="relative inline-block mb-4">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-primary-200 border-t-primary-600"></div>
            <Sparkles className="absolute inset-0 m-auto h-6 w-6 text-primary-600 animate-pulse" />
          </div>
          <p className="text-neutral-600 animate-pulse">Preparing your canvas...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <Link 
          href="/"
          className="inline-flex items-center space-x-2 text-neutral-600 hover:text-primary-600 transition-colors mb-6"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to home</span>
        </Link>
        
        <div className="flex items-center space-x-4 mb-6">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-primary-600 to-secondary-600 rounded-xl blur-sm opacity-75"></div>
            <div className="relative bg-gradient-to-r from-primary-600 to-secondary-600 p-3 rounded-xl">
              <PenTool className="h-8 w-8 text-white" />
            </div>
          </div>
          
          <div>
            <h1 className="text-4xl font-bold gradient-text">Create New Note</h1>
            <p className="text-neutral-600 mt-2">
              Capture your thoughts, ideas, and memories
            </p>
          </div>
        </div>
        
        {/* Note tips */}
        <div className="grid md:grid-cols-3 gap-4 mb-8">
          <div className="bg-gradient-to-br from-primary-50 to-primary-100 p-4 rounded-xl border border-primary-200">
            <div className="flex items-center space-x-2 mb-2">
              <Lightbulb className="h-5 w-5 text-primary-600" />
              <h3 className="font-semibold text-primary-800">Auto-Save</h3>
            </div>
            <p className="text-sm text-primary-700">Your notes are automatically saved as you type.</p>
          </div>
          
          <div className="bg-gradient-to-br from-secondary-50 to-secondary-100 p-4 rounded-xl border border-secondary-200">
            <div className="flex items-center space-x-2 mb-2">
              <Sparkles className="h-5 w-5 text-secondary-600" />
              <h3 className="font-semibold text-secondary-800">Stay Private</h3>
            </div>
            <p className="text-sm text-secondary-700">Notes are private by default. Share only when you choose.</p>
          </div>
          
          <div className="bg-gradient-to-br from-accent-50 to-accent-100 p-4 rounded-xl border border-accent-200">
            <div className="flex items-center space-x-2 mb-2">
              <PenTool className="h-5 w-5 text-accent-600" />
              <h3 className="font-semibold text-accent-800">Encrypt Sensitive</h3>
            </div>
            <p className="text-sm text-accent-700">Enable encryption for sensitive or personal notes.</p>
          </div>
        </div>
      </div>

      {/* Form */}
      <NoteForm onSubmit={handleNoteCreated} />
    </div>
  )
}