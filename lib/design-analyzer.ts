import type { CanvasElement, UIIssue } from './types'

// WCAG color contrast ratios
const CONTRAST_RATIO_AA_NORMAL = 4.5
const CONTRAST_RATIO_AA_LARGE = 3
const CONTRAST_RATIO_AAA_NORMAL = 7
const CONTRAST_RATIO_AAA_LARGE = 4.5

// Minimum touch target sizes
const MIN_TOUCH_TARGET = 44

// Typography standards
const MIN_BODY_FONT_SIZE = 14
const MIN_READABLE_FONT_SIZE = 12
const MAX_LINE_LENGTH = 75 // characters

export interface AnalysisConfig {
  checkContrast: boolean
  checkSpacing: boolean
  checkAlignment: boolean
  checkTypography: boolean
  checkAccessibility: boolean
  checkColorHarmony: boolean
}

const defaultConfig: AnalysisConfig = {
  checkContrast: true,
  checkSpacing: true,
  checkAlignment: true,
  checkTypography: true,
  checkAccessibility: true,
  checkColorHarmony: true,
}

// Color utility functions
export function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null
}

export function getLuminance(r: number, g: number, b: number): number {
  const [rs, gs, bs] = [r, g, b].map((c) => {
    c = c / 255
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)
  })
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs
}

export function getContrastRatio(color1: string, color2: string): number {
  const rgb1 = hexToRgb(color1)
  const rgb2 = hexToRgb(color2)
  
  if (!rgb1 || !rgb2) return 1
  
  const l1 = getLuminance(rgb1.r, rgb1.g, rgb1.b)
  const l2 = getLuminance(rgb2.r, rgb2.g, rgb2.b)
  
  const lighter = Math.max(l1, l2)
  const darker = Math.min(l1, l2)
  
  return (lighter + 0.05) / (darker + 0.05)
}

export function isLightColor(color: string): boolean {
  const rgb = hexToRgb(color)
  if (!rgb) return true
  const luminance = getLuminance(rgb.r, rgb.g, rgb.b)
  return luminance > 0.5
}

// Get color harmony type
export function getColorHarmony(colors: string[]): string {
  if (colors.length < 2) return 'none'
  // Simplified harmony detection
  const hues = colors.map((c) => {
    const rgb = hexToRgb(c)
    if (!rgb) return 0
    const max = Math.max(rgb.r, rgb.g, rgb.b)
    const min = Math.min(rgb.r, rgb.g, rgb.b)
    let h = 0
    if (max === min) h = 0
    else if (max === rgb.r) h = ((rgb.g - rgb.b) / (max - min)) % 6
    else if (max === rgb.g) h = (rgb.b - rgb.r) / (max - min) + 2
    else h = (rgb.r - rgb.g) / (max - min) + 4
    return (h * 60 + 360) % 360
  })
  
  // Check for complementary (opposite on color wheel ~180°)
  if (colors.length === 2) {
    const diff = Math.abs(hues[0] - hues[1])
    if (diff > 150 && diff < 210) return 'complementary'
  }
  
  // Check for analogous (adjacent on color wheel ~30°)
  const maxDiff = Math.max(...hues) - Math.min(...hues)
  if (maxDiff < 60) return 'analogous'
  
  return 'mixed'
}

