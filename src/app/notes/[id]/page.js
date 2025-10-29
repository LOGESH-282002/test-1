'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { toast } from 'react-hot-toast'
import { useAuth } from '@/contexts/AuthContext'
import { Calendar, User, Edit, Trash2, Share2, ArrowLeft, Lock, Globe, FileText, Clock, Shield, Tag, Folder } from 'lucide-react'
import Link from 'next/link'
import { decryptText, getOrCreateEncryptionKey } from '@/lib/encryption'

export default function NotePage() {
    const params = useParams()
    const router = useRouter()
    const { token, user } = useAuth()
    const [note, setNote] = useState(null)
    const [loading, setLoading] = useState(true)
    const [decryptedContent, setDecryptedContent] = useState('')

    useEffect(() => {
        fetchNote()
    }, [params.id])

    const fetchNote = async () => {
        try {
            const headers = {}
            if (token) {
                headers['Authorization'] = `Bearer ${token}`
            }

            const response = await fetch(`/api/notes/${params.id}`, { headers })
            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.error || 'Failed to fetch note')
            }

            setNote(data.note)

            // Decrypt content if encrypted
            if (data.note.is_encrypted && data.note.encrypted_content) {
                try {
                    const key = await getOrCreateEncryptionKey()
                    if (key) {
                        const decrypted = await decryptText(data.note.encrypted_content, key)
                        setDecryptedContent(decrypted)
                    }
                } catch (error) {
                    console.error('Failed to decrypt note:', error)
                    toast.error('Failed to decrypt note content')
                }
            }
        } catch (error) {
            toast.error(error.message)
            router.push('/')
        } finally {
            setLoading(false)
        }
    }

    const handleDelete = async () => {
        if (!token) {
            toast.error('Please login to delete notes')
            return
        }

        const confirmed = window.confirm(
            'Are you sure you want to delete this note? This action cannot be undone.'
        )

        if (!confirmed) return

        try {
            const response = await fetch(`/api/notes/${note.id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            })

            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.error || 'Failed to delete note')
            }

            toast.success('Note deleted successfully')
            router.push('/')
        } catch (error) {
            toast.error(error.message)
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
    }

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        })
    }

    const isAuthor = user && note && user.id === note.users.id

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-96">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-4 border-primary-200 border-t-primary-600 mx-auto mb-4"></div>
                    <p className="text-neutral-600 animate-pulse">Loading note...</p>
                </div>
            </div>
        )
    }

    if (!note) {
        return (
            <div className="text-center py-20">
                <h1 className="text-2xl font-bold text-neutral-900 mb-4">Note not found</h1>
                <p className="text-neutral-600 mb-8">The note you're looking for doesn't exist or you don't have access to it.</p>
                <Link href="/" className="btn-primary">
                    Go Home
                </Link>
            </div>
        )
    }

    const getStatusIcon = () => {
        if (note.is_draft) {
            return <FileText className="h-5 w-5 text-amber-500" title="Draft" />
        }
        if (note.is_public) {
            return <Globe className="h-5 w-5 text-green-500" title="Public" />
        }
        if (note.is_encrypted) {
            return <Lock className="h-5 w-5 text-blue-500" title="Encrypted" />
        }
        return <Lock className="h-5 w-5 text-neutral-500" title="Private" />
    }

    const getContent = () => {
        if (note.is_encrypted) {
            if (decryptedContent) {
                return decryptedContent
            }
            return (
                <div className="flex items-center space-x-2 text-neutral-500 bg-neutral-100 p-6 rounded-lg">
                    <Shield className="h-6 w-6" />
                    <span>This note is encrypted and cannot be displayed</span>
                </div>
            )
        }
        return note.content || 'No content'
    }

    return (
        <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="mb-8">
                <Link
                    href="/"
                    className="inline-flex items-center space-x-2 text-neutral-600 hover:text-primary-600 transition-colors mb-6"
                >
                    <ArrowLeft className="h-4 w-4" />
                    <span>Back to notes</span>
                </Link>

                <div className="flex items-start justify-between">
                    <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-4">
                            {getStatusIcon()}
                            <span className="text-sm text-neutral-500">
                                {note.is_draft ? 'Draft' : note.is_public ? 'Public' : 'Private'}
                            </span>
                            {note.is_encrypted && (
                                <span className="text-sm text-blue-600 bg-blue-100 px-2 py-1 rounded-full">
                                    Encrypted
                                </span>
                            )}
                        </div>

                        <h1 className="text-4xl font-bold text-neutral-900 mb-4">
                            {note.title || 'Untitled Note'}
                        </h1>

                        <div className="flex flex-wrap items-center gap-4 text-neutral-600 mb-6">
                            <div className="flex items-center space-x-2">
                                <User className="h-4 w-4" />
                                <span>{note.users.name}</span>
                            </div>
                            <div className="flex items-center space-x-2">
                                <Calendar className="h-4 w-4" />
                                <span>Created {formatDate(note.created_at)}</span>
                            </div>
                            {note.updated_at !== note.created_at && (
                                <div className="flex items-center space-x-2">
                                    <Clock className="h-4 w-4" />
                                    <span>Updated {formatDate(note.updated_at)}</span>
                                </div>
                            )}
                        </div>

                        {/* Category and Labels */}
                        <div className="flex flex-wrap items-center gap-4 mb-6">
                            {note.categories && (
                                <div className="flex items-center space-x-2">
                                    <div
                                        className="w-6 h-6 rounded-lg flex items-center justify-center"
                                        style={{ backgroundColor: note.categories.color }}
                                    >
                                        <Folder className="h-3 w-3 text-white" />
                                    </div>
                                    <span className="text-sm font-medium text-neutral-700">
                                        {note.categories.name}
                                    </span>
                                </div>
                            )}

                            {note.note_labels && note.note_labels.length > 0 && (
                                <div className="flex flex-wrap gap-2">
                                    {note.note_labels.map((noteLabel, index) => (
                                        <span
                                            key={index}
                                            className="inline-flex items-center space-x-1 px-3 py-1 rounded-full text-sm font-medium text-white"
                                            style={{ backgroundColor: noteLabel.labels.color }}
                                        >
                                            <Tag className="h-3 w-3" />
                                            <span>{noteLabel.labels.name}</span>
                                        </span>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {isAuthor && (
                        <div className="flex items-center space-x-2 ml-6">
                            <Link
                                href={`/notes/${note.id}/edit`}
                                className="btn-secondary flex items-center space-x-2"
                            >
                                <Edit className="h-4 w-4" />
                                <span>Edit</span>
                            </Link>

                            {note.is_public && note.public_link_id && (
                                <button
                                    onClick={handleShare}
                                    className="btn-secondary flex items-center space-x-2"
                                >
                                    <Share2 className="h-4 w-4" />
                                    <span>Share</span>
                                </button>
                            )}

                            <button
                                onClick={handleDelete}
                                className="btn-danger flex items-center space-x-2"
                            >
                                <Trash2 className="h-4 w-4" />
                                <span>Delete</span>
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Content */}
            <div className="card">
                <div className="prose max-w-none">
                    <div className="whitespace-pre-wrap text-neutral-800 leading-relaxed">
                        {getContent()}
                    </div>
                </div>
            </div>
        </div>
    )
}