// 'use client'

// import React from "react"

// import { useRef, useState, useEffect, useCallback } from 'react'
// import { useCanvasStore } from '@/lib/canvas-store'
// import type { CanvasElement } from '@/lib/types'
// import { cn } from '@/lib/utils'

// const generateId = () => Math.random().toString(36).substring(2, 15)

// export function DesignCanvas() {
//   const canvasRef = useRef<HTMLDivElement>(null)
//   const [isDrawing, setIsDrawing] = useState(false)
//   const [startPos, setStartPos] = useState({ x: 0, y: 0 })
//   const [currentPos, setCurrentPos] = useState({ x: 0, y: 0 })
//   const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })
//   const [isDragging, setIsDragging] = useState(false)
//   const [isResizing, setIsResizing] = useState(false)
//   const [resizeHandle, setResizeHandle] = useState<string | null>(null)
//   const [isPanning, setIsPanning] = useState(false)
//   const [panStart, setPanStart] = useState({ x: 0, y: 0 })

//   const {
//     elements,
//     selectedIds,
//     activeTool,
//     activeColor,
//     activeStroke,
//     activeStrokeWidth,
//     zoom,
//     panOffset,
//     setPanOffset,
//     showGrid,
//     showIssueHighlights,
//     issues,
//     addElement,
//     updateElement,
//     selectElement,
//     deselectAll,
//   } = useCanvasStore()

//   const getCanvasCoords = useCallback((e: React.MouseEvent) => {
//     if (!canvasRef.current) return { x: 0, y: 0 }
//     const rect = canvasRef.current.getBoundingClientRect()
//     return {
//       x: (e.clientX - rect.left - panOffset.x) / zoom,
//       y: (e.clientY - rect.top - panOffset.y) / zoom,
//     }
//   }, [zoom, panOffset])

//   const handleMouseDown = (e: React.MouseEvent) => {
//     const coords = getCanvasCoords(e)
    
//     if (activeTool === 'hand' || e.button === 1) {
//       setIsPanning(true)
//       setPanStart({ x: e.clientX - panOffset.x, y: e.clientY - panOffset.y })
//       return
//     }

//     if (activeTool === 'select') {
//       // Check if clicking on an element
//       const clickedElement = [...elements].reverse().find((el) => {
//         const visible = el.visible !== false
//         return visible &&
//           coords.x >= el.x &&
//           coords.x <= el.x + el.width &&
//           coords.y >= el.y &&
//           coords.y <= el.y + el.height
//       })

//       if (clickedElement) {
//         if (!selectedIds.includes(clickedElement.id)) {
//           selectElement(clickedElement.id, e.shiftKey)
//         }
//         setIsDragging(true)
//         setDragOffset({
//           x: coords.x - clickedElement.x,
//           y: coords.y - clickedElement.y,
//         })
//       } else {
//         deselectAll()
//       }
//       return
//     }

//     // Drawing tools
//     if (['rectangle', 'circle', 'frame', 'line', 'text'].includes(activeTool)) {
//       setIsDrawing(true)
//       setStartPos(coords)
//       setCurrentPos(coords)
//     }
//   }

//   const handleMouseMove = (e: React.MouseEvent) => {
//     const coords = getCanvasCoords(e)

//     if (isPanning) {
//       setPanOffset({
//         x: e.clientX - panStart.x,
//         y: e.clientY - panStart.y,
//       })
//       return
//     }

//     if (isDragging && selectedIds.length > 0) {
//       const primaryElement = elements.find((el) => el.id === selectedIds[0])
//       if (primaryElement && !primaryElement.locked) {
//         const dx = coords.x - dragOffset.x - primaryElement.x
//         const dy = coords.y - dragOffset.y - primaryElement.y
        
//         selectedIds.forEach((id) => {
//           const el = elements.find((e) => e.id === id)
//           if (el && !el.locked) {
//             updateElement(id, {
//               x: el.x + dx,
//               y: el.y + dy,
//             })
//           }
//         })
//         setDragOffset({
//           x: coords.x - (primaryElement.x + dx),
//           y: coords.y - (primaryElement.y + dy),
//         })
//       }
//       return
//     }

//     if (isResizing && selectedIds.length === 1 && resizeHandle) {
//       const element = elements.find((el) => el.id === selectedIds[0])
//       if (element) {
//         const updates: Partial<CanvasElement> = {}
        
