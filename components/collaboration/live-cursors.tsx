'use client'

import { useOthers, useUpdateMyPresence } from '@/liveblocks.config'
import { useEffect } from 'react'

export function LiveCursors() {
  const others = useOthers()
  const updateMyPresence = useUpdateMyPresence()

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      updateMyPresence({
        cursor: { x: e.clientX, y: e.clientY },
      })
    }

    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [updateMyPresence])

  return (
    <>
      {others.map((other) => {
        if (!other.presence?.cursor) return null
        
        const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8', '#F7DC6F']
        const colorIndex = (other.connectionId % colors.length)
        const color = other.presence.user?.color || colors[colorIndex]

        return (
          <div key={other.connectionId}>
            {/* Cursor dot */}
            <div
              className="pointer-events-none fixed w-3 h-3 rounded-full border-2 border-white shadow-lg z-50"
              style={{
                left: `${other.presence.cursor.x}px`,
                top: `${other.presence.cursor.y}px`,
                backgroundColor: color,
              }}
            />
            {/* Cursor label */}
            <div
              className="pointer-events-none fixed px-2 py-1 rounded text-xs font-semibold text-white whitespace-nowrap z-50"
              style={{
                left: `${other.presence.cursor.x + 12}px`,
                top: `${other.presence.cursor.y + 12}px`,
                backgroundColor: color,
              }}
            >
              {other.presence.user?.name || 'Guest'}
            </div>
          </div>
        )
      })}
    </>
  )
}
