'use client'

import React from "react"

import { useRef, useState, useEffect, useCallback } from 'react'
import { useCanvasStore } from '@/lib/canvas-store'
import type { CanvasElement } from '@/lib/types'
import { cn } from '@/lib/utils'

const generateId = () => Math.random().toString(36).substring(2, 15)
const RESIZE_HANDLES = ['n', 's', 'e', 'w', 'ne', 'nw', 'se', 'sw'] as const

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
  const [altPressed, setAltPressed] = useState(false)
  const [hoveredId, setHoveredId] = useState<string | null>(null)
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
    updateElements,
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

  const getElementAbsolutePos = useCallback((el: CanvasElement, elementMap?: Map<string, CanvasElement>) => {
    let x = el.x
    let y = el.y
    let currentParentId = el.parentId
    
    while (currentParentId) {
      const parent = elementMap 
        ? elementMap.get(currentParentId)
        : elements.find(p => p.id === currentParentId)
        
      if (parent) {
        x += parent.x
        y += parent.y
        currentParentId = parent.parentId
      } else {
        break
      }
    }
    return { x, y }
  }, [elements])

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
        const abs = getElementAbsolutePos(el)
        return visible &&
          coords.x >= abs.x &&
          coords.x <= abs.x + el.width &&
          coords.y >= abs.y &&
          coords.y <= abs.y + el.height
      })

      if (clickedElement) {
        if (!selectedIds.includes(clickedElement.id)) {
          selectElement(clickedElement.id, e.shiftKey)
        }
        setIsDragging(true)
        const abs = getElementAbsolutePos(clickedElement)
        setDragOffset({
          x: coords.x - abs.x,
          y: coords.y - abs.y,
        })
      } else {
        deselectAll()
      }
      return
    }

    // Drawing tools
    if (['rectangle', 'circle', 'frame', 'line', 'text', 'triangle', 'star', 'arrow'].includes(activeTool)) {
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

    const elementMap = new Map(elements.map(el => [el.id, el]))

    // Hover detection for Distance Guides
    const hovered = [...elements].reverse().find((el) => {
      const visible = el.visible !== false
      const abs = getElementAbsolutePos(el, elementMap)
      return visible &&
        coords.x >= abs.x &&
        coords.x <= abs.x + el.width &&
        coords.y >= abs.y &&
        coords.y <= abs.y + el.height
    })
    setHoveredId(hovered?.id || null)

    if (isDragging && selectedIds.length > 0) {
      const primaryElement = elementMap.get(selectedIds[0])
      if (primaryElement && !primaryElement.locked) {
        const absPos = getElementAbsolutePos(primaryElement, elementMap)
        const dx = coords.x - dragOffset.x - absPos.x
        const dy = coords.y - dragOffset.y - absPos.y
        
        // If multiple elements are selected, move them all
        // Only move elements that are not children of another selected element
        const selectedRoots = selectedIds.filter(id => {
          const el = elements.find(e => e.id === id)
          if (!el || !el.parentId) return true
          return !selectedIds.includes(el.parentId)
        })

        const updates: Record<string, Partial<CanvasElement>> = {}
        selectedRoots.forEach((id) => {
          const el = elementMap.get(id)
          if (el && !el.locked) {
            updates[id] = {
              x: el.x + dx,
              y: el.y + dy,
            }
          }
        })

        if (Object.keys(updates).length > 0) {
          updateElements(updates)
        }
      }
      return
    }

    if (isResizing && selectedIds.length === 1 && resizeHandle) {
      const element = elementMap.get(selectedIds[0])
      if (element) {
        const abs = getElementAbsolutePos(element, elementMap)
        const updates: Partial<CanvasElement> = {}
        // Use pre-indexed element Map for O(1) parent lookups
        
        if (resizeHandle.includes('e')) {
          updates.width = Math.max(10, coords.x - abs.x)
        }
        if (resizeHandle.includes('w')) {
          const newWidth = Math.max(10, abs.x + element.width - coords.x)
          updates.x = element.x + element.width - newWidth
          updates.width = newWidth
        }
        if (resizeHandle.includes('s')) {
          updates.height = Math.max(10, coords.y - abs.y)
        }
        if (resizeHandle.includes('n')) {
          const newHeight = Math.max(10, abs.y + element.height - coords.y)
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
      
      // Interactive Reparenting on drop
      if (selectedIds.length > 0) {
        const elementMap = new Map(elements.map(el => [el.id, el]))
        const lastSelectedId = selectedIds[selectedIds.length - 1]
        const element = elementMap.get(lastSelectedId)
        
        if (element && !element.locked) {
          // 1. Calculate absolute center of the element to determine its new container
          const absPos = getElementAbsolutePos(element, elementMap)
          const centerX = absPos.x + element.width / 2
          const centerY = absPos.y + element.height / 2
          
          // 2. Find the deepest/top-most frame that contains this center
          const potentialParents = elements.filter(el => 
            el.type === 'frame' && 
            el.id !== element.id &&
            !selectedIds.includes(el.id) && // Don't nest into another currently dragged frame
            el.visible
          )
          
          let bestParent: CanvasElement | null = null
          potentialParents.forEach(frame => {
            const frameAbs = getElementAbsolutePos(frame, elementMap)
            if (centerX >= frameAbs.x && centerX <= frameAbs.x + frame.width &&
                centerY >= frameAbs.y && centerY <= frameAbs.y + frame.height) {
              // Z-index/Depth check: Frames appearing later in the elements array are "on top"
              bestParent = frame
            }
          })
          
          const newParentId = bestParent ? (bestParent as CanvasElement).id : undefined
          
          // 3. If parent changed, update all selected root elements
          if (newParentId !== element.parentId) {
            const updates: Record<string, Partial<CanvasElement>> = {}
            
            selectedIds.forEach(id => {
              const el = elementMap.get(id)
              if (el) {
                // Determine if this element is a "root" of the selection (not a child of another selected element)
                const isRoot = !el.parentId || !selectedIds.includes(el.parentId)
                if (isRoot) {
                  const elAbs = getElementAbsolutePos(el, elementMap)
                  let newX, newY
                  
                  if (bestParent) {
                    const destParentAbs = getElementAbsolutePos(bestParent, elementMap)
                    newX = elAbs.x - destParentAbs.x
                    newY = elAbs.y - destParentAbs.y
                  } else {
                    newX = elAbs.x
                    newY = elAbs.y
                  }
                  
                  updates[id] = { 
                    parentId: newParentId, 
                    x: newX, 
                    y: newY 
                  }
                }
              }
            })
            
            if (Object.keys(updates).length > 0) {
              updateElements(updates)
            }
          }
        }
      }
      
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
          strokeWidth: (activeTool === 'line' || activeTool === 'arrow') && activeStrokeWidth === 0
            ? 2
            : activeStrokeWidth,
          opacity: 1,
          cornerRadius: 0,
          name: `${activeTool.charAt(0).toUpperCase() + activeTool.slice(1)} ${elementCount}`,
          text: activeTool === 'text' ? 'Type something...' : undefined,
          fontSize: activeTool === 'text' ? 16 : undefined,
          fontFamily: activeTool === 'text' ? 'Inter' : undefined,
          visible: true,
          locked: false,
          clipContent: activeTool === 'frame' ? true : undefined,
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
        case 'a':
          setActiveTool('arrow')
          break
        case 'w':
          setActiveTool('triangle')
          break
        case 's':
          setActiveTool('star')
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
    window.addEventListener('keyup', (e) => {
      if (e.key === 'Alt') setAltPressed(false)
    })
    
    // Specifically handle Alt key down as well
    const handleAltDown = (e: KeyboardEvent) => {
      if (e.key === 'Alt') {
        setAltPressed(true)
      }
    }
    window.addEventListener('keydown', handleAltDown)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keydown', handleAltDown)
      window.removeEventListener('keyup', (e) => { if (e.key === 'Alt') setAltPressed(false) })
    }
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
    const hasIssue = showIssueHighlights && issues.some((issue) => issue.elementIds?.includes(element.id))
    const issue = issues.find((i) => i.elementIds?.includes(element.id))
    
    const baseStyle: React.CSSProperties = {
      position: 'absolute',
      left: element.x,
      top: element.y,
      width: element.width,
      height: element.height,
      transform: `rotate(${element.rotation}deg)`,
      opacity: element.opacity,
      pointerEvents: isPanning ? 'none' : 'auto',
      zIndex: 1, // Respect character order + recursive nesting
      mixBlendMode: element.blendMode || 'normal',
      ...(element.blurEnabled && element.blurType === 'layer' ? {
        filter: `blur(${element.blurAmount || 0}px)`
      } : {}),
      ...(element.blurEnabled && element.blurType === 'background' ? {
        backdropFilter: `blur(${element.blurAmount || 0}px)`,
        WebkitBackdropFilter: `blur(${element.blurAmount || 0}px)`,
      } : {}),
      ...(element.shadowEnabled ? {
        filter: (element.blurEnabled && element.blurType === 'layer') 
          ? `blur(${element.blurAmount || 0}px) drop-shadow(${element.shadowX || 0}px ${element.shadowY || 0}px ${element.shadowBlur || 0}px ${element.shadowColor || 'rgba(0,0,0,0.5)'})`
          : `drop-shadow(${element.shadowX || 0}px ${element.shadowY || 0}px ${element.shadowBlur || 0}px ${element.shadowColor || 'rgba(0,0,0,0.5)'})`
      } : {}),
      cursor: element.locked ? 'not-allowed' : activeTool === 'select' ? 'move' : 'crosshair',
      borderRadius: (element.type === 'frame' || element.type === 'rectangle' || element.type === 'image') ? element.cornerRadius : undefined,
      overflow: (element.type === 'frame' && element.clipContent !== false) || (element.blurEnabled && element.blurType === 'background') ? 'hidden' : 'visible',
    }

    const renderGradient = (el: CanvasElement, isStroke: boolean = false) => {
      const config = isStroke ? el.strokeGradient : el.gradient
      const fillType = isStroke ? el.strokeType : el.fillType
      
      if (fillType !== 'gradient' || !config) return null
      
      const { type, stops, angle } = config
      const gradId = isStroke ? `stroke-grad-${el.id}` : `grad-${el.id}`
      
      if (type === 'linear') {
        const x1 = 50 + 50 * Math.cos((angle - 90) * Math.PI / 180)
        const y1 = 50 + 50 * Math.sin((angle - 90) * Math.PI / 180)
        const x2 = 50 + 50 * Math.cos((angle + 90) * Math.PI / 180)
        const y2 = 50 + 50 * Math.sin((angle + 90) * Math.PI / 180)
        return (
          <linearGradient id={gradId} x1={`${x1}%`} y1={`${y1}%`} x2={`${x2}%`} y2={`${y2}%`}>
            {stops.map((stop, i) => (
              <stop 
                key={i} 
                offset={`${stop.offset}%`} 
                stopColor={stop.color} 
                stopOpacity={stop.opacity !== undefined ? stop.opacity : 1} 
              />
            ))}
          </linearGradient>
        )
      } else {
        return (
          <radialGradient id={gradId} cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
            {stops.map((stop, i) => (
              <stop 
                key={i} 
                offset={`${stop.offset}%`} 
                stopColor={stop.color} 
                stopOpacity={stop.opacity !== undefined ? stop.opacity : 1} 
              />
            ))}
          </radialGradient>
        )
      }
    }

    const fillValue = element.fillType === 'gradient' && element.gradient ? `url(#grad-${element.id})` : element.fill
    const strokeValue = element.strokeType === 'gradient' && element.strokeGradient ? `url(#stroke-grad-${element.id})` : element.stroke

    const renderShapeContent = () => {
      switch (element.type) {
        case 'rectangle':
        case 'frame':
          // Stroke Positioning Simulation
          let strokeOffset = 0
          if (element.strokePosition === 'inside') {
            strokeOffset = element.strokeWidth / 2
          } else if (element.strokePosition === 'outside') {
            strokeOffset = -element.strokeWidth / 2
          }
          
          const rectX = strokeOffset
          const rectY = strokeOffset
          const rectW = Math.max(0, element.width - strokeOffset * 2)
          const rectH = Math.max(0, element.height - strokeOffset * 2)

          // Corner Smoothing (Simplistic Squircle Approximation)
          // A true squircle requires a complex Path, but we can approximate by scaling 
          // the corner radius based on smoothing.
          const rawRadius = element.cornerRadius || 0
          const smoothing = element.cornerSmoothing || 0
          // When smoothing is high, we effectively need a larger radius to cover the "flat" part
          const effectiveRadius = rawRadius * (1 + smoothing * 0.5)

          return (
            <svg style={{ width: '100%', height: '100%', overflow: 'visible' }}>
              <defs>
                {element.fillType === 'gradient' && renderGradient(element, false)}
                {element.strokeType === 'gradient' && renderGradient(element, true)}
                {element.shadowEnabled && (
                  <filter id={`shadow-${element.id}`} x="-50%" y="-50%" width="200%" height="200%">
                    <feDropShadow 
                      dx={element.shadowX || 0} 
                      dy={element.shadowY || 0} 
                      stdDeviation={element.shadowBlur || 4} 
                      floodColor={element.shadowColor || 'rgba(0,0,0,0.5)'} 
                    />
                  </filter>
                )}
              </defs>
              <rect
                x={rectX}
                y={rectY}
                width={rectW}
                height={rectH}
                rx={effectiveRadius}
                ry={effectiveRadius}
                fill={fillValue}
                stroke={element.strokeWidth > 0 ? strokeValue : 'none'}
                strokeWidth={element.strokeWidth}
                opacity={element.opacity}
                filter={element.shadowEnabled ? `url(#shadow-${element.id})` : undefined}
                style={{ 
                  transition: 'all 0.1s ease',
                }}
              />
            </svg>
          )
        case 'circle':
          return (
            <svg style={{ width: '100%', height: '100%', overflow: 'visible' }}>
              {element.fillType === 'gradient' && <defs>{renderGradient(element)}</defs>}
              <ellipse
                cx={element.width / 2}
                cy={element.height / 2}
                rx={element.width / 2}
                ry={element.height / 2}
                fill={fillValue}
                stroke={element.stroke}
                strokeWidth={element.strokeWidth}
              />
            </svg>
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
                width: '100%',
                height: '100%',
                backgroundColor: isEditing ? 'rgba(59, 130, 246, 0.1)' : 'transparent',
                display: 'flex',
                alignItems: 'flex-start', // Changed from 'center'
                justifyContent: element.textAlign === 'center' ? 'center' : element.textAlign === 'right' ? 'flex-end' : 'flex-start', // Changed from textAlignMap
                fontSize: element.fontSize,
                fontFamily: element.fontFamily,
                fontWeight: element.fontWeight,
                letterSpacing: element.letterSpacing ? `${element.letterSpacing}px` : 'normal',
                lineHeight: element.lineHeight || 1.2,
                textDecoration: element.textDecoration || 'none',
                textTransform: element.textTransform || 'none',
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
                  }}
                  className="w-full h-full bg-transparent border-none outline-none resize-none p-0 m-0 text-inherit font-inherit leading-inherit"
                  autoFocus
                />
              ) : (
                element.text || ''
              )}
            </div>
          )
        case 'image':
          return element.imageUrl ? (
            <div className="w-full h-full overflow-hidden" style={{ borderRadius: element.cornerRadius || 0 }}>
              <img
                src={element.imageUrl}
                alt={element.name}
                className="w-full h-full object-cover pointer-events-none select-none"
                style={{
                  opacity: element.opacity,
                  filter: element.blurEnabled ? `blur(${element.blurAmount || 0}px)` : 'none'
                }}
              />
            </div>
          ) : (
            <div className="w-full h-full bg-muted flex items-center justify-center text-muted-foreground">
              No Image
            </div>
          )
        case 'triangle':
          return (
            <svg style={{ width: '100%', height: '100%', overflow: 'visible' }}>
              {element.fillType === 'gradient' && <defs>{renderGradient(element)}</defs>}
              <polygon
                points={`0,${element.height} ${element.width / 2},0 ${element.width},${element.height}`}
                fill={fillValue}
                stroke={element.strokeWidth > 0 ? element.stroke : 'none'}
                strokeWidth={element.strokeWidth}
                opacity={element.opacity}
              />
            </svg>
          )
        case 'line':
          return (
            <svg style={{ width: '100%', height: '100%', overflow: 'visible' }}>
              <line
                x1={0}
                y1={0}
                x2={element.width}
                y2={element.height}
                stroke={element.stroke}
                strokeWidth={element.strokeWidth || 2}
                opacity={element.opacity}
              />
            </svg>
          )
        case 'arrow':
          const angle = Math.atan2(element.height, element.width)
          const headlen = 10
          return (
            <svg style={{ width: '100%', height: '100%', overflow: 'visible' }}>
              <line
                x1={0}
                y1={0}
                x2={element.width}
                y2={element.height}
                stroke={element.stroke}
                strokeWidth={element.strokeWidth || 2}
                opacity={element.opacity}
              />
              <path
                d={`M ${element.width} ${element.height} 
                   L ${element.width - headlen * Math.cos(angle - Math.PI / 6)} ${element.height - headlen * Math.sin(angle - Math.PI / 6)}
                   M ${element.width} ${element.height}
                   L ${element.width - headlen * Math.cos(angle + Math.PI / 6)} ${element.height - headlen * Math.sin(angle + Math.PI / 6)}`}
                stroke={element.stroke}
                strokeWidth={element.strokeWidth || 2}
                fill="none"
                opacity={element.opacity}
              />
            </svg>
          )
        case 'star':
          const points = []
          for (let i = 0; i < 10; i++) {
            const r = i % 2 === 0 ? element.width / 2 : element.width / 4
            const a = (Math.PI * 2 * i) / 10 - Math.PI / 2
            points.push(`${element.width / 2 + r * Math.cos(a)},${element.height / 2 + r * Math.sin(a)}`)
          }
          return (
            <svg style={{ width: '100%', height: '100%', overflow: 'visible' }}>
              {element.fillType === 'gradient' && <defs>{renderGradient(element)}</defs>}
              <polygon
                points={points.join(' ')}
                fill={fillValue}
                stroke={element.strokeWidth > 0 ? element.stroke : 'none'}
                strokeWidth={element.strokeWidth}
                opacity={element.opacity}
              />
            </svg>
          )
        default:
          return null
      }
    }

    return (
      <div
        key={element.id}
        id={element.id}
        style={baseStyle}
        onClick={(e) => {
          e.stopPropagation()
          if (!element.locked) {
            selectElement(element.id, e.shiftKey || e.metaKey || e.ctrlKey)
          }
        }}
        onDoubleClick={(e) => {
          e.stopPropagation()
          handleTextDoubleClick(element)
        }}
        className={cn(
          'transition-shadow duration-200',
          isSelected && 'ring-2 ring-primary ring-offset-2 ring-offset-canvas-bg z-20',
          hasIssue && 'ring-2 ring-destructive ring-offset-2 ring-offset-canvas-bg shadow-[0_0_15px_rgba(239,68,68,0.5)]',
          element.type === 'frame' && element.clipContent !== false && 'overflow-hidden'
        )}
      >
        {renderShapeContent()}
        
        {/* Render children for frames - they inherit their relative positions */}
        {(() => {
          const children = elements
            .filter(el => el.parentId === element.id)
            .sort((a, b) => elements.indexOf(a) - elements.indexOf(b))
          
          return element.type === 'frame' && children.length > 0 && (
            <div className="absolute inset-0 pointer-events-none" style={{ overflow: element.clipContent ? 'hidden' : 'visible' }}>
              {children.map(renderElement)}
            </div>
          )
        })()}

        {isSelected && !isResizing && (
          <div className="absolute inset-0 border-2 border-primary pointer-events-none" />
        )}
        
        {hasIssue && !isSelected && (
          <div className="absolute -top-6 left-0 bg-destructive text-destructive-foreground text-[10px] px-1.5 py-0.5 rounded shadow-lg whitespace-nowrap z-30 flex items-center gap-1 animate-in fade-in slide-in-from-bottom-1">
            <div className="w-2 h-2 rounded-full bg-white animate-pulse" />
            {issue?.message || 'Design Issue'}
          </div>
        )}

        {/* Constraint Indicators (only when selected) */}
        {isSelected && <ConstraintIndicators element={element} />}

        {/* Resize handles (only when a single element is selected) */}
        {isSelected && selectedIds.length === 1 && !element.locked && (
          <div className="absolute -inset-1 pointer-events-none z-30">
            {!isResizing && (
              <>
                {RESIZE_HANDLES.map((handle) => {
                  const positions: Record<string, { left: string; top: string; cursor: string }> = {
                    'n': { left: '50%', top: '0%', cursor: 'ns-resize' },
                    's': { left: '50%', top: '100%', cursor: 'ns-resize' },
                    'e': { left: '100%', top: '50%', cursor: 'ew-resize' },
                    'w': { left: '0%', top: '50%', cursor: 'ew-resize' },
                    'ne': { left: '100%', top: '0%', cursor: 'nesw-resize' },
                    'nw': { left: '0%', top: '0%', cursor: 'nwse-resize' },
                    'se': { left: '100%', top: '100%', cursor: 'nwse-resize' },
                    'sw': { left: '0%', top: '100%', cursor: 'nesw-resize' },
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
        {/* Render only top-level elements, children will be rendered recursively */}
        {elements.filter(el => !el.parentId).map(renderElement)}
        
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

function ConstraintIndicators({ element }: { element: CanvasElement }) {
  if (!element.constraints) return null
  const { horizontal, vertical } = element.constraints
  
  return (
    <div style={{
      position: 'absolute',
      inset: 0,
      pointerEvents: 'none',
      overflow: 'visible'
    }}>
      {/* Horizontal constraints indicators */}
      {(horizontal === 'left' || horizontal === 'left-right') && (
        <div className="absolute -left-4 top-1/2 -translate-y-1/2 w-4 h-[1px] bg-blue-500/50" style={{ borderTop: '1px dashed #3B82F6' }} />
      )}
      {(horizontal === 'right' || horizontal === 'left-right') && (
        <div className="absolute -right-4 top-1/2 -translate-y-1/2 w-4 h-[1px] bg-blue-500/50" style={{ borderTop: '1px dashed #3B82F6' }} />
      )}
      {/* Vertical constraints indicators */}
      {(vertical === 'top' || vertical === 'top-bottom') && (
        <div className="absolute left-1/2 -translate-x-1/2 -top-4 w-[1px] h-4 bg-blue-500/50" style={{ borderLeft: '1px dashed #3B82F6' }} />
      )}
      {(vertical === 'bottom' || vertical === 'top-bottom') && (
        <div className="absolute left-1/2 -translate-x-1/2 -bottom-4 w-[1px] h-4 bg-blue-500/50" style={{ borderLeft: '1px dashed #3B82F6' }} />
      )}
    </div>
  )
}

function DistanceOverlay({ from, to }: { from: CanvasElement, to: CanvasElement }) {
  // Simple calculation for top/bottom/left/right distances
  const distances = {
    top: Math.abs(from.y - to.y),
    bottom: Math.abs((from.y + from.height) - (to.y + to.height)),
    left: Math.abs(from.x - to.x),
    right: Math.abs((from.x + from.width) - (to.x + to.width))
  }

  // Find the closest edges and show distances
  const showHorizontal = from.y < to.y + to.height && from.y + from.height > to.y
  const showVertical = from.x < to.x + to.width && from.x + from.width > to.x
  
  return (
    <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', overflow: 'visible' }}>
      {/* Visual lines and labels would go here */}
      {/* For MVP, let's just show a few red lines between centers/edges */}
      <line 
        x1={from.x + from.width / 2} y1={from.y + from.height / 2} 
        x2={to.x + to.width / 2} y2={to.y + to.height / 2} 
        stroke="#FF4444" strokeWidth="1" strokeDasharray="4 2" 
      />
      <text 
        x={(from.x + to.x) / 2 + 10} y={(from.y + to.y) / 2} 
        fill="#FF4444" fontSize="10" fontWeight="bold"
      >
        {Math.round(Math.sqrt(Math.pow(from.x - to.x, 2) + Math.pow(from.y - to.y, 2)))}px
      </text>
    </svg>
  )
}