//         if (resizeHandle.includes('e')) {
//           updates.width = Math.max(10, coords.x - element.x)
//         }
//         if (resizeHandle.includes('w')) {
//           const newWidth = Math.max(10, element.x + element.width - coords.x)
//           updates.x = element.x + element.width - newWidth
//           updates.width = newWidth
//         }
//         if (resizeHandle.includes('s')) {
//           updates.height = Math.max(10, coords.y - element.y)
//         }
//         if (resizeHandle.includes('n')) {
//           const newHeight = Math.max(10, element.y + element.height - coords.y)
//           updates.y = element.y + element.height - newHeight
//           updates.height = newHeight
//         }
        
//         updateElement(element.id, updates)
//       }
//       return
//     }

//     if (isDrawing) {
//       setCurrentPos(coords)
//     }
//   }

//   const handleMouseUp = () => {
//     if (isPanning) {
//       setIsPanning(false)
//       return
//     }

//     if (isDragging) {
//       setIsDragging(false)
//       return
//     }

//     if (isResizing) {
//       setIsResizing(false)
//       setResizeHandle(null)
//       return
//     }

//     if (isDrawing) {
//       const width = Math.abs(currentPos.x - startPos.x)
//       const height = Math.abs(currentPos.y - startPos.y)
      
//       if (width > 5 || height > 5 || activeTool === 'text') {
//         const x = Math.min(startPos.x, currentPos.x)
//         const y = Math.min(startPos.y, currentPos.y)
        
//         const elementCount = elements.filter((el) => el.type === activeTool).length + 1
        
//         const newElement: CanvasElement = {
//           id: generateId(),
//           type: activeTool === 'frame' ? 'frame' : activeTool as CanvasElement['type'],
//           x,
//           y,
//           width: activeTool === 'text' ? 200 : Math.max(width, 50),
//           height: activeTool === 'text' ? 40 : Math.max(height, 50),
//           rotation: 0,
//           fill: activeTool === 'frame' ? 'transparent' : activeColor,
//           stroke: activeStroke,
//           strokeWidth: activeStrokeWidth,
//           opacity: 1,
//           cornerRadius: 0,
//           name: `${activeTool.charAt(0).toUpperCase() + activeTool.slice(1)} ${elementCount}`,
//           text: activeTool === 'text' ? 'Type something...' : undefined,
//           fontSize: activeTool === 'text' ? 16 : undefined,
//           fontFamily: activeTool === 'text' ? 'Inter' : undefined,
//           visible: true,
//           locked: false,
//         }
        
//         addElement(newElement)
//         selectElement(newElement.id)
//       }
      
//       setIsDrawing(false)
//     }
//   }

//   const startResize = (e: React.MouseEvent, handle: string) => {
//     e.stopPropagation()
//     setIsResizing(true)
//     setResizeHandle(handle)
//   }

//   // Keyboard shortcuts
//   useEffect(() => {
//     const handleKeyDown = (e: KeyboardEvent) => {
//       if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return
      
//       const { setActiveTool, deleteElement, duplicateElement } = useCanvasStore.getState()
      
//       switch (e.key.toLowerCase()) {
//         case 'v':
//           setActiveTool('select')
//           break
//         case 'h':
//           setActiveTool('hand')
//           break
//         case 'r':
//           setActiveTool('rectangle')
//           break
//         case 'o':
//           setActiveTool('circle')
//           break
//         case 't':
//           setActiveTool('text')
//           break
//         case 'l':
//           setActiveTool('line')
//           break
//         case 'f':
//           setActiveTool('frame')
//           break
//         case 'delete':
//         case 'backspace':
//           selectedIds.forEach((id) => deleteElement(id))
//           break
//         case 'd':
//           if (e.ctrlKey || e.metaKey) {
//             e.preventDefault()
//             selectedIds.forEach((id) => duplicateElement(id))
//           }
//           break
//         case 'escape':
//           deselectAll()
//           break
//       }
//     }

//     window.addEventListener('keydown', handleKeyDown)
//     return () => window.removeEventListener('keydown', handleKeyDown)
//   }, [selectedIds, deselectAll])

//   const renderElement = (element: CanvasElement) => {
//     if (element.visible === false) return null
    
