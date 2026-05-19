// This file calculates the final score shown in the badge in the top bar.
// The final score = AI spatial score (from the Python backend) - issue penalties (from local heuristics).
// If the backend is offline, we start from 100 and only deduct for detected issues.
import type { UIIssue } from './types'

export type ScoreLabel = 'Excellent' | 'Good' | 'Needs Work' | 'Poor' | 'Critical'

export interface ScoreBreakdown {
  spatialScore: number
  penaltyDeducted: number
  issueCount: number
  errorCount: number
  warningCount: number
  infoCount: number
}

export interface ScoredResult {
  finalScore: number
  label: ScoreLabel
  colour: 'green' | 'blue' | 'yellow' | 'orange' | 'red'
  breakdown: ScoreBreakdown
}

// How many points each issue type deducts from the score.
// Errors are the most serious (-15) because they break accessibility rules.
// Warnings are moderate (-8) and suggestions are minor (-3).
// These values mean a design with 2 warnings still scores well (84-16=68 = Good).
const PENALTIES = { error: 15, warning: 8, info: 3 } as const

// Map a numeric score to a human-readable label.
// The thresholds were chosen so that the ViGT spatial score (~49 for structured layouts)
// with no issues lands in "Needs Work" — showing the tool is honest about imperfect designs.
// A layout with good colors and no accessibility issues can push into "Good" or above.
function getLabel(score: number): ScoreLabel {
  if (score >= 82) return 'Excellent'
  if (score >= 65) return 'Good'
  if (score >= 40) return 'Needs Work'
  if (score >= 20) return 'Poor'
  return 'Critical'
}

// Map the label to a Tailwind colour token so the badge changes colour automatically.
// Green = excellent, blue = good, yellow = needs work, orange = poor, red = critical.
function getColour(label: ScoreLabel): ScoredResult['colour'] {
  switch (label) {
    case 'Excellent': return 'green'
    case 'Good':      return 'blue'
    case 'Needs Work': return 'yellow'
    case 'Poor':      return 'orange'
    case 'Critical':  return 'red'
  }
}

// This is the main function that combines both scores into one final result.
// It is called by use-design-analysis.ts after every canvas change.
// mlScore is null when the backend is offline — in that case we use 100 as the starting point
// so the local heuristics still produce a useful score even without the AI.
export function computeFinalScore(
  mlScore: number | null,
  issues: UIIssue[],
): ScoredResult {
  const spatialScore = mlScore !== null ? mlScore : 100

  const errorCount   = issues.filter((i) => i.severity === 'error').length
  const warningCount = issues.filter((i) => i.severity === 'warning').length
  const infoCount    = issues.filter((i) => i.severity === 'info').length

  const penaltyDeducted =
    errorCount   * PENALTIES.error +
    warningCount * PENALTIES.warning +
    infoCount    * PENALTIES.info

  // Clamp to 0-100 so the score never goes negative or above 100
  const finalScore = Math.max(0, Math.min(100, Math.round(spatialScore - penaltyDeducted)))
  const label  = getLabel(finalScore)
  const colour = getColour(label)

  return {
    finalScore,
    label,
    colour,
    breakdown: {
      spatialScore: Math.round(spatialScore),
      penaltyDeducted,
      issueCount: issues.length,
      errorCount,
      warningCount,
      infoCount,
    },
  }
}
