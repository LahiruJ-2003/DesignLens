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

const PENALTIES = { error: 15, warning: 8, info: 3 } as const

function getLabel(score: number): ScoreLabel {
  if (score >= 82) return 'Excellent'
  if (score >= 65) return 'Good'
  if (score >= 40) return 'Needs Work'
  if (score >= 20) return 'Poor'
  return 'Critical'
}

function getColour(label: ScoreLabel): ScoredResult['colour'] {
  switch (label) {
    case 'Excellent': return 'green'
    case 'Good':      return 'blue'
    case 'Needs Work': return 'yellow'
    case 'Poor':      return 'orange'
    case 'Critical':  return 'red'
  }
}

/**
 * Combines the ViGT spatial score with local issue penalties into a single
 * final score with a human-readable label and Tailwind colour token.
 *
 * When the backend is unreachable (mlScore === null) we start from 100 so
 * the local heuristics alone still produce a meaningful score.
 */
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
