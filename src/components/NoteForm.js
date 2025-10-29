'use client'

import { useState, useEffect, useCallback } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'react-hot-toast'
import { useAuth } from '@/contexts/AuthContext'
import { Save, X, Eye, Type, FileText, Lock, Globe, Clock, Shield } from 'lucide-react'
import { encryptText, decryptText, getOrCreateEncryptionKey } from '@/lib/encryption'
import LabelSelector from './LabelSelector'
import CategorySelector from './CategorySelector'

export default function NoteForm({ note, onSubmit, isEditing = false }) {
  const { token } = useAuth()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showPreview, setShowPreview] = useState(false)
  const [isEncrypted, setIsEncrypted] = useState(note?.is_encrypted || false)
  const [isPublic, setIsPublic] = useState(note?.is_public || false)
  const [isDraft, setIsDraft] = useState(note?.is_draft !== false)
  const [lastAutosave, setLastAutosave] = useState(null)
  const [encryptionKey, setEncryptionKey] = useState(null)
  const [currentNoteId, setCurrentNoteId] = useState(note?.id || null)
  const [selectedCategory, setSelectedCategory] = useState(note?.categories?.id || null)
  const [selectedLabels, setSelectedLabels] = useState(
    note?.note_labels?.map(nl => nl.labels.id) || []
  )
  
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm({
    defaultValues: {
      title: note?.title || '',
      content: note?.content || '',
    },
  })

  const watchedTitle = watch('title')
  const watchedContent = watch('content')

  // Initialize encryption key
  useEffect(() => {
    const initEncryption = async () => {
      const key = await getOrCreateEncryptionKey()
      setEncryptionKey(key)
      
      // Decrypt content if note is encrypted
      if (note?.is_encrypted && note?.encrypted_content && key) {
        try {
          const decryptedContent = await decryptText(note.encrypted_content, key)
          setValue('content', decryptedContent)
        } catch (error) {
          console.error('Failed to decrypt note:', error)
          toast.error('Failed to decrypt note content')
        }
      }
    }
    
    initEncryption()
  }, [note, setValue])

  // Autosave functionality
  const autosave = useCallback(async (title, content) => {
    if (!token || (!title.trim() && !content.trim())) return

    try {
      let encryptedContent = null
      let finalContent = content

      if (isEncrypted && encryptionKey) {
        encryptedContent = await encryptText(content, encryptionKey)
        finalContent = '' // Don't store plain text if encrypted
      }

      const response = await fetch('/api/notes/autosave', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          id: currentNoteId,
          title: title || 'Untitled Note',
          content: finalContent,
          encrypted_content: encryptedContent,
          is_encrypted: isEncrypted,
        }),
      })

      const result = await response.json()

      if (response.ok) {
        setLastAutosave(new Date())
        if (!currentNoteId) {
          setCurrentNoteId(result.note.id)
        }
      }
    } catch (error) {
      console.error('Autosave failed:', error)
    }
  }, [token, currentNoteId, isEncrypted, encryptionKey])

  // Debounced autosave
  useEffect(() => {
    const timer = setTimeout(() => {
      autosave(watchedTitle, watchedContent)
    }, 2000) // Autosave after 2 seconds of inactivity

    return () => clearTimeout(timer)
  }, [watchedTitle, watchedContent, autosave])

  const onFormSubmit = async (data) => {
    if (!token) {
      toast.error('Please login to continue')
      return
    }

    setIsSubmitting(true)
    
    try {
      let encryptedContent = null
      let finalContent = data.content

      if (isEncrypted && encryptionKey) {
        encryptedContent = await encryptText(data.content, encryptionKey)
        finalContent = '' // Don't store plain text if encrypted
      }

      const url = isEditing ? `/api/notes/${note.id}` : '/api/notes'
      const method = isEditing ? 'PUT' : 'POST'
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: data.title || 'Untitled Note',
          content: finalContent,
          encrypted_content: encryptedContent,
          is_encrypted: isEncrypted,
          is_public: isPublic,
          is_draft: isDraft,
          category_id: selectedCategory,
          label_ids: selectedLabels,
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        if (response.status === 401) {
          toast.error('Session expired. Please login again.')
        } else {
          toast.error(result.error || 'Failed to save note')
        }
        return
      }

      toast.success(isEditing ? 'Note updated successfully!' : 'Note saved successfully!')
      onSubmit(result.note)
    } catch (error) {
      toast.error(error.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  const getWordCount = (text) => {
    return text ? text.trim().split(/\s+/).length : 0
  }

  const getCharCount = (text) => {
    return text ? text.length : 0
  }

  return (
    <div className="space-y-6">
      {/* Header with stats and controls */}
      <div className="flex items-center justify-between p-4 bg-gradient-to-r from-primary-50 to-secondary-50 rounded-xl border border-primary-100">
        <div className="flex items-center space-x-6">
          <div className="flex items-center space-x-2 text-neutral-600">
            <Type className="h-4 w-4" />
            <span className="text-sm font-medium">{getWordCount(watchedContent)} words</span>
          </div>
          <div className="flex items-center space-x-2 text-neutral-600">
            <FileText className="h-4 w-4" />
            <span className="text-sm font-medium">{getCharCount(watchedContent)} chars</span>
          </div>
          {lastAutosave && (
            <div className="flex items-center space-x-2 text-green-600">
              <Clock className="h-4 w-4" />
              <span className="text-sm font-medium">
                Saved {lastAutosave.toLocaleTimeString()}
              </span>
            </div>
          )}
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            type="button"
            onClick={() => setShowPreview(!showPreview)}
            className={`btn-ghost flex items-center space-x-2 ${showPreview ? 'bg-primary-100 text-primary-700' : ''}`}
          >
            <Eye className="h-4 w-4" />
            <span>{showPreview ? 'Edit' : 'Preview'}</span>
          </button>
        </div>
      </div>

      {/* Settings */}
      <div className="grid md:grid-cols-3 gap-4">
        <div className="flex items-center space-x-3 p-3 bg-neutral-50 rounded-lg">
          <input
            type="checkbox"
            id="isDraft"
            checked={isDraft}
            onChange={(e) => setIsDraft(e.target.checked)}
            className="rounded border-neutral-300 text-primary-600 focus:ring-primary-500"
          />
          <label htmlFor="isDraft" className="flex items-center space-x-2 text-sm font-medium text-neutral-700">
            <FileText className="h-4 w-4" />
            <span>Save as Draft</span>
          </label>
        </div>

        <div className="flex items-center space-x-3 p-3 bg-neutral-50 rounded-lg">
          <input
            type="checkbox"
            id="isPublic"
            checked={isPublic}
            onChange={(e) => setIsPublic(e.target.checked)}
            disabled={isDraft}
            className="rounded border-neutral-300 text-primary-600 focus:ring-primary-500 disabled:opacity-50"
          />
          <label htmlFor="isPublic" className="flex items-center space-x-2 text-sm font-medium text-neutral-700">
            <Globe className="h-4 w-4" />
            <span>Make Public</span>
          </label>
        </div>

        <div className="flex items-center space-x-3 p-3 bg-neutral-50 rounded-lg">
          <input
            type="checkbox"
            id="isEncrypted"
            checked={isEncrypted}
            onChange={(e) => setIsEncrypted(e.target.checked)}
            className="rounded border-neutral-300 text-primary-600 focus:ring-primary-500"
          />
          <label htmlFor="isEncrypted" className="flex items-center space-x-2 text-sm font-medium text-neutral-700">
            <Lock className="h-4 w-4" />
            <span>Encrypt Content</span>
          </label>
        </div>
      </div>

      {/* Organization */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="card">
          <CategorySelector
            selectedCategory={selectedCategory}
            onCategoryChange={setSelectedCategory}
            disabled={isSubmitting}
          />
        </div>
        
        <div className="card">
          <LabelSelector
            selectedLabels={selectedLabels}
            onLabelsChange={setSelectedLabels}
            disabled={isSubmitting}
          />
        </div>
      </div>

      {showPreview ? (
        /* Preview Mode */
        <div className="card">
          <div className="prose max-w-none">
            <h1>{watchedTitle || 'Untitled Note'}</h1>
            <div className="whitespace-pre-wrap">
              {isEncrypted ? (
                <div className="flex items-center space-x-2 text-neutral-500 bg-neutral-100 p-4 rounded-lg">
                  <Shield className="h-5 w-5" />
                  <span>This note will be encrypted when saved</span>
                </div>
              ) : (
                watchedContent || 'Start writing your note...'
              )}
            </div>
          </div>
        </div>
      ) : (
        /* Edit Mode */
        <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
          <div className="card">
            <div className="space-y-6">
              <div>
                <label htmlFor="title" className="block text-sm font-semibold text-neutral-800 mb-3">
                  Note Title
                </label>
                <input
                  type="text"
                  id="title"
                  {...register('title', {
                    maxLength: {
                      value: 500,
                      message: 'Title must be less than 500 characters',
                    },
                  })}
                  className="input-field text-lg font-medium"
                  placeholder="Give your note a title..."
                />
                {errors.title && (
                  <p className="mt-2 text-sm text-red-600 flex items-center space-x-1">
                    <X className="h-4 w-4" />
                    <span>{errors.title.message}</span>
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="content" className="block text-sm font-semibold text-neutral-800 mb-3">
                  Content
                </label>
                <textarea
                  id="content"
                  rows={16}
                  {...register('content', {
                    maxLength: {
                      value: 50000,
                      message: 'Content must be less than 50,000 characters',
                    },
                  })}
                  className="input-field resize-none font-mono text-base leading-relaxed"
                  placeholder="Start writing your note... Your content will be automatically saved as you type."
                />
                {errors.content && (
                  <p className="mt-2 text-sm text-red-600 flex items-center space-x-1">
                    <X className="h-4 w-4" />
                    <span>{errors.content.message}</span>
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() => window.history.back()}
              className="btn-secondary flex items-center space-x-2"
              disabled={isSubmitting}
            >
              <X className="h-4 w-4" />
              <span>Cancel</span>
            </button>
            
            <button
              type="submit"
              className="btn-primary flex items-center space-x-2"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>{isEditing ? 'Updating...' : 'Saving...'}</span>
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  <span>{isEditing ? 'Update Note' : 'Save Note'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      )}
    </div>
  )
}