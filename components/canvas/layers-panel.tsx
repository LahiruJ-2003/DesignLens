// 'use client'

// import React from "react"

// import { useCanvasStore } from '@/lib/canvas-store'
// import { cn } from '@/lib/utils'
// import { Button } from '@/components/ui/button'
// import { ScrollArea } from '@/components/ui/scroll-area'
// import {
//   Eye,
//   EyeOff,
//   Lock,
//   Unlock,
//   Square,
//   Circle,
//   Type,
//   Minus,
//   Frame,
//   ImageIcon,
//   ChevronDown,
//   Layers,
// } from 'lucide-react'
// import {
//   Collapsible,
//   CollapsibleContent,
//   CollapsibleTrigger,
// } from '@/components/ui/collapsible'
// import { useState } from 'react'

// const iconMap: Record<string, React.ReactNode> = {
//   rectangle: <Square className="h-3.5 w-3.5" />,
//   circle: <Circle className="h-3.5 w-3.5" />,
//   text: <Type className="h-3.5 w-3.5" />,
//   line: <Minus className="h-3.5 w-3.5" />,
//   frame: <Frame className="h-3.5 w-3.5" />,
//   image: <ImageIcon className="h-3.5 w-3.5" />,
// }

// export function LayersPanel() {
//   const [isOpen, setIsOpen] = useState(true)
//   const {
//     elements,
//     layers,
//     selectedIds,
//     selectElement,
//     toggleLayerVisibility,
//     toggleLayerLock,
//   } = useCanvasStore()

//   return (
//     <div className="w-56 bg-panel-bg border-r border-border flex flex-col">
//       <Collapsible open={isOpen} onOpenChange={setIsOpen} className="flex-1 flex flex-col">
//         <CollapsibleTrigger className="flex items-center justify-between p-3 hover:bg-muted/50 transition-colors">
//           <div className="flex items-center gap-2">
//             <Layers className="h-4 w-4 text-muted-foreground" />
//             <span className="text-sm font-medium text-foreground">Layers</span>
//           </div>
//           <ChevronDown className={cn(
//             'h-4 w-4 text-muted-foreground transition-transform',
//             !isOpen && '-rotate-90'
//           )} />
//         </CollapsibleTrigger>
        
//         <CollapsibleContent className="flex-1">
//           <ScrollArea className="h-[calc(100vh-200px)]">
//             <div className="p-2 space-y-0.5">
//               {layers.length === 0 ? (
//                 <p className="text-xs text-muted-foreground text-center py-4">
//                   No layers yet. Start drawing!
//                 </p>
//               ) : (
//                 layers.map((layer) => {
//                   const element = elements.find((el) => el.id === layer.elementId)
//                   if (!element) return null
                  
//                   const isSelected = selectedIds.includes(element.id)
                  
//                   return (
//                     <div
//                       key={layer.id}
//                       className={cn(
//                         'flex items-center gap-2 px-2 py-1.5 rounded-md cursor-pointer group',
//                         isSelected ? 'bg-primary/20' : 'hover:bg-muted/50'
//                       )}
//                       onClick={() => selectElement(element.id)}
//                     >
//                       <span className="text-muted-foreground">
//                         {iconMap[element.type] || <Square className="h-3.5 w-3.5" />}
//                       </span>
                      
//                       <span className={cn(
//                         'flex-1 text-xs truncate',
//                         isSelected ? 'text-primary' : 'text-foreground'
//                       )}>
//                         {layer.name}
//                       </span>
                      
//                       <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
//                         <Button
//                           variant="ghost"
//                           size="sm"
//                           className="h-6 w-6 p-0"
//                           onClick={(e) => {
//                             e.stopPropagation()
//                             toggleLayerVisibility(layer.id)
//                           }}
//                         >
//                           {layer.visible ? (
//                             <Eye className="h-3 w-3" />
//                           ) : (
//                             <EyeOff className="h-3 w-3 text-muted-foreground" />
//                           )}
//                         </Button>
//                         <Button
//                           variant="ghost"
//                           size="sm"
//                           className="h-6 w-6 p-0"
//                           onClick={(e) => {
//                             e.stopPropagation()
//                             toggleLayerLock(layer.id)
//                           }}
//                         >
//                           {layer.locked ? (
//                             <Lock className="h-3 w-3 text-warning" />
//                           ) : (
//                             <Unlock className="h-3 w-3" />
//                           )}
//                         </Button>
//                       </div>
//                     </div>
//                   )
//                 })
//               )}
//             </div>
//           </ScrollArea>
//         </CollapsibleContent>
//       </Collapsible>
//     </div>
//   )
// }
'use client'

import React, { useState, useRef } from "react"
import { useCanvasStore } from '@/lib/canvas-store'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Eye,
  EyeOff,
  Lock,
  Unlock,
  Square,
  Circle,
  Type,
  Minus,
  Frame,
  ImageIcon,
  ChevronDown,
  Layers,
  GripVertical,
  ChevronUp,
} from 'lucide-react'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'

