'use client'

import { Sparkles, StickyNote } from 'lucide-react'

export default function Logo({ size = 'default', showText = true }) {
  const sizeClasses = {
    small: 'h-6 w-6',
    default: 'h-8 w-8',
    large: 'h-12 w-12',
    xl: 'h-16 w-16'
  }

  const textSizeClasses = {
    small: 'text-lg',
    default: 'text-xl',
    large: 'text-2xl',
    xl: 'text-4xl'
  }

  return (
    <div className="flex items-center space-x-2">
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-primary-600 to-secondary-600 rounded-lg blur-sm opacity-75"></div>
        <div className="relative bg-gradient-to-r from-primary-600 to-secondary-600 p-2 rounded-lg">
          <StickyNote className={`${sizeClasses[size]} text-white`} />
        </div>
        <Sparkles className="absolute -top-1 -right-1 h-3 w-3 text-accent-500 animate-bounce-gentle" />
      </div>
      
      {showText && (
        <div className="flex flex-col">
          <span className={`${textSizeClasses[size]} font-bold gradient-text`}>
            NotesApp
          </span>
          <span className="text-xs text-neutral-500 -mt-1">
            Secure note-taking
          </span>
        </div>
      )}
    </div>
  )
}