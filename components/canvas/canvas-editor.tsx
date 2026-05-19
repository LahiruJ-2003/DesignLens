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
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip'
import { AlertCircle, AlertTriangle, Info, Lightbulb, Share2 } from 'lucide-react'
import type { ScoredResult } from '@/lib/scoring'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { InspirationBrowser } from '@/components/inspiration-browser'
import { useCollaboration } from '@/hooks/use-collaboration'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'


const COLOUR_CLASSES: Record<ScoredResult['colour'], string> = {
  green:  'border-green-500/40  text-green-400  bg-green-500/10',
  blue:   'border-blue-500/40   text-blue-400   bg-blue-500/10',
  yellow: 'border-yellow-500/40 text-yellow-500 bg-yellow-500/10',
  orange: 'border-orange-500/40 text-orange-400 bg-orange-500/10',
  red:    'border-destructive/40 text-destructive bg-destructive/10',
}

interface ScoreBadgeProps {
  isAnalyzing: boolean
  isEmpty: boolean
  score: number
  label: ScoredResult['label']
  colour: ScoredResult['colour']
  breakdown: ScoredResult['breakdown']
}

function ScoreBadge({ isAnalyzing, isEmpty, score, label, colour, breakdown }: ScoreBadgeProps) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-muted-foreground">Design Score</span>
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge
            variant="outline"
            className={`font-mono cursor-default ${isEmpty ? 'border-muted text-muted-foreground bg-muted/30' : COLOUR_CLASSES[colour]}`}
          >
            {isEmpty ? 'Add elements' : isAnalyzing ? '…' : `${label} · ${score}/100`}
          </Badge>
        </TooltipTrigger>
        <TooltipContent
          side="bottom"
          className="w-56 p-3 text-xs space-y-2 bg-popover text-popover-foreground border border-border shadow-md"
        >
          {isEmpty ? (
            <p className="text-muted-foreground">Draw shapes or add text to the canvas to get a design quality score.</p>
          ) : (
            <>
              <p className="font-semibold text-sm">Score Breakdown</p>
              <div className="space-y-1">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">AI spatial score</span>
                  <span className="font-mono">{breakdown.spatialScore}/100</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Issue penalties</span>
                  <span className="font-mono text-destructive">−{breakdown.penaltyDeducted}</span>
                </div>
                <div className="border-t border-border pt-1 flex justify-between font-semibold">
                  <span>Final score</span>
                  <span className="font-mono">{score}/100</span>
                </div>
              </div>
              {breakdown.issueCount > 0 && (
                <div className="space-y-0.5 pt-1 border-t border-border text-muted-foreground">
                  {breakdown.errorCount > 0 && (
                    <div className="flex justify-between">
                      <span>Errors (−{15} each)</span>
                      <span>{breakdown.errorCount}</span>
                    </div>
                  )}
                  {breakdown.warningCount > 0 && (
                    <div className="flex justify-between">
                      <span>Warnings (−{8} each)</span>
                      <span>{breakdown.warningCount}</span>
                    </div>
                  )}
                  {breakdown.infoCount > 0 && (
                    <div className="flex justify-between">
                      <span>Suggestions (−{3} each)</span>
                      <span>{breakdown.infoCount}</span>
                    </div>
                  )}
                </div>
              )}
              <div className="pt-2 border-t border-border text-[10px] text-muted-foreground/70 italic">
                Spatial score is optimised for mobile UI layouts. Use mobile frame presets for best results.
              </div>
            </>
          )}
        </TooltipContent>
      </Tooltip>
    </div>
  )
}

export function CanvasEditor() {
  const [browserOpen, setBrowserOpen] = useState(false)
  const [isMounted, setIsMounted] = useState(false)
  const { currentProject, createProject, projects, elements, saveProject } = useCanvasStore()
  
  // This hook constantly runs our local UI heuristics (contrast, sizing, etc.)
  // We debounce it so it doesn't freeze the browser while you're dragging stuff around
  const { score, label, colour, breakdown, errorCount, warningCount, infoCount, isAnalyzing } = useDesignAnalysis({
    debounceMs: 800,
    autoAnalyze: true,
  })
  
  // Collaboration setup (Liveblocks)
  // Grabs the list of other people in the room and lets us broadcast our mouse position
  const { collaborators, updateCursor, sessionId } = useCollaboration()

  // Standard React trick to avoid hydration mismatch errors with Next.js SSR
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

  // Auto-save elements into the current project whenever the canvas changes
  useEffect(() => {
    if (!currentProject) return
    const t = setTimeout(() => saveProject(), 1000)
    return () => clearTimeout(t)
  }, [elements, currentProject, saveProject])

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
          
          <ScoreBadge
            isAnalyzing={isAnalyzing}
            isEmpty={elements.length === 0}
            score={score}
            label={label}
            colour={colour}
            breakdown={breakdown}
          />
        </div>
      </div>

      {/* Toolbar */}
      <Toolbar />

      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Live Cursors Overlay */}
        {/* We map through everyone else in the room and draw their little colored mouse pointers */}
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