//     const isSelected = selectedIds.includes(element.id)
//     const hasIssue = showIssueHighlights && issues.some((issue) => issue.elementIds.includes(element.id))
//     const issue = issues.find((i) => i.elementIds.includes(element.id))
    
//     const baseStyle: React.CSSProperties = {
//       position: 'absolute',
//       left: element.x,
//       top: element.y,
//       width: element.width,
//       height: element.height,
//       transform: `rotate(${element.rotation}deg)`,
//       opacity: element.opacity,
//       cursor: element.locked ? 'not-allowed' : activeTool === 'select' ? 'move' : 'crosshair',
//     }

//     const renderShape = () => {
//       switch (element.type) {
//         case 'rectangle':
//         case 'frame':
//           return (
//             <div
//               style={{
//                 ...baseStyle,
//                 backgroundColor: element.fill,
//                 border: `${element.strokeWidth}px solid ${element.stroke}`,
//                 borderRadius: element.cornerRadius,
//               }}
//             />
//           )
//         case 'circle':
//           return (
//             <div
//               style={{
//                 ...baseStyle,
//                 backgroundColor: element.fill,
//                 border: `${element.strokeWidth}px solid ${element.stroke}`,
//                 borderRadius: '50%',
//               }}
//             />
//           )
//         case 'text':
//           return (
//             <div
//               style={{
//                 ...baseStyle,
//                 backgroundColor: 'transparent',
//                 display: 'flex',
//                 alignItems: 'center',
//                 justifyContent: element.textAlign || 'left',
//                 fontSize: element.fontSize,
//                 fontFamily: element.fontFamily,
//                 fontWeight: element.fontWeight,
//                 color: element.fill,
//                 padding: '4px',
//               }}
//             >
//               {element.text}
//             </div>
//           )
//         case 'line':
//           return (
//             <svg
//               style={{
//                 ...baseStyle,
//                 overflow: 'visible',
//               }}
//             >
//               <line
//                 x1="0"
//                 y1={element.height / 2}
//                 x2={element.width}
//                 y2={element.height / 2}
//                 stroke={element.stroke}
//                 strokeWidth={element.strokeWidth}
//               />
//             </svg>
//           )
//         default:
//           return null
//       }
//     }

//     return (
//       <div key={element.id} className="absolute" style={{ left: 0, top: 0 }}>
//         {renderShape()}
        
//         {/* Issue indicator */}
//         {hasIssue && issue && (
//           <div
//             className={cn(
//               'absolute -top-6 left-0 px-2 py-1 rounded text-xs font-medium',
//               issue.severity === 'error' && 'bg-destructive text-destructive-foreground',
//               issue.severity === 'warning' && 'bg-warning text-background',
//               issue.severity === 'info' && 'bg-info text-primary-foreground'
//             )}
//             style={{ left: element.x, top: element.y - 24 }}
//           >
//             {issue.type}
//           </div>
//         )}
        
//         {/* Selection box */}
//         {isSelected && (
//           <div
//             className="absolute border-2 border-primary pointer-events-none"
//             style={{
//               left: element.x - 2,
//               top: element.y - 2,
//               width: element.width + 4,
//               height: element.height + 4,
//             }}
//           >
//             {/* Resize handles */}
//             {!element.locked && (
//               <>
//                 {['nw', 'n', 'ne', 'w', 'e', 'sw', 's', 'se'].map((handle) => {
//                   const positions: Record<string, { left: string; top: string; cursor: string }> = {
//                     nw: { left: '-4px', top: '-4px', cursor: 'nwse-resize' },
//                     n: { left: '50%', top: '-4px', cursor: 'ns-resize' },
//                     ne: { left: 'calc(100% - 4px)', top: '-4px', cursor: 'nesw-resize' },
//                     w: { left: '-4px', top: '50%', cursor: 'ew-resize' },
//                     e: { left: 'calc(100% - 4px)', top: '50%', cursor: 'ew-resize' },
//                     sw: { left: '-4px', top: 'calc(100% - 4px)', cursor: 'nesw-resize' },
//                     s: { left: '50%', top: 'calc(100% - 4px)', cursor: 'ns-resize' },
//                     se: { left: 'calc(100% - 4px)', top: 'calc(100% - 4px)', cursor: 'nwse-resize' },
//                   }
//                   const pos = positions[handle]
//                   return (
//                     <div
//                       key={handle}
//                       className="absolute w-2 h-2 bg-primary border border-primary-foreground rounded-sm pointer-events-auto"
//                       style={{
//                         left: pos.left,
//                         top: pos.top,
//                         transform: 'translate(-50%, -50%)',
//                         cursor: pos.cursor,
//                       }}
//                       onMouseDown={(e) => startResize(e, handle)}
//                     />
//                   )
//                 })}
//               </>
//             )}
//           </div>
//         )}
//       </div>
//     )
//   }