// Main analysis function
export function analyzeDesign(
  elements: CanvasElement[],
  config: AnalysisConfig = defaultConfig
): UIIssue[] {
  const issues: UIIssue[] = []
  let issueId = 0

  const generateId = () => `issue-${++issueId}`

  // Filter visible elements only
  const visibleElements = elements.filter((el) => el.visible !== false)

  if (visibleElements.length === 0) {
    return issues
  }

  // 1. Contrast Analysis
  if (config.checkContrast) {
    visibleElements.forEach((el) => {
      if (el.type === 'text' && el.fill) {
        // Check text against common backgrounds
        const textColor = el.fill
        const assumedBg = '#ffffff' // Assume white background for simplicity
        const ratio = getContrastRatio(textColor, assumedBg)
        
        const isLargeText = el.fontSize && el.fontSize >= 18
        const minRatio = isLargeText ? CONTRAST_RATIO_AA_LARGE : CONTRAST_RATIO_AA_NORMAL
        
        if (ratio < minRatio) {
          issues.push({
            id: generateId(),
            type: 'contrast',
            severity: ratio < 2.5 ? 'error' : 'warning',
            message: `Low contrast in "${el.name}"`,
            suggestion: `Contrast ratio is ${ratio.toFixed(2)}:1. WCAG AA requires at least ${minRatio}:1 for ${isLargeText ? 'large' : 'normal'} text.`,
            elementIds: [el.id],
            position: { x: el.x, y: el.y },
          })
        }
      }
      
      // Check for potentially invisible elements (very low contrast fill/stroke)
      if (el.fill && el.stroke && el.strokeWidth > 0) {
        const ratio = getContrastRatio(el.fill, el.stroke)
        if (ratio < 1.5) {
          issues.push({
            id: generateId(),
            type: 'contrast',
            severity: 'info',
            message: `Low contrast between fill and stroke in "${el.name}"`,
            suggestion: 'Consider increasing the contrast between fill and stroke colors for better visibility.',
            elementIds: [el.id],
            position: { x: el.x, y: el.y },
          })
        }
      }
    })
  }

  // 2. Spacing Analysis
  if (config.checkSpacing) {
    // Check for overlapping elements
    visibleElements.forEach((el1, i) => {
      visibleElements.slice(i + 1).forEach((el2) => {
        if (elementsOverlap(el1, el2)) {
          issues.push({
            id: generateId(),
            type: 'spacing',
            severity: 'warning',
            message: `"${el1.name}" and "${el2.name}" are overlapping`,
            suggestion: 'Overlapping elements may cause visual confusion. Consider adjusting positions or using layering intentionally.',
            elementIds: [el1.id, el2.id],
            position: { x: el1.x, y: el1.y },
          })
        }
      })
    })

    // Check for inconsistent spacing between elements
    const sortedByX = [...visibleElements].sort((a, b) => a.x - b.x)
    const horizontalGaps: number[] = []
    
    for (let i = 1; i < sortedByX.length; i++) {
      const gap = sortedByX[i].x - (sortedByX[i - 1].x + sortedByX[i - 1].width)
      if (gap > 0 && gap < 200) {
        horizontalGaps.push(gap)
      }
    }
    
    if (horizontalGaps.length >= 2) {
      const avgGap = horizontalGaps.reduce((a, b) => a + b, 0) / horizontalGaps.length
      const inconsistent = horizontalGaps.some((g) => Math.abs(g - avgGap) > 10)
      
      if (inconsistent) {
        issues.push({
          id: generateId(),
          type: 'spacing',
          severity: 'info',
          message: 'Inconsistent horizontal spacing detected',
          suggestion: `Consider using consistent spacing (e.g., ${Math.round(avgGap)}px) between elements for visual harmony.`,
          elementIds: visibleElements.map((e) => e.id),
        })
      }
    }
  }

  // 3. Alignment Analysis
  if (config.checkAlignment) {
    // Check for near-alignments (elements almost aligned but not quite)
    const xPositions = visibleElements.map((el) => el.x)
    const yPositions = visibleElements.map((el) => el.y)
    const rightEdges = visibleElements.map((el) => el.x + el.width)
    const bottomEdges = visibleElements.map((el) => el.y + el.height)
    
    // Check for near-miss left alignments
    xPositions.forEach((x1, i) => {
      xPositions.slice(i + 1).forEach((x2, j) => {
        const diff = Math.abs(x1 - x2)
        if (diff > 0 && diff <= 5) {
          issues.push({
            id: generateId(),
            type: 'alignment',
            severity: 'info',
            message: `"${visibleElements[i].name}" and "${visibleElements[i + j + 1].name}" are almost aligned`,
            suggestion: `Elements are ${diff}px apart. Consider aligning them exactly for a cleaner look.`,
            elementIds: [visibleElements[i].id, visibleElements[i + j + 1].id],
          })
        }
      })
    })
  }

  // 4. Typography Analysis
  if (config.checkTypography) {
    const textElements = visibleElements.filter((el) => el.type === 'text')
    
    textElements.forEach((el) => {
      // Check minimum font size
      if (el.fontSize && el.fontSize < MIN_READABLE_FONT_SIZE) {
        issues.push({
          id: generateId(),
          type: 'typography',
          severity: 'error',
          message: `Text too small in "${el.name}"`,
          suggestion: `Font size is ${el.fontSize}px. Minimum readable size is ${MIN_READABLE_FONT_SIZE}px, recommended body text is ${MIN_BODY_FONT_SIZE}px+.`,
          elementIds: [el.id],
          position: { x: el.x, y: el.y },
        })
      } else if (el.fontSize && el.fontSize < MIN_BODY_FONT_SIZE) {
        issues.push({
          id: generateId(),
          type: 'typography',
          severity: 'warning',
          message: `Small text in "${el.name}"`,
          suggestion: `Font size is ${el.fontSize}px. Consider using at least ${MIN_BODY_FONT_SIZE}px for better readability.`,
          elementIds: [el.id],
          position: { x: el.x, y: el.y },
        })
      }
    })
    
    // Check for too many different font sizes
    const fontSizes = [...new Set(textElements.map((el) => el.fontSize).filter(Boolean))]
    if (fontSizes.length > 4) {
      issues.push({
        id: generateId(),
        type: 'typography',
        severity: 'info',
        message: 'Too many font sizes used',
        suggestion: `You're using ${fontSizes.length} different font sizes. Consider limiting to 3-4 sizes for better hierarchy.`,
        elementIds: textElements.map((e) => e.id),
      })
    }
  }

  // 5. Accessibility Analysis
  if (config.checkAccessibility) {
    visibleElements.forEach((el) => {
      // Check touch target size
      if (el.width < MIN_TOUCH_TARGET || el.height < MIN_TOUCH_TARGET) {
        issues.push({
          id: generateId(),
          type: 'accessibility',
          severity: el.width < 30 || el.height < 30 ? 'error' : 'warning',
          message: `"${el.name}" may be too small for touch`,
          suggestion: `Size is ${Math.round(el.width)}x${Math.round(el.height)}px. Minimum touch target should be ${MIN_TOUCH_TARGET}x${MIN_TOUCH_TARGET}px.`,
          elementIds: [el.id],
          position: { x: el.x, y: el.y },
        })
      }
    })
  }

  // 6. Color Harmony Analysis
  if (config.checkColorHarmony) {
    const colors = [...new Set(visibleElements.map((el) => el.fill).filter(Boolean))]
    
    if (colors.length > 5) {
      issues.push({
        id: generateId(),
        type: 'color',
        severity: 'warning',
        message: 'Too many colors in use',
        suggestion: `You're using ${colors.length} different colors. Consider limiting to 3-5 colors for visual cohesion.`,
        elementIds: visibleElements.map((e) => e.id),
      })
    }
    
    const harmony = getColorHarmony(colors)
    if (harmony === 'mixed' && colors.length > 2) {
      issues.push({
        id: generateId(),
        type: 'color',
        severity: 'info',
        message: 'Consider using a color harmony',
        suggestion: 'Try using complementary, analogous, or triadic colors for a more cohesive palette.',
        elementIds: visibleElements.map((e) => e.id),
      })
    }
  }

  return issues
}

