'use client'

import { useEffect } from 'react'
import { useStorage, useUpdateMyPresence } from '@/liveblocks.config'
import { useCanvasStore } from '@/lib/canvas-store'

export function useSyncDesign() {
  const { selectedIds } = useCanvasStore()
  const updateMyPresence = useUpdateMyPresence()

  // Sync selected elements to presence so others can see what you've selected
  useEffect(() => {
    updateMyPresence({ selectedElementIds: selectedIds })
  }, [selectedIds, updateMyPresence])
}