//   return (
//     <div
//       ref={canvasRef}
//       className={cn(
//         'flex-1 relative overflow-hidden bg-canvas-bg',
//         activeTool === 'hand' && 'cursor-grab',
//         isPanning && 'cursor-grabbing'
//       )}
//       onMouseDown={handleMouseDown}
//       onMouseMove={handleMouseMove}
//       onMouseUp={handleMouseUp}
//       onMouseLeave={handleMouseUp}
//     >
//       {/* Grid */}
//       {showGrid && (
//         <div
//           className="absolute inset-0 pointer-events-none"
//           style={{
//             backgroundImage: `
//               linear-gradient(to right, var(--canvas-grid) 1px, transparent 1px),
//               linear-gradient(to bottom, var(--canvas-grid) 1px, transparent 1px)
//             `,
//             backgroundSize: `${20 * zoom}px ${20 * zoom}px`,
//             backgroundPosition: `${panOffset.x}px ${panOffset.y}px`,
//           }}
//         />
//       )}

//       {/* Canvas content */}
//       <div
//         className="absolute"
//         style={{
//           transform: `translate(${panOffset.x}px, ${panOffset.y}px) scale(${zoom})`,
//           transformOrigin: '0 0',
//         }}
//       >
//         {elements.map(renderElement)}
        
//         {/* Drawing preview */}
//         {isDrawing && (
//           <div
//             className="absolute border-2 border-dashed border-primary bg-primary/20 pointer-events-none"
//             style={{
//               left: Math.min(startPos.x, currentPos.x),
//               top: Math.min(startPos.y, currentPos.y),
//               width: Math.abs(currentPos.x - startPos.x),
//               height: Math.abs(currentPos.y - startPos.y),
//               borderRadius: activeTool === 'circle' ? '50%' : 0,
//             }}
//           />
//         )}
//       </div>

//       {/* Zoom indicator */}
//       <div className="absolute bottom-4 left-4 bg-panel-bg/90 backdrop-blur-sm rounded-lg px-3 py-1.5 text-xs text-muted-foreground">
//         {Math.round(zoom * 100)}%
//       </div>
//     </div>
//   )
// }
'use client'

import React from "react"

import { useRef, useState, useEffect, useCallback } from 'react'
import { useCanvasStore } from '@/lib/canvas-store'
import type { CanvasElement } from '@/lib/types'
import { cn } from '@/lib/utils'

const generateId = () => Math.random().toString(36).substring(2, 15)