function elementsOverlap(el1: CanvasElement, el2: CanvasElement): boolean {
  return !(
    el1.x + el1.width < el2.x ||
    el2.x + el2.width < el1.x ||
    el1.y + el1.height < el2.y ||
    el2.y + el2.height < el1.y
  )
}

// Calculate design score based on issues
export function calculateDesignScore(issues: UIIssue[]): number {
  let score = 100
  
  issues.forEach((issue) => {
    switch (issue.severity) {
      case 'error':
        score -= 15
        break
      case 'warning':
        score -= 8
        break
      case 'info':
        score -= 3
        break
    }
  })
  
  return Math.max(0, Math.min(100, score))
}

// Generate summary text for issues
export function generateIssueSummary(issues: UIIssue[]): string {
  const errors = issues.filter((i) => i.severity === 'error').length
  const warnings = issues.filter((i) => i.severity === 'warning').length
  const infos = issues.filter((i) => i.severity === 'info').length
  
  const parts: string[] = []
  if (errors > 0) parts.push(`${errors} critical issue${errors > 1 ? 's' : ''}`)
  if (warnings > 0) parts.push(`${warnings} warning${warnings > 1 ? 's' : ''}`)
  if (infos > 0) parts.push(`${infos} suggestion${infos > 1 ? 's' : ''}`)
  
  if (parts.length === 0) return 'No issues found. Great job!'
  return `Found ${parts.join(', ')}.`
}

// NEW: Python PyTorch AI Backend Integration (Phase 4)
// ---------------------------------------------------------
export async function analyzeDesignWithAI(elements: CanvasElement[]) {
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8001";
  
  try {
    const res = await fetch(`${backendUrl}/api/analyze-ui`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ elements }),
    });
    
    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }
    
    return await res.json();
  } catch (error) {
    console.error("AI Backend is unreachable. Ensure the FastAPI server is running on port 8000.", error);
    return null;
  }
}
