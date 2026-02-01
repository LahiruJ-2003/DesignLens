'use client'

import React from "react"

import { useCanvasStore } from '@/lib/canvas-store'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
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
} from 'lucide-react'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import { useState } from 'react'

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
  const {
    elements,
    layers,
    selectedIds,
    selectElement,
    toggleLayerVisibility,
    toggleLayerLock,
  } = useCanvasStore()

  return (
    <div className="w-56 bg-panel-bg border-r border-border flex flex-col">
      <Collapsible open={isOpen} onOpenChange={setIsOpen} className="flex-1 flex flex-col">
        <CollapsibleTrigger className="flex items-center justify-between p-3 hover:bg-muted/50 transition-colors">
          <div className="flex items-center gap-2">
            <Layers className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium text-foreground">Layers</span>
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
                layers.map((layer) => {
                  const element = elements.find((el) => el.id === layer.elementId)
                  if (!element) return null
                  
                  const isSelected = selectedIds.includes(element.id)
                  
                  return (
                    <div
                      key={layer.id}
                      className={cn(
                        'flex items-center gap-2 px-2 py-1.5 rounded-md cursor-pointer group',
                        isSelected ? 'bg-primary/20' : 'hover:bg-muted/50'
                      )}
                      onClick={() => selectElement(element.id)}
                    >
                      <span className="text-muted-foreground">
                        {iconMap[element.type] || <Square className="h-3.5 w-3.5" />}
                      </span>
                      
                      <span className={cn(
                        'flex-1 text-xs truncate',
                        isSelected ? 'text-primary' : 'text-foreground'
                      )}>
                        {layer.name}
                      </span>
                      
                      <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0"
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
                          className="h-6 w-6 p-0"
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
