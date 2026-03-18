'use client'

import { useEffect, useState } from 'react'
import { Toolbar } from './toolbar'
import { DesignCanvas } from './design-canvas'
import { LayersPanel } from './layers-panel'
import { PropertiesPanel } from './properties-panel'
import { AIChatSidebar } from './ai-chat-sidebar'
import { ProjectManager } from './project-manager'
import { useDesignAnalysis } from '@/hooks/use-design-analysis'
import { useCanvasStore } from '@/lib/canvas-store'
import { Badge } from '@/components/ui/badge'
import { AlertCircle, AlertTriangle, Info, Lightbulb, Share2 } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { InspirationBrowser } from '@/components/inspiration-browser'
import { useCollaboration } from '@/hooks/use-collaboration'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'


export function CanvasEditor() {
  const [browserOpen, setBrowserOpen] = useState(false)
  const [isMounted, setIsMounted] = useState(false)
  const { currentProject, createProject, projects } = useCanvasStore()
  const { score, errorCount, warningCount, infoCount } = useDesignAnalysis({
    debounceMs: 800,
    autoAnalyze: true,
  })
  
  // Collaboration
  const { collaborators, updateCursor, sessionId } = useCollaboration()

  useEffect(() => {
    setIsMounted(true)
  }, [])
  
  // Track mouse movements for live cursors
  useEffect(() => {
    if (!isMounted) return
    
    const handleMouseMove = (e: MouseEvent) => {
      updateCursor(e.clientX, e.clientY)
    }
    
    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [isMounted, updateCursor])
  
  // Create a default project if none exists
  useEffect(() => {
    if (!currentProject && projects.length === 0) {
      createProject('Untitled Design')
    }
  }, [currentProject, projects, createProject])

  return (
    <div className="h-screen flex flex-col bg-background overflow-hidden">
      {/* Top Bar */}
      <div className="flex items-center justify-between bg-panel-bg border-b border-border px-4 py-2">
        <ProjectManager />
        
        {/* Collaborators, Inspiration Browser & Design Score */}
        <div className="flex items-center gap-4">
          {/* Active Collaborators */}
          {collaborators.length > 0 && (
            <div className="flex items-center gap-2 px-3 py-1 rounded bg-muted">
              <span className="text-xs text-muted-foreground">Collaborating:</span>
              <div className="flex -space-x-2">
                {collaborators.slice(0, 3).map((collab) => (
                  <Avatar key={collab.id} className="h-6 w-6 border-2 border-background" title={collab.presence.name}>
                    {collab.presence.picture && <AvatarImage src={collab.presence.picture} alt={collab.presence.name} />}
                    <AvatarFallback style={{ backgroundColor: collab.presence.color }}>
                      {collab.presence.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                ))}
                {collaborators.length > 3 && (
                  <div className="h-6 w-6 rounded-full bg-muted border-2 border-background flex items-center justify-center text-xs font-bold">
                    +{collaborators.length - 3}
                  </div>
                )}
              </div>
            </div>
          )}
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              const url = new URL(window.location.href)
              if (!url.searchParams.has('room') && currentProject) {
                url.searchParams.set('room', currentProject.id)
              } else if (!url.searchParams.has('room')) {
                url.searchParams.set('room', 'designlens-default')
              }
              navigator.clipboard.writeText(url.toString())
              toast.success('Invite link copied!', {
                description: 'Share this link to collaborate in real-time.'
              })
            }}
            className="gap-2 bg-primary/10 hover:bg-primary/20 text-primary border-primary/20"
          >
            <Share2 className="h-4 w-4" />
            Share
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setBrowserOpen(true)}
            className="gap-2"
          >
            <Lightbulb className="h-4 w-4" />
            Inspiration
          </Button>
          <div className="flex items-center gap-2">
            {errorCount > 0 && (
              <Badge variant="destructive" className="gap-1">
                <AlertCircle className="h-3 w-3" />
                {errorCount}
              </Badge>
            )}
            {warningCount > 0 && (
              <Badge variant="outline" className="gap-1 border-warning text-warning">
                <AlertTriangle className="h-3 w-3" />
                {warningCount}
              </Badge>
            )}
            {infoCount > 0 && (
              <Badge variant="outline" className="gap-1 border-info text-info">
                <Info className="h-3 w-3" />
                {infoCount}
              </Badge>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">Design Score</span>
            <Badge 
              variant={score >= 80 ? 'default' : score >= 50 ? 'outline' : 'destructive'}
              className="font-mono"
            >
              {score}/100
            </Badge>
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <Toolbar />

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Live Cursors Overlay */}
        {collaborators.map((collab) => (
          collab.presence.cursor && (
            <div
              key={collab.id}
              className="fixed pointer-events-none"
              style={{
                left: `${collab.presence.cursor.x}px`,
                top: `${collab.presence.cursor.y}px`,
                zIndex: 50,
              }}
            >
              {/* Cursor */}
              <div className="relative shadow-sm" style={{ transition: 'transform 0.1s ease-out' }}>
                <svg width="24" height="36" viewBox="0 0 24 36" fill="none" stroke="white" strokeWidth="1.5">
                  <path fill={collab.presence.color} d="M1 1L8.5 28L12.5 17L23 12L1 1Z" />
                </svg>
              </div>
            </div>
          )
        ))}
        
        {/* Layers Panel */}
        <LayersPanel />

        {/* Canvas */}
        <DesignCanvas />

        {/* Properties Panel */}
        <PropertiesPanel />

        {/* AI Chat Sidebar */}
        <AIChatSidebar />
      </div>

      {/* Inspiration Browser Modal */}
      <InspirationBrowser open={browserOpen} onOpenChange={setBrowserOpen} />
    </div>
  )
}
