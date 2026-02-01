'use client'

import { useEffect } from 'react'
import { Toolbar } from '@/components/canvas/toolbar'
import { DesignCanvas } from './design-canvas'
import { LayersPanel } from './layers-panel'
import { PropertiesPanel } from './properties-panel'
import { AIChatSidebar } from './ai-chat-sidebar'
import { ProjectManager } from './project-manager'
import { useDesignAnalysis } from '@/hooks/use-design-analysis'
import { useCanvasStore } from '@/lib/canvas-store'
import { Badge } from '@/components/ui/badge'
import { AlertCircle, AlertTriangle, Info } from 'lucide-react'

export function CanvasEditor() {
  const { currentProject, createProject, projects } = useCanvasStore()
  const { score, errorCount, warningCount, infoCount } = useDesignAnalysis({
    debounceMs: 800,
    autoAnalyze: true,
  })

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
        
        {/* Design Score */}
        <div className="flex items-center gap-4">
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
      <div className="flex-1 flex overflow-hidden">
        {/* Layers Panel */}
        <LayersPanel />

        {/* Canvas */}
        <DesignCanvas />

        {/* Properties Panel */}
        <PropertiesPanel />

        {/* AI Chat Sidebar */}
        <AIChatSidebar />
      </div>
    </div>
  )
}
