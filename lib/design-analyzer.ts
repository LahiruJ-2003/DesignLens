import type { CanvasElement, UIIssue } from './types'

// WCAG (Web Content Accessibility Guidelines) contrast requirements
// We use these to make sure text is actually readable against its background
const CONTRAST_RATIO_AA_NORMAL = 4.5
const CONTRAST_RATIO_AA_LARGE = 3
const CONTRAST_RATIO_AAA_NORMAL = 7
const CONTRAST_RATIO_AAA_LARGE = 4.5

// Minimum size for buttons/interactive elements (Apple/Google standard is usually 44-48px)
const MIN_TOUCH_TARGET = 44

// Basic typography rules to prevent unreadable text or super long lines
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

// color helpers
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

// Returns true if outer's bounding box fully contains inner's bounding box.
// Used to skip overlap warnings for intentional containment (text in button, icon in card, etc.)
function elementContains(outer: CanvasElement, inner: CanvasElement): boolean {
  return (
    outer.x <= inner.x &&
    outer.y <= inner.y &&
    outer.x + outer.width  >= inner.x + inner.width &&
    outer.y + outer.height >= inner.y + inner.height
  )
}

// Find the actual background color behind a text element by looking for the
// topmost element whose bounding box contains the text element's position.
function getBackgroundBehind(textEl: CanvasElement, allElements: CanvasElement[]): string {
  const cx = textEl.x + textEl.width / 2
  const cy = textEl.y + textEl.height / 2
  const candidates = allElements.filter(
    (el) =>
      el.id !== textEl.id &&
      el.fill &&
      el.x <= cx &&
      el.y <= cy &&
      el.x + el.width  >= cx &&
      el.y + el.height >= cy
  )
  // Last in array = visually on top (highest z-index), so use that as background
  return candidates.length > 0
    ? (candidates[candidates.length - 1].fill ?? '#ffffff')
    : '#ffffff'
}

// Element types that can realistically be interactive touch targets.
// Text, lines, arrows, and decorative shapes don't need 44px tap areas.
const INTERACTIVE_TYPES = new Set(['rectangle', 'circle', 'frame', 'triangle', 'star'])

