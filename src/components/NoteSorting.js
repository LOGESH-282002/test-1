'use client'

import { useState } from 'react'
import { ArrowUpDown, ArrowUp, ArrowDown, Calendar, Clock, SortAsc } from 'lucide-react'

const SORT_OPTIONS = [
  {
    key: 'updated_desc',
    label: 'Last Updated (Newest)',
    icon: Clock,
    field: 'updated_at',
    direction: 'desc'
  },
  {
    key: 'updated_asc',
    label: 'Last Updated (Oldest)',
    icon: Clock,
    field: 'updated_at',
    direction: 'asc'
  },
  {
    key: 'created_desc',
    label: 'Date Created (Newest)',
    icon: Calendar,
    field: 'created_at',
    direction: 'desc'
  },
  {
    key: 'created_asc',
    label: 'Date Created (Oldest)',
    icon: Calendar,
    field: 'created_at',
    direction: 'asc'
  },
  {
    key: 'title_asc',
    label: 'Title (A-Z)',
    icon: SortAsc,
    field: 'title',
    direction: 'asc'
  },
  {
    key: 'title_desc',
    label: 'Title (Z-A)',
    icon: SortAsc,
    field: 'title',
    direction: 'desc'
  }
]

export default function NoteSorting({ currentSort = 'updated_desc', onSortChange }) {
  const [isOpen, setIsOpen] = useState(false)

  const currentSortOption = SORT_OPTIONS.find(option => option.key === currentSort) || SORT_OPTIONS[0]
  const IconComponent = currentSortOption.icon

  const handleSortSelect = (sortKey) => {
    onSortChange(sortKey)
    setIsOpen(false)
  }

  const getSortIcon = (direction) => {
    if (direction === 'asc') {
      return <ArrowUp className="h-3 w-3" />
    } else {
      return <ArrowDown className="h-3 w-3" />
    }
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 px-3 py-2 bg-white border border-neutral-200 rounded-lg hover:bg-neutral-50 transition-colors text-sm font-medium text-neutral-700"
      >
        <ArrowUpDown className="h-4 w-4" />
        <IconComponent className="h-4 w-4" />
        <span className="hidden sm:inline">{currentSortOption.label}</span>
        <span className="sm:hidden">Sort</span>
        {getSortIcon(currentSortOption.direction)}
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-10" 
            onClick={() => setIsOpen(false)}
          />
          
          {/* Dropdown */}
          <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-xl shadow-strong border border-neutral-200 py-2 z-20">
            <div className="px-3 py-2 text-xs font-semibold text-neutral-500 uppercase tracking-wide border-b border-neutral-100">
              Sort by
            </div>
            
            {SORT_OPTIONS.map((option) => {
              const OptionIcon = option.icon
              const isSelected = option.key === currentSort
              
              return (
                <button
                  key={option.key}
                  onClick={() => handleSortSelect(option.key)}
                  className={`w-full flex items-center justify-between px-3 py-2 text-left hover:bg-neutral-50 transition-colors ${
                    isSelected ? 'bg-primary-50 text-primary-700' : 'text-neutral-700'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <OptionIcon className="h-4 w-4" />
                    <span className="text-sm font-medium">{option.label}</span>
                  </div>
                  
                  <div className="flex items-center space-x-1">
                    {getSortIcon(option.direction)}
                    {isSelected && (
                      <div className="w-2 h-2 bg-primary-600 rounded-full" />
                    )}
                  </div>
                </button>
              )
            })}
          </div>
        </>
      )}
    </div>
  )
}

// Utility function to sort notes array
export const sortNotes = (notes, sortKey) => {
  const sortOption = SORT_OPTIONS.find(option => option.key === sortKey)
  if (!sortOption) return notes

  const { field, direction } = sortOption

  return [...notes].sort((a, b) => {
    let aValue = a[field]
    let bValue = b[field]

    // Handle different field types
    if (field === 'title') {
      aValue = (aValue || 'Untitled Note').toLowerCase()
      bValue = (bValue || 'Untitled Note').toLowerCase()
    } else if (field === 'created_at' || field === 'updated_at') {
      aValue = new Date(aValue)
      bValue = new Date(bValue)
    }

    // Sort logic
    if (direction === 'asc') {
      if (aValue < bValue) return -1
      if (aValue > bValue) return 1
      return 0
    } else {
      if (aValue > bValue) return -1
      if (aValue < bValue) return 1
      return 0
    }
  })
}