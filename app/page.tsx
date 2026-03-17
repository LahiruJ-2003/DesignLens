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

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useUser } from '@clerk/nextjs'
import { LandingPage } from '@/components/landing-page'
import { CanvasEditor } from '@/components/canvas/canvas-editor'
import { useCanvasStore } from '@/lib/canvas-store'
import { LiveblocksProvider } from '@/components/collaboration/liveblocks-provider'

export default function Home() {
  const [showEditor, setShowEditor] = useState(false)
  const { currentProject } = useCanvasStore()
  const { isLoaded, isSignedIn } = useUser()
  const router = useRouter()

  // Wait for Clerk to load
  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    )
  }

  // Show landing page if not authenticated (with sign-in redirect)
  if (!isSignedIn) {
    return <LandingPage onStartDesigning={() => router.push('/sign-in')} />
  }

  // Show editor if user has already started or if there's a current project
  if (showEditor || currentProject) {
    return (
      <LiveblocksProvider roomId={currentProject?.id || 'designlens-default'}>
        <CanvasEditor />
      </LiveblocksProvider>
    )
  }

  return <LandingPage onStartDesigning={() => setShowEditor(true)} />
}
