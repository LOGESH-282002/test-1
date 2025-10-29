import { useState, useEffect, useCallback, useRef } from 'react'

export const useInfiniteScroll = (fetchMore, hasMore, threshold = 100) => {
  const [isFetching, setIsFetching] = useState(false)
  const observerRef = useRef()

  const lastElementRef = useCallback(node => {
    if (isFetching) return
    if (observerRef.current) observerRef.current.disconnect()
    
    observerRef.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        setIsFetching(true)
        fetchMore().finally(() => setIsFetching(false))
      }
    }, {
      rootMargin: `${threshold}px`
    })
    
    if (node) observerRef.current.observe(node)
  }, [isFetching, hasMore, fetchMore, threshold])

  useEffect(() => {
    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect()
      }
    }
  }, [])

  return { lastElementRef, isFetching }
}