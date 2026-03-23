'use client'

import { useCanvasStore } from '@/lib/canvas-store'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import { Separator } from '@/components/ui/separator'
import { Button } from '@/components/ui/button'
import { 
  Trash2, Copy, Lock, Unlock, Eye, EyeOff, 
  AlignLeft, AlignCenter, AlignRight,
  AlignStartVertical as AlignTop, 
  AlignCenterVertical as AlignMiddle, 
  AlignEndVertical as AlignBottom,
  StretchHorizontal as DistributeHorizontal,
  StretchVertical as DistributeVertical,
  Plus, X, Type, Layers, Wand2
} from 'lucide-react'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'

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
    alignElements,
    distributeElements,
    tidyUpElements,
  } = useCanvasStore()

  // Helper for math expressions in inputs
  const evaluateMath = (input: string, defaultValue: number): number => {
    try {
      // Basic sanitization: only allow numbers and + - * / ( ) .
      if (!/^[0-9+\-*/().\s]+$/.test(input)) return defaultValue
      // eslint-disable-next-line no-eval
      const result = eval(input)
      return isNaN(result) ? defaultValue : result
    } catch {
      return defaultValue
    }
  }

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
                value={(!activeColor || activeColor === 'transparent') ? '#000000' : activeColor}
                onChange={(e) => setActiveColor(e.target.value)}
                className="w-8 h-8 rounded border border-border cursor-pointer transition-colors"
              />
              <Input
                value={activeColor || ''}
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
                value={(!activeStroke || activeStroke === 'transparent') ? '#000000' : activeStroke}
                onChange={(e) => setActiveStroke(e.target.value)}
                className="w-8 h-8 rounded border border-border cursor-pointer transition-colors"
              />
              <Input
                value={activeStroke || ''}
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
    <div className="w-64 h-full bg-panel-bg border-l border-border p-4 flex flex-col">
      <div className="flex-1 overflow-y-auto scrollbar-transparent pr-1">
      {/* Alignment & Distribution */}
      <div className="flex items-center justify-between mb-4 bg-muted/20 p-1.5 rounded-lg border border-border/50">
        <div className="flex items-center gap-0.5">
          <Button variant="ghost" size="xs" className="h-7 w-7 p-0" onClick={() => alignElements('left')} title="Align left">
            <AlignLeft className="h-3.5 w-3.5" />
          </Button>
          <Button variant="ghost" size="xs" className="h-7 w-7 p-0" onClick={() => alignElements('center')} title="Align horizontal centers">
            <AlignCenter className="h-3.5 w-3.5" />
          </Button>
          <Button variant="ghost" size="xs" className="h-7 w-7 p-0" onClick={() => alignElements('right')} title="Align right">
            <AlignRight className="h-3.5 w-3.5" />
          </Button>
          <Separator orientation="vertical" className="h-4 mx-1" />
          <Button variant="ghost" size="xs" className="h-7 w-7 p-0" onClick={() => alignElements('top')} title="Align top">
            <AlignTop className="h-3.5 w-3.5" />
          </Button>
          <Button variant="ghost" size="xs" className="h-7 w-7 p-0" onClick={() => alignElements('middle')} title="Align vertical centers">
            <AlignMiddle className="h-3.5 w-3.5" />
          </Button>
          <Button variant="ghost" size="xs" className="h-7 w-7 p-0" onClick={() => alignElements('bottom')} title="Align bottom">
            <AlignBottom className="h-3.5 w-3.5" />
          </Button>
          <Separator orientation="vertical" className="h-4 mx-1" />
          <Button variant="ghost" size="xs" className="h-7 w-7 p-0" onClick={() => distributeElements('horizontal')} title="Distribute horizontal spacing">
            <DistributeHorizontal className="h-3.5 w-3.5" />
          </Button>
          <Button variant="ghost" size="xs" className="h-7 w-7 p-0" onClick={() => distributeElements('vertical')} title="Distribute vertical spacing">
            <DistributeVertical className="h-3.5 w-3.5" />
          </Button>
          <Separator orientation="vertical" className="h-4 mx-1" />
          <Button variant="ghost" size="xs" className="h-7 w-7 p-0" onClick={() => tidyUpElements()} title="Tidy up">
            <Wand2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      <Separator className="mb-4" />

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
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-medium text-muted-foreground">Position & Size</h4>
          {selectedElement.type === 'frame' && (
            <div className="flex items-center gap-1.5 cursor-pointer" onClick={() => updateElement(selectedElement.id, { clipContent: !selectedElement.clipContent })}>
              <span className="text-[10px] text-muted-foreground">Clip content</span>
              <input 
                type="checkbox" 
                checked={selectedElement.clipContent ?? true} 
                onChange={() => {}} // Handled by onClick for better UX
                className="w-3 h-3 rounded border-border"
              />
            </div>
          )}
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-1">
            <Label className="text-xs">X</Label>
            <Input
              value={selectedElement.x ?? 0}
              onChange={(e) => updateElement(selectedElement.id, { x: evaluateMath(e.target.value, selectedElement.x ?? 0) })}
              className="h-8 text-xs"
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Y</Label>
            <Input
              value={selectedElement.y ?? 0}
              onChange={(e) => updateElement(selectedElement.id, { y: evaluateMath(e.target.value, selectedElement.y ?? 0) })}
              className="h-8 text-xs"
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Width</Label>
            <Input
              value={selectedElement.width ?? 100}
              onChange={(e) => updateElement(selectedElement.id, { width: evaluateMath(e.target.value, selectedElement.width ?? 100) })}
              className="h-8 text-xs"
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Height</Label>
            <Input
              value={selectedElement.height ?? 100}
              onChange={(e) => updateElement(selectedElement.id, { height: evaluateMath(e.target.value, selectedElement.height ?? 100) })}
              className="h-8 text-xs"
            />
          </div>
        </div>
        <div className="space-y-1">
          <Label className="text-xs">Rotation</Label>
          <div className="flex items-center gap-2">
            <Slider
              value={[selectedElement.rotation ?? 0]}
              onValueChange={([value]) => updateElement(selectedElement.id, { rotation: value })}
              min={0}
              max={360}
              step={1}
              className="flex-1"
            />
            <span className="text-xs text-muted-foreground w-10">{selectedElement.rotation ?? 0}°</span>
          </div>
        </div>
        <div className="space-y-1">
          <Label className="text-xs">Opacity</Label>
          <div className="flex items-center gap-2">
            <Slider
              value={[(selectedElement.opacity ?? 1) * 100]}
              onValueChange={([value]) => updateElement(selectedElement.id, { opacity: value / 100 })}
              min={0}
              max={100}
              step={1}
              className="flex-1"
            />
            <span className="text-xs text-muted-foreground w-10">{Math.round((selectedElement.opacity ?? 1) * 100)}%</span>
          </div>
        </div>
      </div>

      <Separator className="my-4" />

      {/* Constraints */}
      <div className="space-y-3 mb-4">
        <Label className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Constraints</Label>
        <div className="flex gap-4">
          <div className="flex-1 space-y-1.5">
            <Label className="text-[10px] text-muted-foreground">Horizontal</Label>
            <select
              className="w-full h-8 text-[10px] px-1 rounded border border-border bg-background"
              value={selectedElement.constraints?.horizontal || 'left'}
              onChange={(e) => updateElement(selectedElement.id, { 
                constraints: { ...selectedElement.constraints!, horizontal: e.target.value as any, vertical: selectedElement.constraints?.vertical || 'top' } 
              })}
            >
              <option value="left">Left</option>
              <option value="right">Right</option>
              <option value="center">Center</option>
              <option value="left-right">Left & Right</option>
              <option value="scale">Scale</option>
            </select>
          </div>
          <div className="flex-1 space-y-1.5">
            <Label className="text-[10px] text-muted-foreground">Vertical</Label>
            <select
              className="w-full h-8 text-[10px] px-1 rounded border border-border bg-background"
              value={selectedElement.constraints?.vertical || 'top'}
              onChange={(e) => updateElement(selectedElement.id, { 
                constraints: { ...selectedElement.constraints!, vertical: e.target.value as any, horizontal: selectedElement.constraints?.horizontal || 'left' } 
              })}
            >
              <option value="top">Top</option>
              <option value="bottom">Bottom</option>
              <option value="center">Center</option>
              <option value="top-bottom">Top & Bottom</option>
              <option value="scale">Scale</option>
            </select>
          </div>
        </div>
      </div>

      <Separator className="mb-4" />

      {/* Appearance */}
      <div className="space-y-3 mb-4">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-medium text-muted-foreground">Appearance</h4>
          <select
            className="h-6 text-[10px] px-1 rounded border-none bg-muted/30 font-medium"
            value={selectedElement.blendMode || 'normal'}
            onChange={(e) => updateElement(selectedElement.id, { blendMode: e.target.value as any })}
          >
            <option value="normal">Normal</option>
            <option value="multiply">Multiply</option>
            <option value="screen">Screen</option>
            <option value="overlay">Overlay</option>
            <option value="darken">Darken</option>
            <option value="lighten">Lighten</option>
          </select>
        </div>
        
        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between">
            <Label className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Fill</Label>
            <Tabs 
              value={selectedElement.fillType || 'solid'} 
              onValueChange={(val: any) => updateElement(selectedElement.id, { fillType: val })}
              className="h-6"
            >
              <TabsList className="h-6 bg-muted/50 p-0">
                <TabsTrigger value="solid" className="text-[10px] h-5 px-2">Solid</TabsTrigger>
                <TabsTrigger value="gradient" className="text-[10px] h-5 px-2">Gradient</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          {(selectedElement.fillType || 'solid') === 'solid' ? (
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={(!selectedElement.fill || selectedElement.fill === 'transparent') ? '#000000' : selectedElement.fill}
                onChange={(e) => updateElement(selectedElement.id, { fill: e.target.value })}
                className="w-10 h-8 rounded border border-border cursor-pointer transition-colors"
              />
              <Input
                value={selectedElement.fill ?? ''}
                onChange={(e) => updateElement(selectedElement.id, { fill: e.target.value })}
                className="flex-1 h-8 text-xs font-mono"
              />
            </div>
          ) : (
            <div className="space-y-3 bg-muted/20 p-2 rounded-md border border-border/50">
              <div className="flex items-center justify-between gap-2">
                <select
                  value={selectedElement.gradient?.type || 'linear'}
                  onChange={(e) => updateElement(selectedElement.id, { 
                    gradient: { ...selectedElement.gradient!, type: e.target.value as any, stops: selectedElement.gradient?.stops || [{color: '#3B82F6', offset: 0}, {color: '#1E40AF', offset: 100}], angle: selectedElement.gradient?.angle || 90 } 
                  })}
                  className="flex-1 h-7 text-xs rounded border border-border bg-background"
                >
                  <option value="linear">Linear</option>
                  <option value="radial">Radial</option>
                </select>
                {selectedElement.gradient?.type === 'linear' && (
                  <div className="flex items-center gap-1">
                    <Input
                      type="number"
                      value={selectedElement.gradient?.angle || 90}
                      onChange={(e) => updateElement(selectedElement.id, { 
                        gradient: { ...selectedElement.gradient!, angle: Number(e.target.value) } 
                      })}
                      className="w-12 h-7 text-[10px] px-1"
                    />
                    <span className="text-[10px] text-muted-foreground">°</span>
                  </div>
                )}
              </div>
              
              <div className="space-y-4">
                {selectedElement.gradient?.stops.map((stop, i) => (
                  <div key={i} className="space-y-2 pb-2 border-b border-border/30 last:border-0">
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={stop.color || '#000000'}
                        onChange={(e) => {
                          const newStops = [...(selectedElement.gradient?.stops || [])]
                          newStops[i] = { ...newStops[i], color: e.target.value }
                          updateElement(selectedElement.id, { gradient: { ...selectedElement.gradient!, stops: newStops } })
                        }}
                        className="w-6 h-6 rounded-full border border-border cursor-pointer shadow-sm"
                      />
                      <div className="flex-1 space-y-1">
                        <div className="flex justify-between items-center">
                          <Label className="text-[9px] text-muted-foreground uppercase">Position</Label>
                          <span className="text-[9px] font-mono">{stop.offset}%</span>
                        </div>
                        <Slider
                          value={[stop.offset]}
                          onValueChange={([val]) => {
                            const newStops = [...(selectedElement.gradient?.stops || [])]
                            newStops[i] = { ...newStops[i], offset: val }
                            updateElement(selectedElement.id, { gradient: { ...selectedElement.gradient!, stops: newStops } })
                          }}
                          min={0} max={100} step={1} className="h-2"
                        />
                      </div>
                    </div>
                    {/* New: Opacity slider for each stop */}
                    <div className="flex items-center gap-2 pl-8">
                       <div className="flex-1 space-y-1">
                        <div className="flex justify-between items-center">
                          <Label className="text-[9px] text-muted-foreground uppercase">Opacity</Label>
                          <span className="text-[9px] font-mono">{Math.round((stop.opacity ?? 1) * 100)}%</span>
                        </div>
                        <Slider
                          value={[(stop.opacity ?? 1) * 100]}
                          onValueChange={([val]) => {
                            const newStops = [...(selectedElement.gradient?.stops || [])]
                            newStops[i] = { ...newStops[i], opacity: val / 100 }
                            updateElement(selectedElement.id, { gradient: { ...selectedElement.gradient!, stops: newStops } })
                          }}
                          min={0} max={100} step={1} className="h-2"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <Separator className="my-4" />

        {/* Stroke Section */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Stroke</Label>
            <Tabs 
              value={selectedElement.strokeType || 'solid'} 
              onValueChange={(val: any) => updateElement(selectedElement.id, { strokeType: val })}
              className="h-6"
            >
              <TabsList className="h-6 bg-muted/50 p-0">
                <TabsTrigger value="solid" className="text-[10px] h-5 px-2">Solid</TabsTrigger>
                <TabsTrigger value="gradient" className="text-[10px] h-5 px-2">Gradient</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          {(selectedElement.strokeType || 'solid') === 'solid' ? (
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={(!selectedElement.stroke || selectedElement.stroke === 'transparent') ? '#000000' : selectedElement.stroke}
                onChange={(e) => updateElement(selectedElement.id, { stroke: e.target.value })}
                className="w-8 h-8 rounded border border-border cursor-pointer transition-colors shrink-0"
              />
              <Input
                value={selectedElement.stroke ?? ''}
                onChange={(e) => updateElement(selectedElement.id, { stroke: e.target.value })}
                className="flex-1 h-8 text-xs font-mono"
              />
            </div>
          ) : (
            <div className="space-y-3 bg-muted/20 p-2 rounded-md border border-border/50">
              <div className="flex items-center justify-between gap-2">
                <select
                  value={selectedElement.strokeGradient?.type || 'linear'}
                  onChange={(e) => updateElement(selectedElement.id, { 
                    strokeGradient: { ...selectedElement.strokeGradient!, type: e.target.value as any, stops: selectedElement.strokeGradient?.stops || [{color: '#FFFFFF', offset: 0, opacity: 0.5}, {color: '#FFFFFF', offset: 100, opacity: 0.1}], angle: selectedElement.strokeGradient?.angle || 90 } 
                  })}
                  className="flex-1 h-7 text-xs rounded border border-border bg-background"
                >
                  <option value="linear">Linear</option>
                  <option value="radial">Radial</option>
                </select>
                {selectedElement.strokeGradient?.type === 'linear' && (
                  <div className="flex items-center gap-1">
                    <Input
                      type="number"
                      value={selectedElement.strokeGradient?.angle || 90}
                      onChange={(e) => updateElement(selectedElement.id, { 
                        strokeGradient: { ...selectedElement.strokeGradient!, angle: Number(e.target.value) } 
                      })}
                      className="w-12 h-7 text-[10px] px-1"
                    />
                    <span className="text-[10px] text-muted-foreground">°</span>
                  </div>
                )}
              </div>
              
              <div className="space-y-4">
                {(selectedElement.strokeGradient?.stops || []).map((stop, i) => (
                  <div key={i} className="space-y-2 pb-2 border-b border-border/30 last:border-0">
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={stop.color || '#000000'}
                        onChange={(e) => {
                          const newStops = [...(selectedElement.strokeGradient?.stops || [])]
                          newStops[i] = { ...newStops[i], color: e.target.value }
                          updateElement(selectedElement.id, { strokeGradient: { ...selectedElement.strokeGradient!, stops: newStops } })
                        }}
                        className="w-6 h-6 rounded-full border border-border cursor-pointer shadow-sm"
                      />
                      <div className="flex-1 space-y-1">
                        <div className="flex justify-between items-center">
                          <Label className="text-[9px] text-muted-foreground uppercase">Position</Label>
                          <span className="text-[9px] font-mono">{stop.offset}%</span>
                        </div>
                        <Slider
                          value={[stop.offset]}
                          onValueChange={([val]) => {
                            const newStops = [...(selectedElement.strokeGradient?.stops || [])]
                            newStops[i] = { ...newStops[i], offset: val }
                            updateElement(selectedElement.id, { strokeGradient: { ...selectedElement.strokeGradient!, stops: newStops } })
                          }}
                          min={0} max={100} step={1} className="h-2"
                        />
                      </div>
                    </div>
                    <div className="flex items-center gap-2 pl-8">
                       <div className="flex-1 space-y-1">
                        <div className="flex justify-between items-center">
                          <Label className="text-[9px] text-muted-foreground uppercase">Opacity</Label>
                          <span className="text-[9px] font-mono">{Math.round((stop.opacity ?? 1) * 100)}%</span>
                        </div>
                        <Slider
                          value={[(stop.opacity ?? 1) * 100]}
                          onValueChange={([val]) => {
                            const newStops = [...(selectedElement.strokeGradient?.stops || [])]
                            newStops[i] = { ...newStops[i], opacity: val / 100 }
                            updateElement(selectedElement.id, { strokeGradient: { ...selectedElement.strokeGradient!, stops: newStops } })
                          }}
                          min={0} max={100} step={1} className="h-2"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          <div className="flex items-center gap-2">
            <div className="flex-1">
              <Slider
                value={[selectedElement.strokeWidth || 0]}
                onValueChange={([value]) => updateElement(selectedElement.id, { strokeWidth: value })}
                min={0} max={50} step={1}
              />
            </div>
            <span className="text-[10px] w-6 text-right">{selectedElement.strokeWidth || 0}</span>
          </div>

          <Tabs 
            value={selectedElement.strokePosition || 'center'} 
            onValueChange={(val: any) => updateElement(selectedElement.id, { strokePosition: val })}
            className="h-6"
          >
            <TabsList className="h-6 w-full bg-muted/50 p-0">
              <TabsTrigger value="inside" className="text-[10px] h-5 flex-1 p-0">Inside</TabsTrigger>
              <TabsTrigger value="center" className="text-[10px] h-5 flex-1 p-0">Center</TabsTrigger>
              <TabsTrigger value="outside" className="text-[10px] h-5 flex-1 p-0">Outside</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        <Separator className="my-4" />

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Corner</Label>
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-muted-foreground w-12">Radius</span>
              <Slider
                value={[selectedElement.cornerRadius || 0]}
                onValueChange={([value]) => updateElement(selectedElement.id, { cornerRadius: value })}
                min={0} max={100} step={1} className="flex-1"
              />
              <span className="text-[10px] w-6 text-right">{selectedElement.cornerRadius || 0}</span>
            </div>
            { (selectedElement.cornerRadius || 0) > 0 && (selectedElement.type === 'rectangle' || selectedElement.type === 'frame') && (
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-muted-foreground w-12" title="Corner Smoothing (Squircle)">Smooth</span>
                <Slider
                  value={[(selectedElement.cornerSmoothing || 0) * 100]}
                  onValueChange={([value]) => updateElement(selectedElement.id, { cornerSmoothing: value / 100 })}
                  min={0} max={100} step={1} className="flex-1"
                />
                <span className="text-[10px] w-6 text-right">{Math.round((selectedElement.cornerSmoothing || 0) * 100)}%</span>
              </div>
            )}
          </div>
        </div>

        <Separator className="my-4" />

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Effects</Label>
            <Button 
                variant="outline" 
                size="sm" 
                className="h-6 text-[9px] px-2 bg-primary/5 hover:bg-primary/10 border-primary/20 text-primary flex items-center gap-1"
                onClick={() => {
                  updateElement(selectedElement.id, {
                    fillType: 'gradient',
                    gradient: {
                      type: 'radial',
                      angle: 90,
                      stops: [
                        { color: '#FFFFFF', offset: 0, opacity: 0.2 },
                        { color: '#FFFFFF', offset: 100, opacity: 0.05 }
                      ]
                    },
                    strokeType: 'gradient',
                    strokeGradient: {
                      type: 'linear',
                      angle: 135,
                      stops: [
                        { color: '#FFFFFF', offset: 0, opacity: 0.5 },
                        { color: '#FFFFFF', offset: 100, opacity: 0.1 }
                      ]
                    },
                    strokeWidth: 1.5,
                    blurEnabled: true,
                    blurType: 'background',
                    blurAmount: 20,
                    cornerRadius: selectedElement.cornerRadius || 20,
                    shadowEnabled: true,
                    shadowBlur: 30,
                    shadowColor: 'rgba(0,0,0,0.2)',
                    shadowX: 0,
                    shadowY: 10
                  })
                }}
            >
              Glass
            </Button>
          </div>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs">Blur</span>
              <input 
                type="checkbox" 
                checked={selectedElement.blurEnabled ?? false} 
                onChange={(e) => updateElement(selectedElement.id, { blurEnabled: e.target.checked })}
                className="rounded border-border"
              />
            </div>
            
            {selectedElement.blurEnabled && (
              <div className="space-y-3 bg-muted/20 p-2 rounded-md border border-border/50">
                <Tabs 
                  value={selectedElement.blurType || 'layer'} 
                  onValueChange={(val: any) => updateElement(selectedElement.id, { blurType: val })}
                  className="h-6"
                >
                  <TabsList className="h-6 w-full bg-muted/50 p-0">
                    <TabsTrigger value="layer" className="text-[10px] h-5 flex-1 p-0">Layer</TabsTrigger>
                    <TabsTrigger value="background" className="text-[10px] h-5 flex-1 p-0">Background</TabsTrigger>
                  </TabsList>
                </Tabs>
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <Label className="text-[10px] text-muted-foreground">Amount</Label>
                    <span className="text-[10px]">{selectedElement.blurAmount || 0}px</span>
                  </div>
                  <Slider 
                    value={[selectedElement.blurAmount || 0]}
                    onValueChange={([val]) => updateElement(selectedElement.id, { blurAmount: val })}
                    max={100} step={1} className="flex-1"
                  />
                </div>
              </div>
            )}
          </div>

          <Separator className="my-2" />
          
          <div className="flex items-center justify-between">
            <span className="text-xs">Drop Shadow</span>
            <input 
              type="checkbox" 
              checked={selectedElement.shadowEnabled ?? false} 
              onChange={(e) => updateElement(selectedElement.id, { shadowEnabled: e.target.checked })}
              className="rounded border-border"
            />
          </div>
          
          {selectedElement.shadowEnabled && (
            <div className="space-y-3 bg-muted/20 p-2 rounded-md border border-border/50">
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <Label className="text-[10px] text-muted-foreground">X</Label>
                  <Input 
                    type="number" value={selectedElement.shadowX ?? 0}
                    onChange={(e) => updateElement(selectedElement.id, { shadowX: Number(e.target.value) })}
                    className="h-7 text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-[10px] text-muted-foreground">Y</Label>
                  <Input 
                    type="number" value={selectedElement.shadowY ?? 0}
                    onChange={(e) => updateElement(selectedElement.id, { shadowY: Number(e.target.value) })}
                    className="h-7 text-xs"
                  />
                </div>
              </div>
              <div className="space-y-1">
                <Label className="text-[10px] text-muted-foreground">Blur</Label>
                <div className="flex items-center gap-2">
                  <Slider 
                    value={[selectedElement.shadowBlur || 4]}
                    onValueChange={([val]) => updateElement(selectedElement.id, { shadowBlur: val })}
                    max={50} className="flex-1"
                  />
                  <span className="text-[10px] w-6 text-right">{selectedElement.shadowBlur || 4}</span>
                </div>
              </div>
              <div className="space-y-1">
                <Label className="text-[10px] text-muted-foreground">Shadow Color</Label>
                <div className="flex items-center gap-2">
                  <input 
                    type="color" value={selectedElement.shadowColor ?? '#000000'}
                    onChange={(e) => updateElement(selectedElement.id, { shadowColor: e.target.value })}
                    className="w-6 h-6 rounded border border-border"
                  />
                  <Input 
                    value={selectedElement.shadowColor ?? '#000000'}
                    onChange={(e) => updateElement(selectedElement.id, { shadowColor: e.target.value })}
                    className="h-7 text-xs flex-1 font-mono"
                  />
                </div>
              </div>
            </div>
          )}
        </div>
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

            {/* Font Size & Weight */}
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <Label className="text-[10px] text-muted-foreground">Size</Label>
                <Input
                  type="number"
                  value={selectedElement.fontSize ?? 16}
                  onChange={(e) => updateElement(selectedElement.id, { fontSize: Number(e.target.value) })}
                  className="h-7 text-xs"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-[10px] text-muted-foreground">Weight</Label>
                <select
                  value={selectedElement.fontWeight || 'normal'}
                  onChange={(e) => updateElement(selectedElement.id, { fontWeight: e.target.value })}
                  className="w-full h-7 text-[10px] px-1 rounded border border-border bg-background"
                >
                  <option value="normal">Regular</option>
                  <option value="medium">Medium</option>
                  <option value="bold">Bold</option>
                  <option value="900">Black</option>
                </select>
              </div>
            </div>

            {/* Letter Spacing & Line Height */}
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <Label className="text-[10px] text-muted-foreground">Letter Spacing</Label>
                <Input
                  type="number"
                  value={selectedElement.letterSpacing ?? 0}
                  onChange={(e) => updateElement(selectedElement.id, { letterSpacing: Number(e.target.value) })}
                  className="h-7 text-xs"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-[10px] text-muted-foreground">Line Height</Label>
                <Input
                  type="number"
                  value={selectedElement.lineHeight ?? 1.2}
                  step={0.1}
                  onChange={(e) => updateElement(selectedElement.id, { lineHeight: Number(e.target.value) })}
                  className="h-7 text-xs"
                />
              </div>
            </div>

            {/* Paragraph Spacing & Case */}
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <Label className="text-[10px] text-muted-foreground">Paragraph Spacing</Label>
                <Input
                  type="number"
                  value={selectedElement.paragraphSpacing ?? 0}
                  onChange={(e) => updateElement(selectedElement.id, { paragraphSpacing: Number(e.target.value) })}
                  className="h-7 text-xs"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-[10px] text-muted-foreground">Case</Label>
                <select
                  value={selectedElement.textCase || 'none'}
                  onChange={(e) => updateElement(selectedElement.id, { textCase: e.target.value as any })}
                  className="w-full h-7 text-[10px] px-1 rounded border border-border bg-background"
                >
                  <option value="none">Default</option>
                  <option value="uppercase">UPPER</option>
                  <option value="lowercase">lower</option>
                  <option value="capitalize">Title</option>
                </select>
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
                  value={(!selectedElement.textStroke || selectedElement.textStroke === 'transparent') ? '#000000' : selectedElement.textStroke}
                  onChange={(e) => updateElement(selectedElement.id, { textStroke: e.target.value })}
                  className="w-8 h-8 rounded border border-border cursor-pointer transition-colors"
                />
                <Input
                  value={selectedElement.textStroke ?? '#000000'}
                  onChange={(e) => updateElement(selectedElement.id, { textStroke: e.target.value })}
                  className="flex-1 h-8 text-xs font-mono"
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
    </div>
  )
}
