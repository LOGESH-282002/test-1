'use client'

import { useState, useEffect } from 'react'
import { Activity, Clock, Database } from 'lucide-react'

export default function PerformanceMonitor({ show = false }) {
  const [metrics, setMetrics] = useState({
    loadTime: 0,
    apiCalls: 0,
    cacheHits: 0,
    totalNotes: 0
  })

  useEffect(() => {
    if (show && typeof window !== 'undefined') {
      // Monitor performance
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries()
        entries.forEach((entry) => {
          if (entry.name.includes('/api/notes')) {
            setMetrics(prev => ({
              ...prev,
              apiCalls: prev.apiCalls + 1,
              loadTime: entry.duration
            }))
          }
        })
      })
      
      observer.observe({ entryTypes: ['navigation', 'resource'] })
      
      return () => observer.disconnect()
    }
  }, [show])

  if (!show) return null

  return (
    <div className="fixed bottom-4 right-4 bg-black/80 text-white p-3 rounded-lg text-xs font-mono z-50">
      <div className="flex items-center space-x-2 mb-2">
        <Activity className="h-3 w-3" />
        <span>Performance Monitor</span>
      </div>
      
      <div className="space-y-1">
        <div className="flex items-center justify-between space-x-4">
          <span className="flex items-center space-x-1">
            <Clock className="h-3 w-3" />
            <span>Load Time:</span>
          </span>
          <span>{metrics.loadTime.toFixed(0)}ms</span>
        </div>
        
        <div className="flex items-center justify-between space-x-4">
          <span className="flex items-center space-x-1">
            <Database className="h-3 w-3" />
            <span>API Calls:</span>
          </span>
          <span>{metrics.apiCalls}</span>
        </div>
        
        <div className="flex items-center justify-between space-x-4">
          <span>Notes Loaded:</span>
          <span>{metrics.totalNotes}</span>
        </div>
      </div>
    </div>
  )
}