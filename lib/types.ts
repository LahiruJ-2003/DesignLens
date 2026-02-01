// Canvas element types
export type ElementType = 'rectangle' | 'circle' | 'text' | 'image' | 'line' | 'frame'

export interface CanvasElement {
  id: string
  type: ElementType
  x: number
  y: number
  width: number
  height: number
  rotation: number
  fill: string
  stroke: string
  strokeWidth: number
  opacity: number
  cornerRadius?: number
  text?: string
  fontSize?: number
  fontFamily?: string
  fontWeight?: string
  textAlign?: 'left' | 'center' | 'right'
  imageUrl?: string
  locked?: boolean
  visible?: boolean
  name: string
}

export interface Layer {
  id: string
  name: string
  visible: boolean
  locked: boolean
  elementId: string
}

export interface DesignProject {
  id: string
  name: string
  elements: CanvasElement[]
  layers: Layer[]
  canvasWidth: number
  canvasHeight: number
  createdAt: Date
  updatedAt: Date
}

// AI Analysis types
export interface UIIssue {
  id: string
  type: 'contrast' | 'spacing' | 'alignment' | 'typography' | 'accessibility' | 'color'
  severity: 'error' | 'warning' | 'info'
  message: string
  suggestion: string
  elementIds: string[]
  position?: { x: number; y: number }
}

export interface AnalysisResult {
  issues: UIIssue[]
  score: number
  timestamp: Date
}

export interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
  issues?: UIIssue[]
}

// Tool types
export type ToolType = 'select' | 'rectangle' | 'circle' | 'text' | 'line' | 'frame' | 'hand' | 'image'
