'use client'

// This React hook is the bridge between the canvas and the analysis engine.
// It watches for changes to the canvas elements and automatically triggers
// both the local heuristic checks and the AI backend analysis.
// It uses a debounce so it doesn't spam the backend while the user is actively dragging.

import { useEffect, useCallback, useRef, useState } from 'react'
import { useCanvasStore } from '@/lib/canvas-store'
import { analyzeDesign, analyzeDesignWithAI, resolveToAbsolute, generateIssueSummary } from '@/lib/design-analyzer'
import { computeFinalScore } from '@/lib/scoring'
import type { ScoredResult } from '@/lib/scoring'


interface UseDesignAnalysisOptions {
  debounceMs?: number
  autoAnalyze?: boolean
}

export function useDesignAnalysis(options: UseDesignAnalysisOptions = {}) {
  const { debounceMs = 1000, autoAnalyze = true } = options

  const { elements, setIssues, isAnalyzing, setIsAnalyzing, issues, mlScore, setMlScore } = useCanvasStore()
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)

  // We store a hash of the last analysed state so we don't re-run the model
  // if the element list changed in a way that doesn't affect the score
  // (e.g. a text cursor moved but no position or color changed).
  const lastElementsRef = useRef<string>('')

  // True between when elements change (e.g. project load) and when the first
  // analysis for those elements completes. Prevents the badge from briefly
  // showing 100 while the debounce timer is still counting down.
  const [hasPendingAnalysis, setHasPendingAnalysis] = useState(false)

  const runAnalysis = useCallback(async () => {
    setIsAnalyzing(true)

    // Elements parented to a frame store frame-relative x/y coordinates.
    // We must convert everything to absolute canvas coordinates before analysing,
    // otherwise the overlap checks, alignment checks, and backend filtering all get wrong results.
    const absElements = resolveToAbsolute(elements)

    // Send elements to the Python ViGT backend for the AI spatial score.
    // If the backend is offline, analyzeDesignWithAI returns null and we fall back to local-only mode.
    const aiResponse = await analyzeDesignWithAI(elements)
    if (aiResponse) {
      // Backend responded — merge AI issues (from backend) with local heuristic issues
      const localIssues = analyzeDesign(absElements)
      setIssues([...(aiResponse.issues || []), ...localIssues])
      setMlScore(aiResponse.overall_score)
    } else {
      // Backend unreachable — run local heuristics only, score starts from 100
      const detectedIssues = analyzeDesign(absElements)
      setIssues(detectedIssues)
      setMlScore(null)
    }

    setIsAnalyzing(false)
    setHasPendingAnalysis(false)
  }, [elements, setIssues, setIsAnalyzing, setMlScore])

  // If the user clears the entire canvas, reset the score immediately.
  // Without this, the old score would linger until the debounce fires.
  useEffect(() => {
    if (elements.length === 0) {
      setIssues([])
      setMlScore(null)
    }
  }, [elements.length, setIssues, setMlScore])

  // Watch for element changes and schedule an analysis after the debounce delay.
  // We build a quick hash of the geometry/color/type fields — if nothing changed
  // (e.g. just selection state changed) we skip the analysis to avoid unnecessary API calls.
  useEffect(() => {
    if (!autoAnalyze) return

    const elementsHash = JSON.stringify(
      elements.map((e) => ({
        id: e.id,
        x: Math.round(e.x),
        y: Math.round(e.y),
        width: Math.round(e.width),
        height: Math.round(e.height),
        fill: e.fill,
        stroke: e.stroke,
        fontSize: e.fontSize,
        type: e.type,
        visible: e.visible,
      }))
    )

    if (elementsHash === lastElementsRef.current) return
    lastElementsRef.current = elementsHash
    setHasPendingAnalysis(true)

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }

    // Wait for the user to stop editing before running the analysis.
    // This avoids hammering the backend while shapes are being dragged.
    timeoutRef.current = setTimeout(runAnalysis, debounceMs)

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [elements, debounceMs, autoAnalyze, runAnalysis])

  // Combine the AI score and local penalties into a single scored result
  const scored: ScoredResult = computeFinalScore(mlScore, issues)
  const summary = generateIssueSummary(issues)

  return {
    issues,
    score: scored.finalScore,
    label: scored.label,
    colour: scored.colour,
    breakdown: scored.breakdown,
    summary,
    runAnalysis,
    isAnalyzing: isAnalyzing || hasPendingAnalysis,
    errorCount: scored.breakdown.errorCount,
    warningCount: scored.breakdown.warningCount,
    infoCount: scored.breakdown.infoCount,
  }
}
