'use client'

import { useCanvasStore } from '@/lib/canvas-store'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import { Separator } from '@/components/ui/separator'
import { Button } from '@/components/ui/button'
import { Trash2, Copy, Lock, Unlock, Eye, EyeOff, AlignLeft, AlignCenter, AlignRight } from 'lucide-react'

export function PropertiesPanel() {
  const {
    elements,
    selectedIds,
    activeColor,
    activeStroke,
    activeStrokeWidth,
    setActiveColor,
    setActiveStroke,
    setActiveStrokeWidth,
    updateElement,
    deleteElement,
    duplicateElement,
  } = useCanvasStore()

  const selectedElement = selectedIds.length === 1
    ? elements.find((el) => el.id === selectedIds[0])
    : null

  if (!selectedElement) {
    return (
      <div className="w-64 bg-panel-bg border-l border-border p-4 overflow-y-auto">
        <h3 className="text-sm font-semibold text-foreground mb-4">Properties</h3>
        <p className="text-xs text-muted-foreground">
          Select an element to view and edit its properties
        </p>
        
        <Separator className="my-4" />
        
        <h4 className="text-xs font-medium text-muted-foreground mb-3">Default Colors</h4>
        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label className="text-xs">Fill Color</Label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={activeColor}
                onChange={(e) => setActiveColor(e.target.value)}
                className="w-8 h-8 rounded border border-border cursor-pointer"
              />
              <Input
                value={activeColor}
                onChange={(e) => setActiveColor(e.target.value)}
                className="flex-1 h-8 text-xs"
              />
            </div>
          </div>
          
          <div className="space-y-1.5">
            <Label className="text-xs">Stroke Color</Label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={activeStroke}
                onChange={(e) => setActiveStroke(e.target.value)}
                className="w-8 h-8 rounded border border-border cursor-pointer"
              />
              <Input
                value={activeStroke}
                onChange={(e) => setActiveStroke(e.target.value)}
                className="flex-1 h-8 text-xs"
              />
            </div>
          </div>
          
          <div className="space-y-1.5">
            <Label className="text-xs">Stroke Width</Label>
            <Slider
              value={[activeStrokeWidth]}
              onValueChange={([value]) => setActiveStrokeWidth(value)}
              min={0}
              max={20}
              step={1}
              className="w-full"
            />
            <span className="text-xs text-muted-foreground">{activeStrokeWidth}px</span>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="w-64 bg-panel-bg border-l border-border p-4 overflow-y-auto">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-foreground">{selectedElement.name}</h3>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            className="h-7 w-7 p-0"
            onClick={() => updateElement(selectedElement.id, { visible: !selectedElement.visible })}
          >
            {selectedElement.visible !== false ? (
              <Eye className="h-3.5 w-3.5" />
            ) : (
              <EyeOff className="h-3.5 w-3.5" />
            )}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-7 w-7 p-0"
            onClick={() => updateElement(selectedElement.id, { locked: !selectedElement.locked })}
          >
            {selectedElement.locked ? (
              <Lock className="h-3.5 w-3.5" />
            ) : (
              <Unlock className="h-3.5 w-3.5" />
            )}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-7 w-7 p-0"
            onClick={() => duplicateElement(selectedElement.id)}
          >
            <Copy className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-7 w-7 p-0 text-destructive hover:text-destructive"
            onClick={() => deleteElement(selectedElement.id)}
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      <Separator className="mb-4" />

      {/* Position & Size */}
      <div className="space-y-3 mb-4">
        <h4 className="text-xs font-medium text-muted-foreground">Position & Size</h4>
        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-1">
            <Label className="text-xs">X</Label>
            <Input
              type="number"
              value={Math.round(selectedElement.x)}
              onChange={(e) => updateElement(selectedElement.id, { x: Number(e.target.value) })}
              className="h-8 text-xs"
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Y</Label>
            <Input
              type="number"
              value={Math.round(selectedElement.y)}
              onChange={(e) => updateElement(selectedElement.id, { y: Number(e.target.value) })}
              className="h-8 text-xs"
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Width</Label>
            <Input
              type="number"
              value={Math.round(selectedElement.width)}
              onChange={(e) => updateElement(selectedElement.id, { width: Number(e.target.value) })}
              className="h-8 text-xs"
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Height</Label>
            <Input
              type="number"
              value={Math.round(selectedElement.height)}
              onChange={(e) => updateElement(selectedElement.id, { height: Number(e.target.value) })}
              className="h-8 text-xs"
            />
          </div>
        </div>
        <div className="space-y-1">
          <Label className="text-xs">Rotation</Label>
          <div className="flex items-center gap-2">
            <Slider
              value={[selectedElement.rotation]}
              onValueChange={([value]) => updateElement(selectedElement.id, { rotation: value })}
              min={0}
              max={360}
              step={1}
              className="flex-1"
            />
            <span className="text-xs text-muted-foreground w-10">{selectedElement.rotation}°</span>
          </div>
        </div>
      </div>

      <Separator className="mb-4" />

      {/* Appearance */}
      <div className="space-y-3 mb-4">
        <h4 className="text-xs font-medium text-muted-foreground">Appearance</h4>
        
        <div className="space-y-1.5">
          <Label className="text-xs">Fill Color</Label>
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={selectedElement.fill}
              onChange={(e) => updateElement(selectedElement.id, { fill: e.target.value })}
              className="w-8 h-8 rounded border border-border cursor-pointer"
            />
            <Input
              value={selectedElement.fill}
              onChange={(e) => updateElement(selectedElement.id, { fill: e.target.value })}
              className="flex-1 h-8 text-xs"
            />
          </div>
        </div>
        
        <div className="space-y-1.5">
          <Label className="text-xs">Stroke Color</Label>
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={selectedElement.stroke}
              onChange={(e) => updateElement(selectedElement.id, { stroke: e.target.value })}
              className="w-8 h-8 rounded border border-border cursor-pointer"
            />
            <Input
              value={selectedElement.stroke}
              onChange={(e) => updateElement(selectedElement.id, { stroke: e.target.value })}
              className="flex-1 h-8 text-xs"
            />
          </div>
        </div>
        
        <div className="space-y-1.5">
          <Label className="text-xs">Stroke Width</Label>
          <div className="flex items-center gap-2">
            <Slider
              value={[selectedElement.strokeWidth]}
              onValueChange={([value]) => updateElement(selectedElement.id, { strokeWidth: value })}
              min={0}
              max={20}
              step={1}
              className="flex-1"
            />
            <span className="text-xs text-muted-foreground w-10">{selectedElement.strokeWidth}px</span>
          </div>
        </div>
        
        <div className="space-y-1.5">
          <Label className="text-xs">Opacity</Label>
          <div className="flex items-center gap-2">
            <Slider
              value={[selectedElement.opacity * 100]}
              onValueChange={([value]) => updateElement(selectedElement.id, { opacity: value / 100 })}
              min={0}
              max={100}
              step={1}
              className="flex-1"
            />
            <span className="text-xs text-muted-foreground w-10">{Math.round(selectedElement.opacity * 100)}%</span>
          </div>
        </div>

        {selectedElement.type === 'rectangle' && (
          <div className="space-y-1.5">
            <Label className="text-xs">Corner Radius</Label>
            <div className="flex items-center gap-2">
              <Slider
                value={[selectedElement.cornerRadius || 0]}
                onValueChange={([value]) => updateElement(selectedElement.id, { cornerRadius: value })}
                min={0}
                max={100}
                step={1}
                className="flex-1"
              />
              <span className="text-xs text-muted-foreground w-10">{selectedElement.cornerRadius || 0}px</span>
            </div>
          </div>
        )}
      </div>

      {/* Text Properties */}
      {selectedElement.type === 'text' && (
        <>
          <Separator className="mb-4" />
          <div className="space-y-3">
            <h4 className="text-xs font-medium text-muted-foreground">Text</h4>
            
            {/* Content */}
            <div className="space-y-1.5">
              <Label className="text-xs">Content</Label>
              <Input
                value={selectedElement.text || ''}
                onChange={(e) => updateElement(selectedElement.id, { text: e.target.value })}
                className="h-8 text-xs"
              />
            </div>

            {/* Font Family */}
            <div className="space-y-1.5">
              <Label className="text-xs">Font</Label>
              <select
                value={selectedElement.fontFamily || 'Arial'}
                onChange={(e) => updateElement(selectedElement.id, { fontFamily: e.target.value })}
                className="w-full h-8 text-xs px-2 rounded border border-border bg-background text-foreground"
              >
                <option value="Arial">Arial</option>
                <option value="Helvetica">Helvetica</option>
                <option value="Times New Roman">Times New Roman</option>
                <option value="Courier New">Courier New</option>
                <option value="Georgia">Georgia</option>
                <option value="Verdana">Verdana</option>
                <option value="Comic Sans MS">Comic Sans MS</option>
                <option value="Trebuchet MS">Trebuchet MS</option>
                <option value="Impact">Impact</option>
                <option value="Palatino">Palatino</option>
              </select>
            </div>

            {/* Font Size */}
            <div className="space-y-1.5">
              <Label className="text-xs">Font Size</Label>
              <div className="flex items-center gap-2">
                <Slider
                  value={[selectedElement.fontSize || 16]}
                  onValueChange={([value]) => updateElement(selectedElement.id, { fontSize: value })}
                  min={8}
                  max={120}
                  step={1}
                  className="flex-1"
                />
                <span className="text-xs text-muted-foreground w-10">{selectedElement.fontSize || 16}px</span>
              </div>
            </div>

            {/* Text Alignment */}
            <div className="space-y-1.5">
              <Label className="text-xs">Alignment</Label>
              <div className="flex items-center gap-1">
                <Button
                  variant={selectedElement.textAlign === 'left' ? 'default' : 'outline'}
                  size="sm"
                  className="flex-1 h-8"
                  onClick={() => updateElement(selectedElement.id, { textAlign: 'left' })}
                  title="Align left"
                >
                  <AlignLeft className="h-3 w-3" />
                </Button>
                <Button
                  variant={selectedElement.textAlign === 'center' ? 'default' : 'outline'}
                  size="sm"
                  className="flex-1 h-8"
                  onClick={() => updateElement(selectedElement.id, { textAlign: 'center' })}
                  title="Align center"
                >
                  <AlignCenter className="h-3 w-3" />
                </Button>
                <Button
                  variant={selectedElement.textAlign === 'right' ? 'default' : 'outline'}
                  size="sm"
                  className="flex-1 h-8"
                  onClick={() => updateElement(selectedElement.id, { textAlign: 'right' })}
                  title="Align right"
                >
                  <AlignRight className="h-3 w-3" />
                </Button>
              </div>
            </div>

            {/* Text Stroke */}
            <div className="space-y-1.5">
              <Label className="text-xs">Text Stroke Color</Label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={selectedElement.textStroke || '#000000'}
                  onChange={(e) => updateElement(selectedElement.id, { textStroke: e.target.value })}
                  className="w-8 h-8 rounded border border-border cursor-pointer"
                />
                <Input
                  value={selectedElement.textStroke || '#000000'}
                  onChange={(e) => updateElement(selectedElement.id, { textStroke: e.target.value })}
                  className="flex-1 h-8 text-xs"
                />
              </div>
            </div>

            {/* Text Stroke Width */}
            <div className="space-y-1.5">
              <Label className="text-xs">Text Stroke Width</Label>
              <div className="flex items-center gap-2">
                <Slider
                  value={[selectedElement.textStrokeWidth || 0]}
                  onValueChange={([value]) => updateElement(selectedElement.id, { textStrokeWidth: value })}
                  min={0}
                  max={10}
                  step={0.5}
                  className="flex-1"
                />
                <span className="text-xs text-muted-foreground w-10">{selectedElement.textStrokeWidth || 0}</span>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
