'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { toast } from 'react-hot-toast'
import { Plus, Folder, ChevronDown } from 'lucide-react'

const CATEGORY_ICONS = [
  'folder', 'briefcase', 'user', 'lightbulb', 'search', 'book', 'heart', 'star',
  'home', 'settings', 'camera', 'music', 'gamepad', 'coffee', 'plane', 'car'
]

const CATEGORY_COLORS = [
  '#6366f1', '#059669', '#dc2626', '#7c3aed', '#0891b2', '#ea580c', '#be123c', '#7c2d12'
]

export default function CategorySelector({ selectedCategory, onCategoryChange, disabled = false }) {
  const { token } = useAuth()
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [newCategory, setNewCategory] = useState({
    name: '',
    description: '',
    color: '#6366f1',
    icon: 'folder'
  })
  const [creating, setCreating] = useState(false)

  useEffect(() => {
    if (token) {
      fetchCategories()
    }
  }, [token])

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/categories', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })
      
      const data = await response.json()
      
      if (response.ok) {
        setCategories(data.categories)
      } else {
        toast.error(data.error || 'Failed to fetch categories')
      }
    } catch (error) {
      toast.error('Failed to fetch categories')
    } finally {
      setLoading(false)
    }
  }

  const createCategory = async () => {
    if (!newCategory.name.trim()) {
      toast.error('Category name is required')
      return
    }

    setCreating(true)
    try {
      const response = await fetch('/api/categories', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(newCategory),
      })

      const data = await response.json()

      if (response.ok) {
        setCategories([...categories, data.category])
        setNewCategory({
          name: '',
          description: '',
          color: '#6366f1',
          icon: 'folder'
        })
        setShowCreateForm(false)
        toast.success('Category created successfully')
      } else {
        toast.error(data.error || 'Failed to create category')
      }
    } catch (error) {
      toast.error('Failed to create category')
    } finally {
      setCreating(false)
    }
  }

  const getCategoryById = (categoryId) => {
    return categories.find(category => category.id === categoryId)
  }

  const getIconComponent = (iconName) => {
    // For simplicity, using Folder for all icons. In a real app, you'd map icon names to actual icon components
    return <Folder className="h-4 w-4" />
  }

  if (loading) {
    return (
      <div className="flex items-center space-x-2 text-neutral-500">
        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-600"></div>
        <span className="text-sm">Loading categories...</span>
      </div>
    )
  }

  const selectedCategoryData = selectedCategory ? getCategoryById(selectedCategory) : null

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <label className="block text-sm font-semibold text-neutral-800">
          Category
        </label>
        <button
          type="button"
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="text-sm text-primary-600 hover:text-primary-700 flex items-center space-x-1"
          disabled={disabled}
        >
          <Plus className="h-3 w-3" />
          <span>New Category</span>
        </button>
      </div>

      {/* Create Category Form */}
      {showCreateForm && (
        <div className="bg-neutral-50 p-4 rounded-lg border border-neutral-200 space-y-3">
          <input
            type="text"
            value={newCategory.name}
            onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
            placeholder="Category name"
            className="w-full px-3 py-2 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 text-sm"
            maxLength={100}
          />
          
          <textarea
            value={newCategory.description}
            onChange={(e) => setNewCategory({ ...newCategory, description: e.target.value })}
            placeholder="Description (optional)"
            rows={2}
            className="w-full px-3 py-2 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 text-sm resize-none"
          />
          
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <span className="text-xs text-neutral-500">Color:</span>
              {CATEGORY_COLORS.map(color => (
                <button
                  key={color}
                  type="button"
                  className={`w-6 h-6 rounded-full border-2 hover:scale-110 transition-transform ${
                    newCategory.color === color ? 'border-neutral-800' : 'border-neutral-300'
                  }`}
                  style={{ backgroundColor: color }}
                  onClick={() => setNewCategory({ ...newCategory, color })}
                />
              ))}
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={createCategory}
              disabled={creating || !newCategory.name.trim()}
              className="btn-primary text-sm py-2 px-4 disabled:opacity-50"
            >
              {creating ? 'Creating...' : 'Create'}
            </button>
            <button
              type="button"
              onClick={() => {
                setShowCreateForm(false)
                setNewCategory({
                  name: '',
                  description: '',
                  color: '#6366f1',
                  icon: 'folder'
                })
              }}
              className="btn-secondary text-sm py-2 px-4"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Category Selector */}
      <div className="relative">
        <select
          value={selectedCategory || ''}
          onChange={(e) => onCategoryChange(e.target.value || null)}
          disabled={disabled}
          className="w-full px-3 py-2 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 bg-white appearance-none pr-10 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <option value="">No category</option>
          {categories.map(category => (
            <option key={category.id} value={category.id}>
              {category.name} {category.is_default ? '(Default)' : ''}
            </option>
          ))}
        </select>
        <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-neutral-400 pointer-events-none" />
      </div>

      {/* Selected Category Display */}
      {selectedCategoryData && (
        <div className="flex items-center space-x-3 p-3 bg-neutral-50 rounded-lg border border-neutral-200">
          <div 
            className="w-8 h-8 rounded-lg flex items-center justify-center text-white"
            style={{ backgroundColor: selectedCategoryData.color }}
          >
            {getIconComponent(selectedCategoryData.icon)}
          </div>
          <div className="flex-1">
            <div className="font-medium text-neutral-900">{selectedCategoryData.name}</div>
            {selectedCategoryData.description && (
              <div className="text-sm text-neutral-600">{selectedCategoryData.description}</div>
            )}
          </div>
          {selectedCategoryData.is_default && (
            <span className="text-xs bg-primary-100 text-primary-700 px-2 py-1 rounded-full">
              Default
            </span>
          )}
        </div>
      )}

      {categories.length === 0 && !showCreateForm && (
        <div className="text-center py-4 text-neutral-500">
          <Folder className="h-8 w-8 mx-auto mb-2 opacity-50" />
          <p className="text-sm">No categories available. Create your first category to get started.</p>
        </div>
      )}
    </div>
  )
}