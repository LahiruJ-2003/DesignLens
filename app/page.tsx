'use client'

import { useState } from 'react'
import { LandingPage } from '@/components/landing-page'
import { CanvasEditor } from '@/components/canvas/canvas-editor'
import { useCanvasStore } from '@/lib/canvas-store'

export default function Home() {
  const [showEditor, setShowEditor] = useState(false)
  const { currentProject } = useCanvasStore()

  // Show editor if user has already started or if there's a current project
  if (showEditor || currentProject) {
    return <CanvasEditor />
  }

  return <LandingPage onStartDesigning={() => setShowEditor(true)} />
}
