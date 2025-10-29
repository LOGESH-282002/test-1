'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'react-hot-toast'
import { useAuth } from '@/contexts/AuthContext'
import { Save, X, Eye, Type, FileText } from 'lucide-react'

export default function PostForm({ post, onSubmit, isEditing = false }) {
  const { token } = useAuth()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showPreview, setShowPreview] = useState(false)
  
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: {
      title: post?.title || '',
      content: post?.content || '',
    },
  })

  const watchedTitle = watch('title')
  const watchedContent = watch('content')

  const onFormSubmit = async (data) => {
    if (!token) {
      toast.error('Please login to continue')
      return
    }

    setIsSubmitting(true)
    
    try {
      const url = isEditing ? `/api/posts/${post.id}` : '/api/posts'
      const method = isEditing ? 'PUT' : 'POST'
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      })

      const result = await response.json()

      if (!response.ok) {
        if (response.status === 401) {
          toast.error('Session expired. Please login again.')
        } else {
          toast.error(result.error || 'Failed to save post')
        }
        return
      }

      toast.success(isEditing ? 'Story updated successfully!' : 'Story published successfully!')
      onSubmit(result.post)
    } catch (error) {
      toast.error(error.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  const getWordCount = (text) => {
    return text ? text.trim().split(/\s+/).length : 0
  }

  const getReadingTime = (text) => {
    const wordsPerMinute = 200
    const wordCount = getWordCount(text)
    const readingTime = Math.ceil(wordCount / wordsPerMinute)
    return readingTime < 1 ? '1 min' : `${readingTime} min`
  }

  return (
    <div className="space-y-6">
      {/* Header with stats */}
      <div className="flex items-center justify-between p-4 bg-gradient-to-r from-primary-50 to-secondary-50 rounded-xl border border-primary-100">
        <div className="flex items-center space-x-6">
          <div className="flex items-center space-x-2 text-neutral-600">
            <Type className="h-4 w-4" />
            <span className="text-sm font-medium">{getWordCount(watchedContent)} words</span>
          </div>
          <div className="flex items-center space-x-2 text-neutral-600">
            <FileText className="h-4 w-4" />
            <span className="text-sm font-medium">{getReadingTime(watchedContent)} read</span>
          </div>
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

      {showPreview ? (
        /* Preview Mode */
        <div className="card">
          <div className="prose max-w-none">
            <h1>{watchedTitle || 'Untitled Story'}</h1>
            <div className="whitespace-pre-wrap">
              {watchedContent || 'Start writing your story...'}
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
                  Story Title
                </label>
                <input
                  type="text"
                  id="title"
                  {...register('title', {
                    required: 'Title is required',
                    minLength: {
                      value: 3,
                      message: 'Title must be at least 3 characters long',
                    },
                    maxLength: {
                      value: 100,
                      message: 'Title must be less than 100 characters',
                    },
                  })}
                  className="input-field text-lg font-medium"
                  placeholder="Give your story a compelling title..."
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
                  Your Story
                </label>
                <textarea
                  id="content"
                  rows={16}
                  {...register('content', {
                    required: 'Content is required',
                    minLength: {
                      value: 50,
                      message: 'Content must be at least 50 characters long',
                    },
                  })}
                  className="input-field resize-none font-mono text-base leading-relaxed"
                  placeholder="Once upon a time... or however you'd like to begin your story. Let your creativity flow!"
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
            
            <div className="flex items-center space-x-3">
              
              
              <button
                type="submit"
                className="btn-primary flex items-center space-x-2"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>{isEditing ? 'Updating...' : 'Publishing...'}</span>
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    <span>{isEditing ? 'Update Story' : 'Publish Story'}</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      )}
    </div>
  )
}