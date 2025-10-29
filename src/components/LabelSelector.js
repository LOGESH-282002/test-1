'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { toast } from 'react-hot-toast'
import { Plus, X, Tag, Palette } from 'lucide-react'

const LABEL_COLORS = [
  '#ef4444', '#f97316', '#eab308', '#22c55e', '#10b981',
  '#06b6d4', '#3b82f6', '#6366f1', '#8b5cf6', '#d946ef',
  '#ec4899', '#f43f5e', '#64748b', '#6b7280', '#374151'
]

export default function LabelSelector({ selectedLabels = [], onLabelsChange, disabled = false }) {
  const { token } = useAuth()
  const [labels, setLabels] = useState([])
  const [loading, setLoading] = useState(true)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [newLabelName, setNewLabelName] = useState('')
  const [newLabelColor, setNewLabelColor] = useState('#10b981')
  const [creating, setCreating] = useState(false)

  useEffect(() => {
    if (token) {
      fetchLabels()
    }
  }, [token])

  const fetchLabels = async () => {
    try {
      const response = await fetch('/api/labels', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })
      
      const data = await response.json()
      
      if (response.ok) {
        setLabels(data.labels)
      } else {
        toast.error(data.error || 'Failed to fetch labels')
      }
    } catch (error) {
      toast.error('Failed to fetch labels')
    } finally {
      setLoading(false)
    }
  }

  const createLabel = async () => {
    if (!newLabelName.trim()) {
      toast.error('Label name is required')
      return
    }

    setCreating(true)
    try {
      const response = await fetch('/api/labels', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: newLabelName.trim(),
          color: newLabelColor,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        setLabels([...labels, data.label])
        setNewLabelName('')
        setNewLabelColor('#10b981')
        setShowCreateForm(false)
        toast.success('Label created successfully')
      } else {
        toast.error(data.error || 'Failed to create label')
      }
    } catch (error) {
      toast.error('Failed to create label')
    } finally {
      setCreating(false)
    }
  }

  const toggleLabel = (labelId) => {
    if (disabled) return
    
    const isSelected = selectedLabels.includes(labelId)
    let newSelectedLabels
    
    if (isSelected) {
      newSelectedLabels = selectedLabels.filter(id => id !== labelId)
    } else {
      newSelectedLabels = [...selectedLabels, labelId]
    }
    
    onLabelsChange(newSelectedLabels)
  }

  const getLabelById = (labelId) => {
    return labels.find(label => label.id === labelId)
  }

  if (loading) {
    return (
      <div className="flex items-center space-x-2 text-neutral-500">
        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-600"></div>
        <span className="text-sm">Loading labels...</span>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <label className="block text-sm font-semibold text-neutral-800">
          Labels
        </label>
        <button
          type="button"
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="text-sm text-primary-600 hover:text-primary-700 flex items-center space-x-1"
          disabled={disabled}
        >
          <Plus className="h-3 w-3" />
          <span>New Label</span>
        </button>
      </div>

      {/* Create Label Form */}
      {showCreateForm && (
        <div className="bg-neutral-50 p-4 rounded-lg border border-neutral-200 space-y-3">
          <div className="flex items-center space-x-3">
            <input
              type="text"
              value={newLabelName}
              onChange={(e) => setNewLabelName(e.target.value)}
              placeholder="Label name"
              className="flex-1 px-3 py-2 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 text-sm"
              maxLength={50}
            />
            <div className="relative">
              <button
                type="button"
                className="w-8 h-8 rounded-full border-2 border-neutral-300 flex items-center justify-center"
                style={{ backgroundColor: newLabelColor }}
                onClick={() => {
                  const colorPicker = document.createElement('input')
                  colorPicker.type = 'color'
                  colorPicker.value = newLabelColor
                  colorPicker.onchange = (e) => setNewLabelColor(e.target.value)
                  colorPicker.click()
                }}
              >
                <Palette className="h-3 w-3 text-white" />
              </button>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <div className="text-xs text-neutral-500">Quick colors:</div>
            {LABEL_COLORS.slice(0, 8).map(color => (
              <button
                key={color}
                type="button"
                className="w-4 h-4 rounded-full border border-neutral-300 hover:scale-110 transition-transform"
                style={{ backgroundColor: color }}
                onClick={() => setNewLabelColor(color)}
              />
            ))}
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={createLabel}
              disabled={creating || !newLabelName.trim()}
              className="btn-primary text-sm py-2 px-4 disabled:opacity-50"
            >
              {creating ? 'Creating...' : 'Create'}
            </button>
            <button
              type="button"
              onClick={() => {
                setShowCreateForm(false)
                setNewLabelName('')
                setNewLabelColor('#10b981')
              }}
              className="btn-secondary text-sm py-2 px-4"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Selected Labels */}
      {selectedLabels.length > 0 && (
        <div className="space-y-2">
          <div className="text-sm text-neutral-600">Selected labels:</div>
          <div className="flex flex-wrap gap-2">
            {selectedLabels.map(labelId => {
              const label = getLabelById(labelId)
              if (!label) return null
              
              return (
                <span
                  key={labelId}
                  className="inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium text-white cursor-pointer hover:opacity-80 transition-opacity"
                  style={{ backgroundColor: label.color }}
                  onClick={() => toggleLabel(labelId)}
                >
                  <Tag className="h-3 w-3" />
                  <span>{label.name}</span>
                  {!disabled && <X className="h-3 w-3 hover:bg-black/20 rounded-full" />}
                </span>
              )
            })}
          </div>
        </div>
      )}

      {/* Available Labels */}
      {labels.length > 0 && (
        <div className="space-y-2">
          <div className="text-sm text-neutral-600">Available labels:</div>
          <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
            {labels
              .filter(label => !selectedLabels.includes(label.id))
              .map(label => (
                <button
                  key={label.id}
                  type="button"
                  onClick={() => toggleLabel(label.id)}
                  disabled={disabled}
                  className="inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium text-white hover:opacity-80 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ backgroundColor: label.color }}
                >
                  <Tag className="h-3 w-3" />
                  <span>{label.name}</span>
                  <Plus className="h-3 w-3" />
                </button>
              ))}
          </div>
        </div>
      )}

      {labels.length === 0 && !showCreateForm && (
        <div className="text-center py-4 text-neutral-500">
          <Tag className="h-8 w-8 mx-auto mb-2 opacity-50" />
          <p className="text-sm">No labels yet. Create your first label to get started.</p>
        </div>
      )}
    </div>
  )
}