export function DesignCanvas() {
  const canvasRef = useRef<HTMLDivElement>(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const [startPos, setStartPos] = useState({ x: 0, y: 0 })
  const [currentPos, setCurrentPos] = useState({ x: 0, y: 0 })
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [isResizing, setIsResizing] = useState(false)
  const [resizeHandle, setResizeHandle] = useState<string | null>(null)
  const [isPanning, setIsPanning] = useState(false)
  const [panStart, setPanStart] = useState({ x: 0, y: 0 })
  const [editingText, setEditingText] = useState('')
  const textInputRef = useRef<HTMLInputElement>(null)
  const imageInputRef = useRef<HTMLInputElement>(null)

  const {
    elements,
    selectedIds,
    activeTool,
    activeColor,
    activeStroke,
    activeStrokeWidth,
    zoom,
    panOffset,
    setPanOffset,
    showGrid,
    showIssueHighlights,
    issues,
    addElement,
    updateElement,
    selectElement,
    deselectAll,
    setActiveTool,
    getFrameChildren,
    moveFrameWithChildren,
    undo,
    redo,
    pushHistory,
    editingTextId,
    setEditingTextId,
  } = useCanvasStore()

  const getCanvasCoords = useCallback((e: React.MouseEvent) => {
    if (!canvasRef.current) return { x: 0, y: 0 }
    const rect = canvasRef.current.getBoundingClientRect()
    return {
      x: (e.clientX - rect.left - panOffset.x) / zoom,
      y: (e.clientY - rect.top - panOffset.y) / zoom,
    }
  }, [zoom, panOffset])

  const handleMouseDown = (e: React.MouseEvent) => {
    const coords = getCanvasCoords(e)
    
    if (activeTool === 'hand' || e.button === 1) {
      setIsPanning(true)
      setPanStart({ x: e.clientX - panOffset.x, y: e.clientY - panOffset.y })
      return
    }

    if (activeTool === 'select') {
      // Check if clicking on an element
      const clickedElement = [...elements].reverse().find((el) => {
        const visible = el.visible !== false
        return visible &&
          coords.x >= el.x &&
          coords.x <= el.x + el.width &&
          coords.y >= el.y &&
          coords.y <= el.y + el.height
      })

      if (clickedElement) {
        if (!selectedIds.includes(clickedElement.id)) {
          selectElement(clickedElement.id, e.shiftKey)
        }
        setIsDragging(true)
        setDragOffset({
          x: coords.x - clickedElement.x,
          y: coords.y - clickedElement.y,
        })
      } else {
        deselectAll()
      }
      return
    }

    // Drawing tools
    if (['rectangle', 'circle', 'frame', 'line', 'text'].includes(activeTool)) {
      setIsDrawing(true)
      setStartPos(coords)
      setCurrentPos(coords)
    }
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    const coords = getCanvasCoords(e)

    if (isPanning) {
      setPanOffset({
        x: e.clientX - panStart.x,
        y: e.clientY - panStart.y,
      })
      return
    }

    if (isDragging && selectedIds.length > 0) {
      const primaryElement = elements.find((el) => el.id === selectedIds[0])
      if (primaryElement && !primaryElement.locked) {
        const dx = coords.x - dragOffset.x - primaryElement.x
        const dy = coords.y - dragOffset.y - primaryElement.y
        
        // If dragging a frame, move all children with it
        if (primaryElement.type === 'frame') {
          moveFrameWithChildren(primaryElement.id, dx, dy)
        } else {
          selectedIds.forEach((id) => {
            const el = elements.find((e) => e.id === id)
            if (el && !el.locked) {
              updateElement(id, {
                x: el.x + dx,
                y: el.y + dy,
              })
            }
          })
        }
        setDragOffset({
          x: coords.x - (primaryElement.x + dx),
          y: coords.y - (primaryElement.y + dy),
        })
      }
      return
    }

    if (isResizing && selectedIds.length === 1 && resizeHandle) {
      const element = elements.find((el) => el.id === selectedIds[0])
      if (element) {
        const updates: Partial<CanvasElement> = {}
        
        if (resizeHandle.includes('e')) {
          updates.width = Math.max(10, coords.x - element.x)
        }
        if (resizeHandle.includes('w')) {
          const newWidth = Math.max(10, element.x + element.width - coords.x)
          updates.x = element.x + element.width - newWidth
          updates.width = newWidth
        }
        if (resizeHandle.includes('s')) {
          updates.height = Math.max(10, coords.y - element.y)
        }
        if (resizeHandle.includes('n')) {
          const newHeight = Math.max(10, element.y + element.height - coords.y)
          updates.y = element.y + element.height - newHeight
          updates.height = newHeight
        }
        
        updateElement(element.id, updates)
      }
      return
    }

    if (isDrawing) {
      setCurrentPos(coords)
    }
  }

  const handleMouseUp = () => {
    if (isPanning) {
      setIsPanning(false)
      return
    }

    if (isDragging) {
      setIsDragging(false)
      pushHistory()
      return
    }

    if (isResizing) {
      setIsResizing(false)
      setResizeHandle(null)
      pushHistory()
      return
    }

    if (isDrawing) {
      const width = Math.abs(currentPos.x - startPos.x)
      const height = Math.abs(currentPos.y - startPos.y)
      
      if (width > 5 || height > 5 || activeTool === 'text') {
        const x = Math.min(startPos.x, currentPos.x)
        const y = Math.min(startPos.y, currentPos.y)
        
        const elementCount = elements.filter((el) => el.type === activeTool).length + 1
        
        const newElement: CanvasElement = {
          id: generateId(),
          type: activeTool === 'frame' ? 'frame' : activeTool as CanvasElement['type'],
          x,
          y,
          width: activeTool === 'text' ? 200 : Math.max(width, 50),
          height: activeTool === 'text' ? 40 : Math.max(height, 50),
          rotation: 0,
          fill: activeTool === 'frame' ? 'transparent' : activeColor,
          stroke: activeStroke,
          strokeWidth: activeStrokeWidth,
          opacity: 1,
          cornerRadius: 0,
          name: `${activeTool.charAt(0).toUpperCase() + activeTool.slice(1)} ${elementCount}`,
          text: activeTool === 'text' ? 'Type something...' : undefined,
          fontSize: activeTool === 'text' ? 16 : undefined,
          fontFamily: activeTool === 'text' ? 'Inter' : undefined,
          visible: true,
          locked: false,
        }
        
        addElement(newElement)
        selectElement(newElement.id)
        pushHistory()
      }
      
      setIsDrawing(false)
    }
  }

  const startResize = (e: React.MouseEvent, handle: string) => {
    e.stopPropagation()
    setIsResizing(true)
    setResizeHandle(handle)
  }

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return
      
      const { setActiveTool, deleteElement, duplicateElement, undo, redo } = useCanvasStore.getState()
      
      // Undo: Ctrl+Z
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z' && !e.shiftKey) {
        e.preventDefault()
        undo()
        return
      }
      
      // Redo: Ctrl+Shift+Z or Ctrl+Y
      if ((e.ctrlKey || e.metaKey) && (e.key.toLowerCase() === 'z' && e.shiftKey || e.key.toLowerCase() === 'y')) {
        e.preventDefault()
        redo()
        return
      }
      
      switch (e.key.toLowerCase()) {
        case 'v':
          setActiveTool('select')
          break
        case 'h':
          setActiveTool('hand')
          break
        case 'r':
          setActiveTool('rectangle')
          break
        case 'o':
          setActiveTool('circle')
          break
        case 't':
          setActiveTool('text')
          break
        case 'l':
          setActiveTool('line')
          break
        case 'f':
          setActiveTool('frame')
          break
        case 'i':
          if (imageInputRef.current) {
            imageInputRef.current.click()
          }
          break
        case 'delete':
        case 'backspace':
          selectedIds.forEach((id) => deleteElement(id))
          break
        case 'd':
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault()
            selectedIds.forEach((id) => duplicateElement(id))
          }
          break
        case 'escape':
          deselectAll()
          break
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [selectedIds, deselectAll])

  // Image tool: open file picker when image tool is selected
  useEffect(() => {
    if (activeTool === 'image' && imageInputRef.current) {
      imageInputRef.current.click()
    }
  }, [activeTool])

  // Handle image file selection
  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) {
      setActiveTool('select')
      return
    }

    if (!file.type.startsWith('image/')) {
      alert('Please select a valid image file (JPG, PNG, etc.)')
      setActiveTool('select')
      return
    }

    const reader = new FileReader()
    reader.onload = (event) => {
      const imageUrl = event.target?.result as string
      
      // Create image element with default size
      const elementCount = elements.filter((el) => el.type === 'image').length + 1
      const newElement: CanvasElement = {
        id: generateId(),
        type: 'image',
        x: 100,
        y: 100,
        width: 200,
        height: 200,
        rotation: 0,
        fill: '#ffffff',
        stroke: '#000000',
        strokeWidth: 1,
        opacity: 1,
        cornerRadius: 0,
        imageUrl,
        name: `Image ${elementCount}`,
        visible: true,
        locked: false,
      }
      
      addElement(newElement)
      selectElement(newElement.id)
      pushHistory()
      setActiveTool('select')
    }
    reader.readAsDataURL(file)
    
    // Reset input
    e.target.value = ''
  }

  // Text editing handlers
  const handleTextDoubleClick = (element: CanvasElement) => {
    if (element.type === 'text') {
      setEditingTextId(element.id)
      setEditingText(element.text || '')
      setTimeout(() => textInputRef.current?.focus(), 0)
    }
  }

  const handleSaveText = (elementId: string) => {
    const element = elements.find((el) => el.id === elementId)
    if (element && editingText !== element.text) {
      updateElement(elementId, { text: editingText })
      pushHistory()
    }
    setEditingTextId(null)
    setEditingText('')
  }

  const handleTextKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      if (editingTextId) {
        handleSaveText(editingTextId)
      }
    } else if (e.key === 'Escape') {
      setEditingTextId(null)
      setEditingText('')
    }
  }

  const renderElement = (element: CanvasElement) => {
    if (element.visible === false) return null
    
    const isSelected = selectedIds.includes(element.id)
    const hasIssue = showIssueHighlights && issues.some((issue) => issue.elementIds.includes(element.id))
    const issue = issues.find((i) => i.elementIds.includes(element.id))
    
    const baseStyle: React.CSSProperties = {
      position: 'absolute',
      left: element.x,
      top: element.y,
      width: element.width,
      height: element.height,
      transform: `rotate(${element.rotation}deg)`,
      opacity: element.opacity,
      cursor: element.locked ? 'not-allowed' : activeTool === 'select' ? 'move' : 'crosshair',
    }

    const renderShape = () => {
      switch (element.type) {
        case 'rectangle':
        case 'frame':
          return (
            <div
              style={{
                ...baseStyle,
                backgroundColor: element.fill,
                border: `${element.strokeWidth}px solid ${element.stroke}`,
                borderRadius: element.cornerRadius,
              }}
            />
          )
        case 'circle':
          return (
            <div
              style={{
                ...baseStyle,
                backgroundColor: element.fill,
                border: `${element.strokeWidth}px solid ${element.stroke}`,
                borderRadius: '50%',
              }}
            />
          )
        case 'text':
          const textAlignMap: { [key: string]: string } = {
            'left': 'flex-start',
            'center': 'center',
            'right': 'flex-end',
          }
          
          const isEditing = editingTextId === element.id
          
          return (
            <div
              style={{
                ...baseStyle,
                backgroundColor: isEditing ? 'rgba(59, 130, 246, 0.1)' : 'transparent',
                display: 'flex',
                alignItems: 'center',
                justifyContent: textAlignMap[element.textAlign || 'left'],
                fontSize: element.fontSize,
                fontFamily: element.fontFamily,
                fontWeight: element.fontWeight,
                color: element.fill,
                padding: '4px',
                overflow: 'hidden',
                whiteSpace: 'pre-wrap',
                wordWrap: 'break-word',
                border: isEditing ? '2px solid #3B82F6' : 'none',
                cursor: 'text',
                // Apply text stroke if strokeWidth > 0
                ...(element.textStrokeWidth && element.textStrokeWidth > 0 ? {
                  WebkitTextStroke: `${element.textStrokeWidth}px ${element.textStroke || '#000000'}`,
                } : {}),
              } as React.CSSProperties}
              onDoubleClick={() => handleTextDoubleClick(element)}
            >
              {isEditing ? (
                <input
                  ref={textInputRef}
                  type="text"
                  value={editingText}
                  onChange={(e) => setEditingText(e.target.value)}
                  onKeyDown={handleTextKeyDown}
                  onBlur={() => handleSaveText(element.id)}
                  onClick={(e) => e.stopPropagation()}
                  style={{
                    width: '100%',
                    height: '100%',
                    border: 'none',
                    background: 'transparent',
                    color: element.fill,
                    fontSize: element.fontSize,
                    fontFamily: element.fontFamily,
                    fontWeight: element.fontWeight,
                    textAlign: element.textAlign || 'left',
                    outline: 'none',
                    padding: '4px',
                  }}
                />
              ) : (
                element.text || ''
              )}
            </div>
          )
        case 'line':
          return (
            <svg
              style={{
                ...baseStyle,
                overflow: 'visible',
              }}
            >
              <line
                x1="0"
                y1={element.height / 2}
                x2={element.width}
                y2={element.height / 2}
                stroke={element.stroke}
                strokeWidth={element.strokeWidth}
              />
            </svg>
          )
        case 'image':
          return (
            <div
              style={{
                ...baseStyle,
                border: `${element.strokeWidth}px solid ${element.stroke}`,
                borderRadius: element.cornerRadius,
                overflow: 'hidden',
                backgroundColor: '#f5f5f5',
              }}
            >
              {element.imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={element.imageUrl}
                  alt={element.name || 'Image'}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    objectPosition: 'center',
                  }}
                />
              ) : (
                <div style={{
                  width: '100%',
                  height: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#999',
                  fontSize: '12px',
                }}>
                  No Image
                </div>
              )}
            </div>
          )
        default:
          return null
      }
    }

    return (
      <div key={element.id} className="absolute" style={{ left: 0, top: 0 }}>
        {renderShape()}
        
        {/* Issue indicator */}
        {hasIssue && issue && (
          <div
            className={cn(
              'absolute -top-6 left-0 px-2 py-1 rounded text-xs font-medium',
              issue.severity === 'error' && 'bg-destructive text-destructive-foreground',
              issue.severity === 'warning' && 'bg-warning text-background',
              issue.severity === 'info' && 'bg-info text-primary-foreground'
            )}
            style={{ left: element.x, top: element.y - 24 }}
          >
            {issue.type}
          </div>
        )}
        
        {/* Selection box */}
        {isSelected && (
          <div
            className="absolute border-2 border-primary pointer-events-none"
            style={{
              left: element.x - 2,
              top: element.y - 2,
              width: element.width + 4,
              height: element.height + 4,
            }}
          >
            {/* Resize handles */}
            {!element.locked && (
              <>
                {['nw', 'n', 'ne', 'w', 'e', 'sw', 's', 'se'].map((handle) => {
                  const positions: Record<string, { left: string; top: string; cursor: string }> = {
                    nw: { left: '-4px', top: '-4px', cursor: 'nwse-resize' },
                    n: { left: '50%', top: '-4px', cursor: 'ns-resize' },
                    ne: { left: 'calc(100% - 4px)', top: '-4px', cursor: 'nesw-resize' },
                    w: { left: '-4px', top: '50%', cursor: 'ew-resize' },
                    e: { left: 'calc(100% - 4px)', top: '50%', cursor: 'ew-resize' },
                    sw: { left: '-4px', top: 'calc(100% - 4px)', cursor: 'nesw-resize' },
                    s: { left: '50%', top: 'calc(100% - 4px)', cursor: 'ns-resize' },
                    se: { left: 'calc(100% - 4px)', top: 'calc(100% - 4px)', cursor: 'nwse-resize' },
                  }
                  const pos = positions[handle]
                  return (
                    <div
                      key={handle}
                      className="absolute w-2 h-2 bg-primary border border-primary-foreground rounded-sm pointer-events-auto"
                      style={{
                        left: pos.left,
                        top: pos.top,
                        transform: 'translate(-50%, -50%)',
                        cursor: pos.cursor,
                      }}
                      onMouseDown={(e) => startResize(e, handle)}
                    />
                  )
                })}
              </>
            )}
          </div>
        )}
      </div>
    )
  }

  return (
    <div
      ref={canvasRef}
      className={cn(
        'flex-1 relative overflow-hidden bg-canvas-bg',
        activeTool === 'hand' && 'cursor-grab',
        isPanning && 'cursor-grabbing'
      )}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      {/* Grid */}
      {showGrid && (
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: `
              linear-gradient(to right, var(--canvas-grid) 1px, transparent 1px),
              linear-gradient(to bottom, var(--canvas-grid) 1px, transparent 1px)
            `,
            backgroundSize: `${20 * zoom}px ${20 * zoom}px`,
            backgroundPosition: `${panOffset.x}px ${panOffset.y}px`,
          }}
        />
      )}

      {/* Canvas content */}
      <div
        className="absolute"
        style={{
          transform: `translate(${panOffset.x}px, ${panOffset.y}px) scale(${zoom})`,
          transformOrigin: '0 0',
        }}
      >
        {elements.map(renderElement)}
        
        {/* Drawing preview */}
        {isDrawing && (
          <div
            className="absolute border-2 border-dashed border-primary bg-primary/20 pointer-events-none"
            style={{
              left: Math.min(startPos.x, currentPos.x),
              top: Math.min(startPos.y, currentPos.y),
              width: Math.abs(currentPos.x - startPos.x),
              height: Math.abs(currentPos.y - startPos.y),
              borderRadius: activeTool === 'circle' ? '50%' : 0,
            }}
          />
        )}
      </div>

      {/* Zoom indicator */}
      <div className="absolute bottom-4 left-4 bg-panel-bg/90 backdrop-blur-sm rounded-lg px-3 py-1.5 text-xs text-muted-foreground">
        {Math.round(zoom * 100)}%
      </div>

      {/* Hidden image file input */}
      <input
        ref={imageInputRef}
        type="file"
        accept="image/png,image/jpeg,image/jpg,image/gif,image/webp,image/svg+xml"
        onChange={handleImageSelect}
        className="hidden"
      />
    </div>
  )
}
