'use client'

import Link from 'next/link'
import { Calendar, User, Edit, Trash2, Share2, MoreVertical, Lock, Globe, FileText, Clock, Tag, Folder } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { useState } from 'react'
import { toast } from 'react-hot-toast'

export default function NoteCard({ note, onDelete }) {
  const { user } = useAuth()
  const isAuthor = user && user.id === note.users.id
  const [showActions, setShowActions] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  const formatTime = (dateString) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const handleDelete = async () => {
    const confirmed = window.confirm(
      'Are you sure you want to delete this note? This action cannot be undone.'
    )
    
    if (confirmed) {
      setIsDeleting(true)
      try {
        await onDelete(note.id)
      } catch (error) {
        setIsDeleting(false)
      }
    }
  }

  const handleShare = async () => {
    if (note.is_public && note.public_link_id) {
      const shareUrl = `${window.location.origin}/notes/${note.public_link_id}`
      try {
        await navigator.clipboard.writeText(shareUrl)
        toast.success('Public link copied to clipboard!')
      } catch (error) {
        toast.error('Failed to copy link')
      }
    } else {
      toast.error('This note is not public')
    }
    setShowActions(false)
  }

  const getPreview = (content) => {
    if (!content) return 'No content'
    return content.length > 150 ? content.substring(0, 150) + '...' : content
  }

  const getStatusIcon = () => {
    if (note.is_draft) {
      return <FileText className="h-4 w-4 text-amber-500" title="Draft" />
    }
    if (note.is_public) {
      return <Globe className="h-4 w-4 text-green-500" title="Public" />
    }
    if (note.is_encrypted) {
      return <Lock className="h-4 w-4 text-blue-500" title="Encrypted" />
    }
    return <Lock className="h-4 w-4 text-neutral-500" title="Private" />
  }

  return (
    <article className={`card card-hover group relative overflow-hidden touch-manipulation ${isDeleting ? 'opacity-50 pointer-events-none' : ''}`}>
      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary-50/50 to-secondary-50/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
      
      <div className="relative z-10">
        {/* Header with status and actions */}
        <div className="flex items-center justify-between mb-3 sm:mb-4">
          <div className="flex items-center space-x-2 sm:space-x-3 flex-1 min-w-0">
            <div className="h-6 w-6 sm:h-8 sm:w-8 bg-gradient-to-r from-primary-600 to-secondary-600 rounded-lg flex items-center justify-center flex-shrink-0">
              <User className="h-3 w-3 sm:h-4 sm:w-4 text-white" />
            </div>
            <div className="flex items-center space-x-1.5 sm:space-x-2 min-w-0">
              {getStatusIcon()}
              <span className="text-xs text-neutral-500 truncate">
                {note.is_draft ? 'Draft' : note.is_public ? 'Public' : 'Private'}
              </span>
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
                    href={`/notes/${note.id}/edit`}
                    className="flex items-center space-x-2 px-4 py-2 text-neutral-700 hover:bg-neutral-50 transition-colors"
                    onClick={() => setShowActions(false)}
                  >
                    <Edit className="h-4 w-4" />
                    <span>Edit Note</span>
                  </Link>
                  {note.is_public && note.public_link_id && (
                    <button
                      onClick={handleShare}
                      className="flex items-center space-x-2 px-4 py-2 text-neutral-700 hover:bg-neutral-50 transition-colors w-full text-left"
                    >
                      <Share2 className="h-4 w-4" />
                      <span>Copy Public Link</span>
                    </button>
                  )}
                  <button
                    onClick={handleDelete}
                    className="flex items-center space-x-2 px-4 py-2 text-red-600 hover:bg-red-50 transition-colors w-full text-left"
                  >
                    <Trash2 className="h-4 w-4" />
                    <span>Delete Note</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Category */}
        {note.categories && (
          <div className="flex items-center space-x-2 mb-3">
            <div 
              className="w-6 h-6 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: note.categories.color }}
            >
              <Folder className="h-3 w-3 text-white" />
            </div>
            <span className="text-xs font-medium text-neutral-600">
              {note.categories.name}
            </span>
          </div>
        )}

        {/* Note title and preview */}
        <Link href={`/notes/${note.id}`} className="block group/link">
          <h2 className="text-lg font-bold text-neutral-900 group-hover/link:text-primary-600 transition-colors duration-200 mb-3 line-clamp-2">
            {note.title || 'Untitled Note'}
          </h2>
          
          <p className="text-neutral-600 mb-4 leading-relaxed line-clamp-4 text-sm">
            {note.is_encrypted && !note.content ? 
              '🔒 This note is encrypted' : 
              getPreview(note.content)
            }
          </p>
        </Link>

        {/* Labels */}
        {note.note_labels && note.note_labels.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-4">
            {note.note_labels.slice(0, 3).map((noteLabel, index) => (
              <span
                key={index}
                className="inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium text-white"
                style={{ backgroundColor: noteLabel.labels.color }}
              >
                <Tag className="h-2 w-2" />
                <span>{noteLabel.labels.name}</span>
              </span>
            ))}
            {note.note_labels.length > 3 && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-neutral-200 text-neutral-600">
                +{note.note_labels.length - 3} more
              </span>
            )}
          </div>
        )}

        {/* Footer with timestamps */}
        <div className="flex items-center justify-between text-xs text-neutral-500">
          <div className="flex items-center space-x-1">
            <Calendar className="h-3 w-3" />
            <span>{formatDate(note.created_at)}</span>
          </div>
          
          {note.last_autosave && new Date(note.last_autosave) > new Date(note.updated_at) && (
            <div className="flex items-center space-x-1 text-amber-600">
              <Clock className="h-3 w-3" />
              <span>Autosaved {formatTime(note.last_autosave)}</span>
            </div>
          )}
          
          <Link 
            href={`/notes/${note.id}`}
            className="inline-flex items-center text-primary-600 hover:text-primary-700 font-semibold transition-colors group/read"
          >
            <span>Open</span>
            <svg className="ml-1 h-3 w-3 transform group-hover/read:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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