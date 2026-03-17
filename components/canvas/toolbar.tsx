// 'use client'

// import React from "react"

// import { useCanvasStore } from '@/lib/canvas-store'
// import type { ToolType } from '@/lib/types'
// import { cn } from '@/lib/utils'
// import {
//   MousePointer2,
//   Square,
//   Circle,
//   Type,
//   Minus,
//   Frame,
//   Hand,
//   ImageIcon,
//   ZoomIn,
//   ZoomOut,
//   Grid3X3,
//   Ruler,
//   Save,
//   Undo,
//   Redo,
// } from 'lucide-react'
// import { Button } from '@/components/ui/button'
// import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
// import { Separator } from '@/components/ui/separator'

// const tools: { type: ToolType; icon: React.ReactNode; label: string; shortcut: string }[] = [
//   { type: 'select', icon: <MousePointer2 className="h-4 w-4" />, label: 'Select', shortcut: 'V' },
//   { type: 'hand', icon: <Hand className="h-4 w-4" />, label: 'Hand', shortcut: 'H' },
//   { type: 'frame', icon: <Frame className="h-4 w-4" />, label: 'Frame', shortcut: 'F' },
//   { type: 'rectangle', icon: <Square className="h-4 w-4" />, label: 'Rectangle', shortcut: 'R' },
//   { type: 'circle', icon: <Circle className="h-4 w-4" />, label: 'Circle', shortcut: 'O' },
//   { type: 'line', icon: <Minus className="h-4 w-4" />, label: 'Line', shortcut: 'L' },
//   { type: 'text', icon: <Type className="h-4 w-4" />, label: 'Text', shortcut: 'T' },
//   { type: 'image', icon: <ImageIcon className="h-4 w-4" />, label: 'Image', shortcut: 'I' },
// ]

// export function Toolbar() {
//   const { 
//     activeTool, 
//     setActiveTool, 
//     zoom, 
//     setZoom, 
//     showGrid, 
//     showRulers, 
//     toggleGrid, 
//     toggleRulers,
//     saveProject,
//     currentProject,
//   } = useCanvasStore()

//   return (
//     <TooltipProvider delayDuration={200}>
//       <div className="flex items-center gap-1 bg-panel-bg border-b border-border px-3 py-2">
//         {/* Logo */}
//         <div className="flex items-center gap-2 mr-4">
//           <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center">
//             <span className="text-primary-foreground font-bold text-sm">DL</span>
//           </div>
//           <span className="font-semibold text-sm text-foreground hidden sm:inline">DesignLens</span>
//         </div>

//         <Separator orientation="vertical" className="h-6 mx-2" />

//         {/* Main Tools */}
//         <div className="flex items-center gap-0.5">
//           {tools.map((tool) => (
//             <Tooltip key={tool.type}>
//               <TooltipTrigger asChild>
//                 <Button
//                   variant="ghost"
//                   size="sm"
//                   className={cn(
//                     'h-8 w-8 p-0',
//                     activeTool === tool.type && 'bg-primary/20 text-primary hover:bg-primary/30'
//                   )}
//                   onClick={() => setActiveTool(tool.type)}
//                 >
//                   {tool.icon}
//                 </Button>
//               </TooltipTrigger>
//               <TooltipContent side="bottom">
//                 <p>{tool.label} <span className="text-muted-foreground ml-1">{tool.shortcut}</span></p>
//               </TooltipContent>
//             </Tooltip>
//           ))}
//         </div>

//         <Separator orientation="vertical" className="h-6 mx-2" />

//         {/* View Controls */}
//         <div className="flex items-center gap-0.5">
//           <Tooltip>
//             <TooltipTrigger asChild>
//               <Button
//                 variant="ghost"
//                 size="sm"
//                 className={cn('h-8 w-8 p-0', showGrid && 'bg-primary/20 text-primary')}
//                 onClick={toggleGrid}
//               >
//                 <Grid3X3 className="h-4 w-4" />
//               </Button>
//             </TooltipTrigger>
//             <TooltipContent side="bottom">
//               <p>Toggle Grid</p>
//             </TooltipContent>
//           </Tooltip>