export function analyzeDesign(
  elements: CanvasElement[],
  config: AnalysisConfig = defaultConfig
): UIIssue[] {
  const issues: UIIssue[] = []
  let issueId = 0

  const generateId = () => `issue-${++issueId}`

  const visibleElements = elements.filter((el) => el.visible !== false)

  if (visibleElements.length === 0) {
    return issues
  }

  // 1. Contrast — check text against its actual background, not always white
  if (config.checkContrast) {
    visibleElements.forEach((el) => {
      if (el.type === 'text' && el.fill) {
        const bgColor = getBackgroundBehind(el, visibleElements)
        const ratio = getContrastRatio(el.fill, bgColor)
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

      // Fill vs stroke contrast (only meaningful when stroke is visible)
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

  // 2. Overlap — skip when one element is fully inside another (text in button,
  //    label in card, icon in container). Only flag genuinely unintended overlaps
  //    between sibling elements at the same level.
  if (config.checkSpacing) {
    visibleElements.forEach((el1, i) => {
      visibleElements.slice(i + 1).forEach((el2) => {
        if (
          elementsOverlap(el1, el2) &&
          !elementContains(el1, el2) &&
          !elementContains(el2, el1)
        ) {
          issues.push({
            id: generateId(),
            type: 'spacing',
            severity: 'warning',
            message: `"${el1.name}" and "${el2.name}" are overlapping`,
            suggestion: 'These elements overlap without one containing the other. Check if this is intentional or adjust their positions.',
            elementIds: [el1.id, el2.id],
            position: { x: el1.x, y: el1.y },
          })
        }
      })
    })

    // Exclude elements fully contained within another (text inside cards, labels inside buttons)
    // — their positions create phantom gaps that don't reflect real layout spacing
    const topLevelVisible = visibleElements.filter(
      el => !visibleElements.some(other => other.id !== el.id && elementContains(other, el))
    )

    // Horizontal spacing consistency
    const sortedByX = [...topLevelVisible].sort((a, b) => a.x - b.x)
    const horizontalGaps: number[] = []
    for (let i = 1; i < sortedByX.length; i++) {
      const gap = sortedByX[i].x - (sortedByX[i - 1].x + sortedByX[i - 1].width)
      if (gap > 0 && gap < 200) horizontalGaps.push(gap)
    }
    if (horizontalGaps.length >= 2) {
      const avgH = horizontalGaps.reduce((a, b) => a + b, 0) / horizontalGaps.length
      if (horizontalGaps.some((g) => Math.abs(g - avgH) > 12)) {
        issues.push({
          id: generateId(),
          type: 'spacing',
          severity: 'info',
          message: 'Inconsistent horizontal spacing detected',
          suggestion: `Consider using consistent spacing (e.g., ${Math.round(avgH)}px) between elements.`,
          elementIds: topLevelVisible.map((e) => e.id),
        })
      }
    }

    // Vertical spacing consistency — catches stacked layouts with uneven gaps
    const sortedByY = [...topLevelVisible].sort((a, b) => a.y - b.y)
    const verticalGaps: number[] = []
    for (let i = 1; i < sortedByY.length; i++) {
      const gap = sortedByY[i].y - (sortedByY[i - 1].y + sortedByY[i - 1].height)
      if (gap > 0 && gap < 200) verticalGaps.push(gap)
    }
    if (verticalGaps.length >= 2) {
      const avgV = verticalGaps.reduce((a, b) => a + b, 0) / verticalGaps.length
      if (verticalGaps.some((g) => Math.abs(g - avgV) > 12)) {
        issues.push({
          id: generateId(),
          type: 'spacing',
          severity: 'info',
          message: 'Inconsistent vertical spacing detected',
          suggestion: `Consider using consistent vertical gaps (e.g., ${Math.round(avgV)}px) between elements.`,
          elementIds: topLevelVisible.map((e) => e.id),
        })
      }
    }
  }

  // 3. Alignment near-miss — tightened to 2px so only very obvious off-by-one
  //    mistakes are flagged, not normal design variance
  if (config.checkAlignment) {
    const xPositions = visibleElements.map((el) => el.x)
    xPositions.forEach((x1, i) => {
      xPositions.slice(i + 1).forEach((x2, j) => {
        const diff = Math.abs(x1 - x2)
        if (diff > 0 && diff <= 2) {
          issues.push({
            id: generateId(),
            type: 'alignment',
            severity: 'info',
            message: `"${visibleElements[i].name}" and "${visibleElements[i + j + 1].name}" are almost aligned`,
            suggestion: `Left edges are ${diff}px apart. Align them exactly for a cleaner look.`,
            elementIds: [visibleElements[i].id, visibleElements[i + j + 1].id],
          })
        }
      })
    })
  }

  // 4. Typography — raise font-size count limit to 5 (heading/subheading/body/caption/label
  //    is a normal UI scale and should not be flagged)
  if (config.checkTypography) {
    const textElements = visibleElements.filter((el) => el.type === 'text')

    textElements.forEach((el) => {
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

    const fontSizes = [...new Set(textElements.map((el) => el.fontSize).filter(Boolean))]
    if (fontSizes.length > 5) {
      issues.push({
        id: generateId(),
        type: 'typography',
        severity: 'info',
        message: 'Too many font sizes used',
        suggestion: `You're using ${fontSizes.length} different font sizes. Consider limiting to 4-5 sizes for a clear visual hierarchy.`,
        elementIds: textElements.map((e) => e.id),
      })
    }
  }

  // 5. Touch targets — only flag interactive element types (rectangles, circles, frames).
  //    Text labels, lines, arrows, and decorative shapes are excluded.
  if (config.checkAccessibility) {
    visibleElements.forEach((el) => {
      if (!INTERACTIVE_TYPES.has(el.type)) return
      if (el.width < MIN_TOUCH_TARGET || el.height < MIN_TOUCH_TARGET) {
        issues.push({
          id: generateId(),
          type: 'accessibility',
          severity: el.width < 30 || el.height < 30 ? 'error' : 'warning',
          message: `"${el.name}" may be too small for touch`,
          suggestion: `Size is ${Math.round(el.width)}x${Math.round(el.height)}px. Interactive elements should be at least ${MIN_TOUCH_TARGET}x${MIN_TOUCH_TARGET}px.`,
          elementIds: [el.id],
          position: { x: el.x, y: el.y },
        })
      }
    })
  }

  // 6. Color — flag excessive palette size (>7) but drop the "mixed harmony" noise.
  //    Real UI designs naturally use a primary + neutral + semantic palette which
  //    always reads as "mixed" and should not be penalised.
  if (config.checkColorHarmony) {
    const colors = [...new Set(visibleElements.map((el) => el.fill).filter(Boolean))]
    if (colors.length > 7) {
      issues.push({
        id: generateId(),
        type: 'color',
        severity: 'warning',
        message: 'Too many colors in use',
        suggestion: `You're using ${colors.length} different colors. Consider limiting to 5-7 colors for visual cohesion.`,
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

// calc score
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

// make summary string
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

// Resolve every element's position to absolute canvas coordinates by walking
// up the parent chain. Child elements store frame-relative x/y, so all
// geometry checks (overlap, alignment, backend filtering) must use this.
export function resolveToAbsolute(elements: CanvasElement[]): CanvasElement[] {
  const map = new Map(elements.map((el) => [el.id, el]))

  function absPos(el: CanvasElement): { x: number; y: number } {
    if (!el.parentId) return { x: el.x, y: el.y }
    const parent = map.get(el.parentId)
    if (!parent) return { x: el.x, y: el.y }
    const p = absPos(parent)
    return { x: el.x + p.x, y: el.y + p.y }
  }

  return elements.map((el) => {
    const { x, y } = absPos(el)
    return { ...el, x, y }
  })
}

// This function handles the connection to our Python FastAPI backend
// It sends the canvas elements over to be processed by the Vision-Graph Transformer (ViGT) model
export async function analyzeDesignWithAI(elements: CanvasElement[]) {
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://127.0.0.1:8001";

  // Resolve all elements to absolute canvas coordinates first so frame-parented
  // children (which store frame-relative x/y) are handled correctly.
  const absElements = resolveToAbsolute(elements)

  // Find the largest frame on the canvas — treat it as the primary screen.
  const frames = absElements.filter((el) => el.type === 'frame' && el.visible !== false)
  const primaryFrame = frames.length > 0
    ? frames.reduce((best, f) => (f.width * f.height > best.width * best.height ? f : best))
    : null

  let frameWidth = 390
  let frameHeight = 844
  let payload: CanvasElement[]

  if (primaryFrame) {
    frameWidth  = primaryFrame.width
    frameHeight = primaryFrame.height

    // Keep elements whose absolute centre falls inside the primary frame,
    // then convert to frame-relative coords (required by backend preprocessing).
    payload = absElements
      .filter((el) => {
        if (el.id === primaryFrame.id || el.visible === false) return false
        const cx = el.x + el.width  / 2
        const cy = el.y + el.height / 2
        return (
          cx >= primaryFrame.x &&
          cx <= primaryFrame.x + frameWidth &&
          cy >= primaryFrame.y &&
          cy <= primaryFrame.y + frameHeight
        )
      })
      .map((el) => ({
        ...el,
        x: el.x - primaryFrame.x,
        y: el.y - primaryFrame.y,
      }))
  } else {
    // No frame — send all visible elements with default mobile dimensions
    payload = absElements.filter((el) => el.visible !== false)
  }

  try {
    const res = await fetch(`${backendUrl}/api/analyze-ui`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ elements: payload, frame_width: frameWidth, frame_height: frameHeight }),
    })

    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`)
    }

    return await res.json()
  } catch (error) {
    console.error("AI Backend is unreachable. Ensure the FastAPI server is running on port 8001.", error)
    return null
  }
}
