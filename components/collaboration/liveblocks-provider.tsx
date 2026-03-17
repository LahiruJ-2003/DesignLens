'use client'

import { ReactNode, Suspense } from 'react'
import { RoomProvider } from '@/liveblocks.config'

interface LiveblocksProviderProps {
  children: ReactNode
  roomId: string
}

function LoadingFallback() {
  return (
    <div className="h-screen flex items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        <p className="text-sm text-muted-foreground">Loading collaboration...</p>
      </div>
    </div>
  )
}

export function LiveblocksProvider({ children, roomId }: LiveblocksProviderProps) {
  if (!process.env.NEXT_PUBLIC_LIVEBLOCKS_PUBLIC_KEY) {
    return <>{children}</>
  }

  return (
    <Suspense fallback={<LoadingFallback />}>
      <RoomProvider
        
        id={roomId}
        initialPresence={{
          cursor: null,
          selectedElementIds: [],
          user: { id: '', name: '', color: '' },
        }}
      >
        {children}
      </RoomProvider>
    </Suspense>
  )
}
