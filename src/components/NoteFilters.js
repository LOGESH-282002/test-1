'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useDebounce } from '@/hooks/useDebounce'
import { Search, Filter, X, Tag, Folder, Calendar, ArrowUpDown, Eye, Lock } from 'lucide-react'

export default function NoteFilters({ onFiltersChange, activeFilters = {}, onSortChange, currentSort = 'updated_desc' }) {
  const { token } = useAuth()
  const [categories, setCategories] = useState([])
  const [labels, setLabels] = useState([])
  const [showFilters, setShowFilters] = useState(false)
  const [searchQuery, setSearchQuery] = useState(activeFilters.search || '')
  const [selectedCategory, setSelectedCategory] = useState(activeFilters.category || '')
  const [selectedLabels, setSelectedLabels] = useState(activeFilters.labels || [])
  const [dateFilter, setDateFilter] = useState(activeFilters.dateFilter || 'all')
  const [visibilityFilter, setVisibilityFilter] = useState(activeFilters.visibility || 'all')
  const [encryptionFilter, setEncryptionFilter] = useState(activeFilters.encryption || 'all')

  // Debounce search query for better performance
  const debouncedSearchQuery = useDebounce(searchQuery, 300)

  const SORT_OPTIONS = [
    { key: 'updated_desc', label: 'Last Updated (Newest)' },
    { key: 'updated_asc', label: 'Last Updated (Oldest)' },
    { key: 'created_desc', label: 'Date Created (Newest)' },
    { key: 'created_asc', label: 'Date Created (Oldest)' },
    { key: 'title_asc', label: 'Title (A-Z)' },
    { key: 'title_desc', label: 'Title (Z-A)' }
  ]

  useEffect(() => {
    if (token) {
      fetchCategories()
      fetchLabels()
    }
  }, [token])

  useEffect(() => {
    const filters = {
      search: debouncedSearchQuery,
      category: selectedCategory,
      labels: selectedLabels,
      dateFilter: dateFilter,
      visibility: visibilityFilter,
      encryption: encryptionFilter
    }
    onFiltersChange(filters)
  }, [debouncedSearchQuery, selectedCategory, selectedLabels, dateFilter, visibilityFilter, encryptionFilter, onFiltersChange])

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/categories', {
        headers: { 'Authorization': `Bearer ${token}` },
      })
      const data = await response.json()
      if (response.ok) {
        setCategories(data.categories)
      }
    } catch (error) {
      console.error('Failed to fetch categories:', error)
    }
  }

  const fetchLabels = async () => {
    try {
      const response = await fetch('/api/labels', {
        headers: { 'Authorization': `Bearer ${token}` },
      })
      const data = await response.json()
      if (response.ok) {
        setLabels(data.labels)
      }
    } catch (error) {
      console.error('Failed to fetch labels:', error)
    }
  }

  const toggleLabel = (labelId) => {
    setSelectedLabels(prev =>
      prev.includes(labelId)
        ? prev.filter(id => id !== labelId)
        : [...prev, labelId]
    )
  }

  const clearFilters = () => {
    setSearchQuery('')
    setSelectedCategory('')
    setSelectedLabels([])
    setDateFilter('all')
    setVisibilityFilter('all')
    setEncryptionFilter('all')
  }

  const hasActiveFilters = searchQuery || selectedCategory || selectedLabels.length > 0 || dateFilter !== 'all' || visibilityFilter !== 'all' || encryptionFilter !== 'all'

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-neutral-400" />
        <input
          type="text"
          placeholder="Search notes..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-12 py-3 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 bg-white"
        />
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`absolute right-3 top-1/2 transform -translate-y-1/2 p-1 rounded-lg transition-colors ${showFilters || hasActiveFilters
            ? 'text-primary-600 bg-primary-100'
            : 'text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100'
            }`}
        >
          <Filter className="h-4 w-4" />
        </button>
      </div>

      {/* Filter Panel */}
      {showFilters && (
        <div className="bg-white border border-neutral-200 rounded-xl p-4 space-y-4 shadow-soft">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-neutral-900">Filters</h3>
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="text-sm text-neutral-500 hover:text-neutral-700 flex items-center space-x-1"
              >
                <X className="h-3 w-3" />
                <span>Clear all</span>
              </button>
            )}
          </div>

          <div className="grid md:grid-cols-6 gap-4">
            {/* Category Filter */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-neutral-700">
                <Folder className="inline h-4 w-4 mr-1" />
                Category
              </label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-3 py-2 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 bg-white text-sm"
              >
                <option value="">All categories</option>
                {categories.map(category => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Date Filter */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-neutral-700">
                <Calendar className="inline h-4 w-4 mr-1" />
                Date
              </label>
              <select
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="w-full px-3 py-2 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 bg-white text-sm"
              >
                <option value="all">All time</option>
                <option value="today">Today</option>
                <option value="week">This week</option>
                <option value="month">This month</option>
                <option value="year">This year</option>
              </select>
            </div>

            {/* Sort Filter */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-neutral-700">
                <ArrowUpDown className="inline h-4 w-4 mr-1" />
                Sort by
              </label>
              <select
                value={currentSort}
                onChange={(e) => onSortChange && onSortChange(e.target.value)}
                className="w-full px-3 py-2 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 bg-white text-sm"
              >
                {SORT_OPTIONS.map(option => (
                  <option key={option.key} value={option.key}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Visibility Filter */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-neutral-700">
                <Eye className="inline h-4 w-4 mr-1" />
                Visibility
              </label>
              <select
                value={visibilityFilter}
                onChange={(e) => setVisibilityFilter(e.target.value)}
                className="w-full px-3 py-2 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 bg-white text-sm"
              >
                <option value="all">All notes</option>
                <option value="private">Private only</option>
                <option value="public">Public only</option>
                <option value="draft">Drafts only</option>
                <option value="published">Published only</option>
              </select>
            </div>

            {/* Encryption Filter */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-neutral-700">
                <Lock className="inline h-4 w-4 mr-1" />
                Encryption
              </label>
              <select
                value={encryptionFilter}
                onChange={(e) => setEncryptionFilter(e.target.value)}
                className="w-full px-3 py-2 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 bg-white text-sm"
              >
                <option value="all">All notes</option>
                <option value="encrypted">Encrypted only</option>
                <option value="unencrypted">Unencrypted only</option>
              </select>
            </div>

            {/* Labels Filter */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-neutral-700">
                <Tag className="inline h-4 w-4 mr-1" />
                Labels
              </label>
              <div className="max-h-32 overflow-y-auto space-y-1">
                {labels.map(label => (
                  <label key={label.id} className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedLabels.includes(label.id)}
                      onChange={() => toggleLabel(label.id)}
                      className="rounded border-neutral-300 text-primary-600 focus:ring-primary-500"
                    />
                    <span
                      className="inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium text-white"
                      style={{ backgroundColor: label.color }}
                    >
                      <Tag className="h-2 w-2" />
                      <span>{label.name}</span>
                    </span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Active Filters Display */}
      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2">
          {debouncedSearchQuery && (
            <span className="inline-flex items-center space-x-1 px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm">
              <Search className="h-3 w-3" />
              <span>"{debouncedSearchQuery}"</span>
              <button onClick={() => setSearchQuery('')}>
                <X className="h-3 w-3 hover:bg-primary-200 rounded-full" />
              </button>
            </span>
          )}

          {selectedCategory && (
            <span className="inline-flex items-center space-x-1 px-3 py-1 bg-secondary-100 text-secondary-700 rounded-full text-sm">
              <Folder className="h-3 w-3" />
              <span>{categories.find(c => c.id === selectedCategory)?.name}</span>
              <button onClick={() => setSelectedCategory('')}>
                <X className="h-3 w-3 hover:bg-secondary-200 rounded-full" />
              </button>
            </span>
          )}

          {selectedLabels.map(labelId => {
            const label = labels.find(l => l.id === labelId)
            if (!label) return null
            return (
              <span
                key={labelId}
                className="inline-flex items-center space-x-1 px-3 py-1 rounded-full text-sm text-white"
                style={{ backgroundColor: label.color }}
              >
                <Tag className="h-3 w-3" />
                <span>{label.name}</span>
                <button onClick={() => toggleLabel(labelId)}>
                  <X className="h-3 w-3 hover:bg-black/20 rounded-full" />
                </button>
              </span>
            )
          })}

          {dateFilter !== 'all' && (
            <span className="inline-flex items-center space-x-1 px-3 py-1 bg-accent-100 text-accent-700 rounded-full text-sm">
              <Calendar className="h-3 w-3" />
              <span>{dateFilter === 'today' ? 'Today' : dateFilter === 'week' ? 'This week' : dateFilter === 'month' ? 'This month' : 'This year'}</span>
              <button onClick={() => setDateFilter('all')}>
                <X className="h-3 w-3 hover:bg-accent-200 rounded-full" />
              </button>
            </span>
          )}

          {visibilityFilter !== 'all' && (
            <span className="inline-flex items-center space-x-1 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
              <Eye className="h-3 w-3" />
              <span>{visibilityFilter.charAt(0).toUpperCase() + visibilityFilter.slice(1)}</span>
              <button onClick={() => setVisibilityFilter('all')}>
                <X className="h-3 w-3 hover:bg-blue-200 rounded-full" />
              </button>
            </span>
          )}

          {encryptionFilter !== 'all' && (
            <span className="inline-flex items-center space-x-1 px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm">
              <Lock className="h-3 w-3" />
              <span>{encryptionFilter === 'encrypted' ? 'Encrypted' : 'Unencrypted'}</span>
              <button onClick={() => setEncryptionFilter('all')}>
                <X className="h-3 w-3 hover:bg-purple-200 rounded-full" />
              </button>
            </span>
          )}
        </div>
      )}
    </div>
  )
}