const iconMap: Record<string, React.ReactNode> = {
  rectangle: <Square className="h-3.5 w-3.5" />,
  circle: <Circle className="h-3.5 w-3.5" />,
  text: <Type className="h-3.5 w-3.5" />,
  line: <Minus className="h-3.5 w-3.5" />,
  frame: <Frame className="h-3.5 w-3.5" />,
  image: <ImageIcon className="h-3.5 w-3.5" />,
}

export function LayersPanel() {
  const [isOpen, setIsOpen] = useState(true)
  const [editingLayerId, setEditingLayerId] = useState<string | null>(null)
  const [editingName, setEditingName] = useState('')
  const [draggedElementId, setDraggedElementId] = useState<string | null>(null)
  const [dragOverElementId, setDragOverElementId] = useState<string | null>(null)
  const [expandedParents, setExpandedParents] = useState<Set<string>>(new Set())
  const inputRef = useRef<HTMLInputElement>(null)
  
  const {
    elements,
    layers,
    selectedIds,
    selectElement,
    toggleLayerVisibility,
    toggleLayerLock,
    renameLayer,
    setElementParent,
    getChildElements,
  } = useCanvasStore()

  const handleDoubleClick = (layerId: string, currentName: string) => {
    setEditingLayerId(layerId)
    setEditingName(currentName)
    setTimeout(() => inputRef.current?.focus(), 0)
  }

  const handleRenameSubmit = (layerId: string) => {
    if (editingName.trim()) {
      renameLayer(layerId, editingName.trim())
    }
    setEditingLayerId(null)
    setEditingName('')
  }

  const handleKeyDown = (e: React.KeyboardEvent, layerId: string) => {
    if (e.key === 'Enter') {
      handleRenameSubmit(layerId)
    } else if (e.key === 'Escape') {
      setEditingLayerId(null)
      setEditingName('')
    }
  }

  const toggleExpanded = (elementId: string) => {
    const newExpanded = new Set(expandedParents)
    if (newExpanded.has(elementId)) {
      newExpanded.delete(elementId)
    } else {
      newExpanded.add(elementId)
    }
    setExpandedParents(newExpanded)
  }

  // Drag and drop handlers for parent-child relationships
  const handleDragStart = (e: React.DragEvent, elementId: string) => {
    setDraggedElementId(elementId)
    e.dataTransfer.effectAllowed = 'move'
  }

  const handleDragOver = (e: React.DragEvent, elementId: string) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    setDragOverElementId(elementId)
  }

  const handleDragLeave = () => {
    setDragOverElementId(null)
  }

  const handleDrop = (e: React.DragEvent, targetElementId: string) => {
    e.preventDefault()
    if (!draggedElementId || draggedElementId === targetElementId) {
      setDraggedElementId(null)
      setDragOverElementId(null)
      return
    }

    const draggedElement = elements.find((el) => el.id === draggedElementId)
    const targetElement = elements.find((el) => el.id === targetElementId)

    if (!draggedElement || !targetElement) {
      setDraggedElementId(null)
      setDragOverElementId(null)
      return
    }

    // Drop on frame = add to frame
    if (targetElement.type === 'frame') {
      setElementParent(draggedElementId, targetElementId)
      setExpandedParents(new Set(expandedParents).add(targetElementId))
    }

    setDraggedElementId(null)
    setDragOverElementId(null)
  }

  const handleDragEnd = () => {
    setDraggedElementId(null)
    setDragOverElementId(null)
  }

  // Render layer tree recursively
  const renderLayerTree = (parentId: string | undefined = undefined, depth: number = 0) => {
    const layerElements = parentId 
      ? getChildElements(parentId).filter((el) => layers.some((l) => l.elementId === el.id))
      : elements.filter((el) => !el.parentId && layers.some((l) => l.elementId === el.id))

    return layerElements.map((element) => {
      const layer = layers.find((l) => l.elementId === element.id)
      if (!layer) return null

      const isSelected = selectedIds.includes(element.id)
      const isEditing = editingLayerId === layer.id
      const isDragging = draggedElementId === element.id
      const isDragOver = dragOverElementId === element.id
      const hasChildren = element.type === 'frame' && getChildElements(element.id).length > 0
      const isExpanded = expandedParents.has(element.id)

      return (
        <div key={element.id}>
          <div
            draggable={!isEditing}
            onDragStart={(e) => handleDragStart(e, element.id)}
            onDragOver={(e) => handleDragOver(e, element.id)}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, element.id)}
            onDragEnd={handleDragEnd}
            className={cn(
              'flex items-center gap-1 px-1 py-1 rounded-md cursor-pointer group transition-all',
              isSelected ? 'bg-primary/20' : 'hover:bg-muted/50',
              isDragging && 'opacity-50',
              isDragOver && 'bg-primary/10 border-l-2 border-primary'
            )}
            style={{ marginLeft: `${depth * 12}px` }}
            onClick={() => !isEditing && selectElement(element.id)}
          >
            {/* Expand/collapse toggle */}
            {hasChildren ? (
              <button
                className="p-0 hover:bg-muted rounded text-xs"
                onClick={(e) => {
                  e.stopPropagation()
                  toggleExpanded(element.id)
                }}
              >
                <ChevronDown
                  className={cn(
                    'h-3.5 w-3.5 transition-transform',
                    !isExpanded && '-rotate-90'
                  )}
                />
              </button>
            ) : (
              <div className="w-3.5" />
            )}

            {/* Drag handle */}
            <div className="cursor-grab opacity-0 group-hover:opacity-100 transition-opacity">
              <GripVertical className="h-3 w-3 text-muted-foreground" />
            </div>

            {/* Icon */}
            <span className="text-muted-foreground shrink-0">
              {iconMap[element.type] || <Square className="h-3.5 w-3.5" />}
            </span>

            {/* Name */}
            {isEditing ? (
              <Input
                ref={inputRef}
                value={editingName}
                onChange={(e) => setEditingName(e.target.value)}
                onBlur={() => handleRenameSubmit(layer.id)}
                onKeyDown={(e) => handleKeyDown(e, layer.id)}
                className="h-5 text-xs py-0 px-1 flex-1"
                onClick={(e) => e.stopPropagation()}
              />
            ) : (
              <span
                className={cn(
                  'flex-1 text-xs truncate',
                  isSelected ? 'text-primary' : 'text-foreground'
                )}
                onDoubleClick={() => handleDoubleClick(layer.id, layer.name)}
              >
                {layer.name}
              </span>
            )}

            {/* Controls */}
            <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
              <Button
                variant="ghost"
                size="sm"
                className="h-5 w-5 p-0"
                onClick={(e) => {
                  e.stopPropagation()
                  toggleLayerVisibility(layer.id)
                }}
              >
                {layer.visible ? (
                  <Eye className="h-3 w-3" />
                ) : (
                  <EyeOff className="h-3 w-3 text-muted-foreground" />
                )}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-5 w-5 p-0"
                onClick={(e) => {
                  e.stopPropagation()
                  toggleLayerLock(layer.id)
                }}
              >
                {layer.locked ? (
                  <Lock className="h-3 w-3 text-warning" />
                ) : (
                  <Unlock className="h-3 w-3" />
                )}
              </Button>
            </div>
          </div>

          {/* Render children if expanded */}
          {hasChildren && isExpanded && (
            <div className="space-y-0">
              {renderLayerTree(element.id, depth + 1)}
            </div>
          )}
        </div>
      )
    })
  }

  return (
    <div className="w-56 bg-panel-bg border-r border-border flex flex-col">
      <Collapsible open={isOpen} onOpenChange={setIsOpen} className="flex-1 flex flex-col">
        <CollapsibleTrigger className="flex items-center justify-between p-3 hover:bg-muted/50 transition-colors">
          <div className="flex items-center gap-2">
            <Layers className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium text-foreground">Layers</span>
            <span className="text-xs text-muted-foreground">({elements.length})</span>
          </div>
          <ChevronDown className={cn(
            'h-4 w-4 text-muted-foreground transition-transform',
            !isOpen && '-rotate-90'
          )} />
        </CollapsibleTrigger>

        <CollapsibleContent className="flex-1">
          <ScrollArea className="h-[calc(100vh-200px)]">
            <div className="p-2 space-y-0">
              {elements.length === 0 ? (
                <p className="text-xs text-muted-foreground text-center py-4">
                  No layers yet. Start drawing!
                </p>
              ) : (
                <>
                  <div
                    onDragOver={(e) => {
                      e.preventDefault()
                      e.dataTransfer.dropEffect = 'move'
                    }}
                    onDrop={(e) => {
                      e.preventDefault()
                      if (draggedElementId) {
                        const draggedElement = elements.find((el) => el.id === draggedElementId)
                        // If dragging from a frame, remove it from parent
                        if (draggedElement?.parentId) {
                          setElementParent(draggedElementId, null)
                        }
                      }
                      setDraggedElementId(null)
                      setDragOverElementId(null)
                    }}
                    className="min-h-8 px-2"
                  >
                    {renderLayerTree()}
                  </div>
                  <div className="text-xs text-muted-foreground px-2 py-2 border-t border-border mt-2">
                    💡 Drag layers into frames to nest. Drag out to remove from frame.
                  </div>
                </>
              )}
            </div>
          </ScrollArea>
        </CollapsibleContent>
      </Collapsible>
    </div>
  )
}