//           <Tooltip>
//             <TooltipTrigger asChild>
//               <Button
//                 variant="ghost"
//                 size="sm"
//                 className={cn('h-8 w-8 p-0', showRulers && 'bg-primary/20 text-primary')}
//                 onClick={toggleRulers}
//               >
//                 <Ruler className="h-4 w-4" />
//               </Button>
//             </TooltipTrigger>
//             <TooltipContent side="bottom">
//               <p>Toggle Rulers</p>
//             </TooltipContent>
//           </Tooltip>
//         </div>

//         <Separator orientation="vertical" className="h-6 mx-2" />

//         {/* Zoom Controls */}
//         <div className="flex items-center gap-1">
//           <Button
//             variant="ghost"
//             size="sm"
//             className="h-8 w-8 p-0"
//             onClick={() => setZoom(zoom - 0.1)}
//             disabled={zoom <= 0.1}
//           >
//             <ZoomOut className="h-4 w-4" />
//           </Button>
//           <span className="text-xs text-muted-foreground w-12 text-center">
//             {Math.round(zoom * 100)}%
//           </span>
//           <Button
//             variant="ghost"
//             size="sm"
//             className="h-8 w-8 p-0"
//             onClick={() => setZoom(zoom + 0.1)}
//             disabled={zoom >= 5}
//           >
//             <ZoomIn className="h-4 w-4" />
//           </Button>
//         </div>

//         {/* Spacer */}
//         <div className="flex-1" />

//         {/* History & Save */}
//         <div className="flex items-center gap-0.5">
//           <Tooltip>
//             <TooltipTrigger asChild>
//               <Button variant="ghost" size="sm" className="h-8 w-8 p-0" disabled>
//                 <Undo className="h-4 w-4" />
//               </Button>
//             </TooltipTrigger>
//             <TooltipContent side="bottom">
//               <p>Undo <span className="text-muted-foreground">Ctrl+Z</span></p>
//             </TooltipContent>
//           </Tooltip>

//           <Tooltip>
//             <TooltipTrigger asChild>
//               <Button variant="ghost" size="sm" className="h-8 w-8 p-0" disabled>
//                 <Redo className="h-4 w-4" />
//               </Button>
//             </TooltipTrigger>
//             <TooltipContent side="bottom">
//               <p>Redo <span className="text-muted-foreground">Ctrl+Shift+Z</span></p>
//             </TooltipContent>
//           </Tooltip>

//           <Separator orientation="vertical" className="h-6 mx-2" />

//           <Tooltip>
//             <TooltipTrigger asChild>
//               <Button 
//                 variant="ghost" 
//                 size="sm" 
//                 className="h-8 px-3 gap-2"
//                 onClick={saveProject}
//                 disabled={!currentProject}
//               >
//                 <Save className="h-4 w-4" />
//                 <span className="text-xs hidden sm:inline">Save</span>
//               </Button>
//             </TooltipTrigger>
//             <TooltipContent side="bottom">
//               <p>Save Project <span className="text-muted-foreground">Ctrl+S</span></p>
//             </TooltipContent>
//           </Tooltip>
//         </div>
//       </div>
//     </TooltipProvider>
//   )
// }
'use client'

import React from "react"

