// Canvas element types
export type ElementType = 'rectangle' | 'circle' | 'text' | 'image' | 'line' | 'frame' | 'triangle' | 'star' | 'arrow'
export type FillType = 'solid' | 'gradient'
export type GradientType = 'linear' | 'radial'

export interface GradientStop {
  color: string
  offset: number
  opacity?: number // New: Opacity for this specific stop (0 to 1)
}

export interface GradientConfig {
  type: GradientType
  stops: GradientStop[]
  angle: number // Angle in degrees for linear, or ignored for radial
}

export interface CanvasElement {
  id: string
  type: ElementType
  x: number
  y: number
  width: number
  height: number
  rotation: number
  name: string
  
  // Appearance
  fill: string
  fillType?: FillType
  gradient?: GradientConfig
  stroke: string
  strokeWidth: number
  strokeType?: 'solid' | 'gradient' // New
  strokeGradient?: GradientConfig // New
  opacity: number
  cornerRadius?: number
  
  // Shadows
  shadowEnabled?: boolean
  shadowColor?: string
  shadowBlur?: number
  shadowX?: number
  shadowY?: number
  // Phase 3: Advanced Effects
  blurEnabled?: boolean
  blurType?: 'layer' | 'background'
  blurAmount?: number
  blendMode?: 'normal' | 'multiply' | 'screen' | 'overlay' | 'darken' | 'lighten' | 'color-dodge' | 'color-burn' | 'hard-light' | 'soft-light' | 'difference' | 'exclusion' | 'hue' | 'saturation' | 'color' | 'luminosity'
  constraints?: {
    horizontal: 'left' | 'right' | 'center' | 'left-right' | 'scale'
    vertical: 'top' | 'bottom' | 'center' | 'top-bottom' | 'scale'
  }

  // Phase 4: Industrial Frames & Auto Layout
  clipContent?: boolean
  layoutMode?: 'none' | 'vertical' | 'horizontal'
  itemSpacing?: number
  padding?: {
    top: number
    right: number
    bottom: number
    left: number
  }
  src?: string // For images
  
  // Text Properties
  text?: string
  fontSize?: number
  fontFamily?: string
  fontWeight?: string
  textAlign?: 'left' | 'center' | 'right'
  textStroke?: string
  textStrokeWidth?: number
  letterSpacing?: number
  lineHeight?: number
  textDecoration?: 'none' | 'underline' | 'line-through'
  textTransform?: 'none' | 'uppercase' | 'lowercase' | 'capitalize'
  
  // Other
  imageUrl?: string
  locked?: boolean
  visible?: boolean
  parentId?: string
  
  // Phase 2 Properties
  cornerSmoothing?: number // 0 to 1
  strokePosition?: 'center' | 'inside' | 'outside'
  paragraphSpacing?: number
  paragraphIndent?: number
  textCase?: 'none' | 'uppercase' | 'lowercase' | 'capitalize'
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
export type ToolType = 'select' | 'rectangle' | 'circle' | 'text' | 'line' | 'frame' | 'hand' | 'image' | 'triangle' | 'star' | 'arrow'
