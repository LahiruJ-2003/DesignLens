// 'use client'

// import { useState } from 'react'
// import { LandingPage } from '@/components/landing-page'
// import { CanvasEditor } from '@/components/canvas/canvas-editor'
// import { useCanvasStore } from '@/lib/canvas-store'
// import { CollaborationWrapper } from '@/components/collaboration/collaboration-wrapper'

// export default function Home() {
//   const [showEditor, setShowEditor] = useState(false)
//   const { currentProject } = useCanvasStore()

//   // Show editor if user has already started or if there's a current project
//   if (showEditor || currentProject) {
//     return (
//       <CollaborationWrapper roomId={currentProject?.id || "default-room"}>
//         <CanvasEditor />
//       </CollaborationWrapper>
//     )
//   }

//   return <LandingPage onStartDesigning={() => setShowEditor(true)} />
// }
// 'use client'

// import { useState } from 'react'
// import { LandingPage } from '@/components/landing-page'
// import { CanvasEditor } from '@/components/canvas/canvas-editor'
// import { useCanvasStore } from '@/lib/canvas-store'

// export default function Home() {
//   const [showEditor, setShowEditor] = useState(false)
//   const { currentProject } = useCanvasStore()

//   // Show editor if user has already started or if there's a current project
//   if (showEditor || currentProject) {
//     return <CanvasEditor />
//   }

//   return <LandingPage onStartDesigning={() => setShowEditor(true)} />
// }
'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useUser } from '@clerk/nextjs'
import { LandingPage } from '@/components/landing-page'
import { CanvasEditor } from '@/components/canvas/canvas-editor'
import { useCanvasStore } from '@/lib/canvas-store'
import { LiveblocksProvider } from '@/components/collaboration/liveblocks-provider'

export default function Home() {
  const [showEditor, setShowEditor] = useState(false)
  const [sharedRoomId, setSharedRoomId] = useState<string | null>(null)
  const [hasMounted, setHasMounted] = useState(false)
  const { currentProject } = useCanvasStore()
  const { isLoaded, isSignedIn } = useUser()
  const router = useRouter()

  // Mount effect to handle client-side logic and check search params
  useEffect(() => {
    setHasMounted(true)
    const params = new URLSearchParams(window.location.search)
    const room = params.get('room')
    if (room) {
      setSharedRoomId(room)
      setShowEditor(true)
    }
  }, [])

  const wasSignedIn = useRef(false)

  // Track if the user was signed in during this session
  useEffect(() => {
    if (isSignedIn) {
      wasSignedIn.current = true
    }
  }, [isSignedIn])

  // Handle automatic redirect to sign-in for users with a share link
  useEffect(() => {
    // Only auto-redirect if they were NOT previously signed in during this session
    if (isLoaded && !isSignedIn && !wasSignedIn.current && sharedRoomId && hasMounted) {
      const signInUrl = `/sign-in?redirect_url=${encodeURIComponent(`/?room=${sharedRoomId}`)}`
      router.push(signInUrl)
    }
  }, [isLoaded, isSignedIn, sharedRoomId, hasMounted, router])

  // Wait for Clerk to load
  if (!isLoaded || !hasMounted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    )
  }

  // Show landing page if not authenticated (with sign-in redirect)
  if (!isSignedIn) {
    if (sharedRoomId && hasMounted && !wasSignedIn.current) {
      // Return a loading state while the useEffect above handles the redirect
      return (
        <div className="min-h-screen flex items-center justify-center bg-background">
          <div className="text-muted-foreground animate-pulse">Redirecting...</div>
        </div>
      )
    }

    return <LandingPage onStartDesigning={() => router.push('/sign-in')} />
  }

  // Show editor if user has explicitly clicked start/load (overrides currentProject)
  if (showEditor) {
    return (
      <LiveblocksProvider roomId={sharedRoomId || currentProject?.id || 'designlens-room-2'}>
        <CanvasEditor />
      </LiveblocksProvider>
    )
  }

  return <LandingPage onStartDesigning={() => setShowEditor(true)} />
}
