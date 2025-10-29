'use client'

import { ArrowUpDown, Clock, Calendar, SortAsc } from 'lucide-react'

export default function QuickSort({ currentSort, onSortChange }) {
  const quickSortOptions = [
    { key: 'updated_desc', label: 'Latest', icon: Clock },
    { key: 'created_desc', label: 'Newest', icon: Calendar },
    { key: 'title_asc', label: 'A-Z', icon: SortAsc }
  ]

  return (
    <div className="flex items-center space-x-1 bg-neutral-50 rounded-lg p-1">
      <ArrowUpDown className="h-3 w-3 text-neutral-400 ml-2" />
      {quickSortOptions.map((option) => {
        const IconComponent = option.icon
        const isActive = currentSort === option.key
        
        return (
          <button
            key={option.key}
            onClick={() => onSortChange(option.key)}
            className={`flex items-center space-x-1 px-2 py-1 rounded text-xs font-medium transition-colors ${
              isActive 
                ? 'bg-primary-600 text-white' 
                : 'text-neutral-600 hover:bg-neutral-200'
            }`}
          >
            <IconComponent className="h-3 w-3" />
            <span>{option.label}</span>
          </button>
        )
      })}
    </div>
  )
}