import { useCanvasStore } from '@/lib/canvas-store'
import type { ToolType } from '@/lib/types'
import { cn } from '@/lib/utils'
import {
  MousePointer2,
  Square,
  Circle,
  Type,
  Minus,
  Frame,
  Hand,
  ImageIcon,
  ZoomIn,
  ZoomOut,
  Grid3X3,
  Ruler,
  Save,
  Undo,
  Redo,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { Separator } from '@/components/ui/separator'
import { UserMenu } from '@/components/user-menu'

const tools: { type: ToolType; icon: React.ReactNode; label: string; shortcut: string }[] = [
  { type: 'select', icon: <MousePointer2 className="h-4 w-4" />, label: 'Select', shortcut: 'V' },
  { type: 'hand', icon: <Hand className="h-4 w-4" />, label: 'Hand', shortcut: 'H' },
  { type: 'frame', icon: <Frame className="h-4 w-4" />, label: 'Frame', shortcut: 'F' },
  { type: 'rectangle', icon: <Square className="h-4 w-4" />, label: 'Rectangle', shortcut: 'R' },
  { type: 'circle', icon: <Circle className="h-4 w-4" />, label: 'Circle', shortcut: 'O' },
  { type: 'line', icon: <Minus className="h-4 w-4" />, label: 'Line', shortcut: 'L' },
  { type: 'text', icon: <Type className="h-4 w-4" />, label: 'Text', shortcut: 'T' },
  { type: 'image', icon: <ImageIcon className="h-4 w-4" />, label: 'Image', shortcut: 'I' },
]

export function Toolbar() {
  const { 
    activeTool, 
    setActiveTool, 
    zoom, 
    setZoom, 
    showGrid, 
    showRulers, 
    toggleGrid, 
    toggleRulers,
    saveProject,
    currentProject,
    undo,
    redo,
    canUndo,
    canRedo,
  } = useCanvasStore()

  return (
    <TooltipProvider delayDuration={200}>
      <div className="flex items-center gap-1 bg-panel-bg border-b border-border px-3 py-2">
        {/* Logo */}
        <div className="flex items-center gap-2 mr-4">
          <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center">
            <span className="text-primary-foreground font-bold text-sm">DL</span>
          </div>
          <span className="font-semibold text-sm text-foreground hidden sm:inline">DesignLens</span>
        </div>

        <Separator orientation="vertical" className="h-6 mx-2" />

        {/* Main Tools */}
        <div className="flex items-center gap-0.5">
          {tools.map((tool) => (
            <Tooltip key={tool.type}>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className={cn(
                    'h-8 w-8 p-0',
                    activeTool === tool.type && 'bg-primary/20 text-primary hover:bg-primary/30'
                  )}
                  onClick={() => setActiveTool(tool.type)}
                >
                  {tool.icon}
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom">
                <p>{tool.label} <span className="text-muted-foreground ml-1">{tool.shortcut}</span></p>
              </TooltipContent>
            </Tooltip>
          ))}
        </div>

        <Separator orientation="vertical" className="h-6 mx-2" />

        {/* View Controls */}
        <div className="flex items-center gap-0.5">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className={cn('h-8 w-8 p-0', showGrid && 'bg-primary/20 text-primary')}
                onClick={toggleGrid}
              >
                <Grid3X3 className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom">
              <p>Toggle Grid</p>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className={cn('h-8 w-8 p-0', showRulers && 'bg-primary/20 text-primary')}
                onClick={toggleRulers}
              >
                <Ruler className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom">
              <p>Toggle Rulers</p>
            </TooltipContent>
          </Tooltip>
        </div>

        <Separator orientation="vertical" className="h-6 mx-2" />

        {/* Zoom Controls */}
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0"
            onClick={() => setZoom(zoom - 0.1)}
            disabled={zoom <= 0.1}
          >
            <ZoomOut className="h-4 w-4" />
          </Button>
          <span className="text-xs text-muted-foreground w-12 text-center">
            {Math.round(zoom * 100)}%
          </span>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0"
            onClick={() => setZoom(zoom + 0.1)}
            disabled={zoom >= 5}
          >
            <ZoomIn className="h-4 w-4" />
          </Button>
        </div>

        {/* Spacer */}
        <div className="flex-1" />

        {/* User Menu */}
        <UserMenu />

        {/* History & Save */}
        <div className="flex items-center gap-0.5">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-8 w-8 p-0" 
                disabled={!canUndo()}
                onClick={undo}
              >
                <Undo className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom">
              <p>Undo <span className="text-muted-foreground">Ctrl+Z</span></p>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-8 w-8 p-0" 
                disabled={!canRedo()}
                onClick={redo}
              >
                <Redo className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom">
              <p>Redo <span className="text-muted-foreground">Ctrl+Shift+Z</span></p>
            </TooltipContent>
          </Tooltip>

          <Separator orientation="vertical" className="h-6 mx-2" />

          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-8 px-3 gap-2"
                onClick={saveProject}
                disabled={!currentProject}
              >
                <Save className="h-4 w-4" />
                <span className="text-xs hidden sm:inline">Save</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom">
              <p>Save Project <span className="text-muted-foreground">Ctrl+S</span></p>
            </TooltipContent>
          </Tooltip>
        </div>
      </div>
    </TooltipProvider>
  )
}
