'use client'

import Link from 'next/link'
import { Calendar, User, Edit, Trash2, Heart, MessageCircle, Share2, MoreVertical } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { useState } from 'react'

export default function PostCard({ post, onDelete }) {
  const { user } = useAuth()
  const isAuthor = user && user.id === post.users.id
  const [showActions, setShowActions] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  const handleDelete = async () => {
    const confirmed = window.confirm(
      'Are you sure you want to delete this post? This action cannot be undone.'
    )
    
    if (confirmed) {
      setIsDeleting(true)
      try {
        await onDelete(post.id)
      } catch (error) {
        setIsDeleting(false)
      }
    }
  }

  const getReadingTime = (content) => {
    const wordsPerMinute = 200
    const wordCount = content?.split(' ').length || 0
    const readingTime = Math.ceil(wordCount / wordsPerMinute)
    return readingTime < 1 ? '1 min read' : `${readingTime} min read`
  }

  return (
    <article className={`card card-hover group relative overflow-hidden ${isDeleting ? 'opacity-50 pointer-events-none' : ''}`}>
      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary-50/50 to-secondary-50/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
      
      <div className="relative z-10">
        {/* Header with author info and actions */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 bg-gradient-to-r from-primary-600 to-secondary-600 rounded-full flex items-center justify-center">
              <User className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="font-medium text-neutral-800">{post.users.name}</p>
              <div className="flex items-center space-x-2 text-sm text-neutral-500">
                <span>{formatDate(post.created_at)}</span>
                <span>•</span>
                <span>{getReadingTime(post.content)}</span>
              </div>
            </div>
          </div>
          
          {isAuthor && (
            <div className="relative">
              <button
                onClick={() => setShowActions(!showActions)}
                className="p-2 text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100 rounded-lg transition-all duration-200"
              >
                <MoreVertical className="h-4 w-4" />
              </button>
              
              {showActions && (
                <div className="absolute right-0 top-full mt-2 bg-white rounded-xl shadow-strong border border-neutral-200 py-2 min-w-[160px] z-20">
                  <Link 
                    href={`/posts/${post.id}/edit`}
                    className="flex items-center space-x-2 px-4 py-2 text-neutral-700 hover:bg-neutral-50 transition-colors"
                    onClick={() => setShowActions(false)}
                  >
                    <Edit className="h-4 w-4" />
                    <span>Edit Post</span>
                  </Link>
                  <button
                    onClick={handleDelete}
                    className="flex items-center space-x-2 px-4 py-2 text-red-600 hover:bg-red-50 transition-colors w-full text-left"
                  >
                    <Trash2 className="h-4 w-4" />
                    <span>Delete Post</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Post title and excerpt */}
        <Link href={`/posts/${post.id}`} className="block group/link">
          <h2 className="text-xl font-bold text-neutral-900 group-hover/link:text-primary-600 transition-colors duration-200 mb-3 line-clamp-2">
            {post.title}
          </h2>
          
          <p className="text-neutral-600 mb-6 leading-relaxed line-clamp-3">
            {post.excerpt}
          </p>
        </Link>

        {/* Footer with engagement and read more */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button className="flex items-center space-x-1 text-neutral-500 hover:text-red-500 transition-colors group/heart">
              <Heart className="h-4 w-4 group-hover/heart:fill-current" />
              <span className="text-sm">24</span>
            </button>
            
            <button className="flex items-center space-x-1 text-neutral-500 hover:text-primary-600 transition-colors">
              <MessageCircle className="h-4 w-4" />
              <span className="text-sm">8</span>
            </button>
            
            <button className="flex items-center space-x-1 text-neutral-500 hover:text-accent-600 transition-colors">
              <Share2 className="h-4 w-4" />
            </button>
          </div>
          
          <Link 
            href={`/posts/${post.id}`}
            className="inline-flex items-center text-primary-600 hover:text-primary-700 font-semibold text-sm transition-colors group/read"
          >
            <span>Read Story</span>
            <svg className="ml-1 h-4 w-4 transform group-hover/read:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </div>
      
      {isDeleting && (
        <div className="absolute inset-0 bg-white/80 flex items-center justify-center z-20">
          <div className="flex items-center space-x-2 text-neutral-600">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary-600"></div>
            <span>Deleting...</span>
          </div>
        </div>
      )}
    </article>
  )
}