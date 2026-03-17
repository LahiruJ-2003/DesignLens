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
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null)
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  
  const {
    elements,
    layers,
    selectedIds,
    selectElement,
    toggleLayerVisibility,
    toggleLayerLock,
    reorderLayers,
    renameLayer,
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

  // Drag and drop handlers
  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index)
    e.dataTransfer.effectAllowed = 'move'
  }

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    setDragOverIndex(index)
  }

  const handleDragLeave = () => {
    setDragOverIndex(null)
  }

  const handleDrop = (e: React.DragEvent, toIndex: number) => {
    e.preventDefault()
    if (draggedIndex !== null && draggedIndex !== toIndex) {
      reorderLayers(draggedIndex, toIndex)
    }
    setDraggedIndex(null)
    setDragOverIndex(null)
  }

  const handleDragEnd = () => {
    setDraggedIndex(null)
    setDragOverIndex(null)
  }

  // Move layer up/down with buttons
  const moveLayerUp = (index: number) => {
    if (index > 0) {
      reorderLayers(index, index - 1)
    }
  }

  const moveLayerDown = (index: number) => {
    if (index < layers.length - 1) {
      reorderLayers(index, index + 1)
    }
  }

  return (
    <div className="w-56 bg-panel-bg border-r border-border flex flex-col">
      <Collapsible open={isOpen} onOpenChange={setIsOpen} className="flex-1 flex flex-col">
        <CollapsibleTrigger className="flex items-center justify-between p-3 hover:bg-muted/50 transition-colors">
          <div className="flex items-center gap-2">
            <Layers className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium text-foreground">Layers</span>
            <span className="text-xs text-muted-foreground">({layers.length})</span>
          </div>
          <ChevronDown className={cn(
            'h-4 w-4 text-muted-foreground transition-transform',
            !isOpen && '-rotate-90'
          )} />
        </CollapsibleTrigger>
        
        <CollapsibleContent className="flex-1">
          <ScrollArea className="h-[calc(100vh-200px)]">
            <div className="p-2 space-y-0.5">
              {layers.length === 0 ? (
                <p className="text-xs text-muted-foreground text-center py-4">
                  No layers yet. Start drawing!
                </p>
              ) : (
                layers.map((layer, index) => {
                  const element = elements.find((el) => el.id === layer.elementId)
                  if (!element) return null
                  
                  const isSelected = selectedIds.includes(element.id)
                  const isEditing = editingLayerId === layer.id
                  const isDragging = draggedIndex === index
                  const isDragOver = dragOverIndex === index
                  
                  return (
                    <div
                      key={layer.id}
                      draggable={!isEditing}
                      onDragStart={(e) => handleDragStart(e, index)}
                      onDragOver={(e) => handleDragOver(e, index)}
                      onDragLeave={handleDragLeave}
                      onDrop={(e) => handleDrop(e, index)}
                      onDragEnd={handleDragEnd}
                      className={cn(
                        'flex items-center gap-1 px-1 py-1.5 rounded-md cursor-pointer group transition-all',
                        isSelected ? 'bg-primary/20' : 'hover:bg-muted/50',
                        isDragging && 'opacity-50',
                        isDragOver && 'border-t-2 border-primary'
                      )}
                      onClick={() => !isEditing && selectElement(element.id)}
                    >
                      {/* Drag handle */}
                      <div className="cursor-grab opacity-0 group-hover:opacity-100 transition-opacity">
                        <GripVertical className="h-3.5 w-3.5 text-muted-foreground" />
                      </div>
                      
                      <span className="text-muted-foreground flex-shrink-0">
                        {iconMap[element.type] || <Square className="h-3.5 w-3.5" />}
                      </span>
                      
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
                      
                      <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                        {/* Move up/down buttons */}
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-5 w-5 p-0"
                          onClick={(e) => {
                            e.stopPropagation()
                            moveLayerUp(index)
                          }}
                          disabled={index === 0}
                        >
                          <ChevronUp className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-5 w-5 p-0"
                          onClick={(e) => {
                            e.stopPropagation()
                            moveLayerDown(index)
                          }}
                          disabled={index === layers.length - 1}
                        >
                          <ChevronDown className="h-3 w-3" />
                        </Button>
                        
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
                  )
                })
              )}
            </div>
          </ScrollArea>
        </CollapsibleContent>
      </Collapsible>
    </div>
  )
}
