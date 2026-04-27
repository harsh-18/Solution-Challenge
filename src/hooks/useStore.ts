// ============================================================
// ReliefSetu — useStore Hook
// Reactive hook for the in-memory data store
// ============================================================

import { useState, useEffect } from 'react'
import { store } from '@/services/store'

export function useStore() {
  const [, setVersion] = useState(0)
  
  useEffect(() => {
    const unsubscribe = store.subscribe(() => {
      setVersion(v => v + 1)
    })
    return () => { unsubscribe() }
  }, [])

  return store
}

export function useStats() {
  const [stats, setStats] = useState(() => store.getStats())
  
  useEffect(() => {
    const unsubscribe = store.subscribe(() => {
      setStats(store.getStats())
    })
    return () => { unsubscribe() }
  }, [])

  return stats
}
