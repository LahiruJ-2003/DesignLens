'use client'

import { useEffect, useCallback, useRef } from 'react'
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
  const lastElementsRef = useRef<string>('')

  const runAnalysis = useCallback(async () => {
    setIsAnalyzing(true)

    // Resolve all element positions to absolute canvas coords before any analysis.
    // Child elements (parented to a frame) store frame-relative x/y — without this
    // step the overlap/alignment checks and backend filter all produce wrong results.
    const absElements = resolveToAbsolute(elements)

    // Ping Python PyTorch Backend
    const aiResponse = await analyzeDesignWithAI(elements)
    if (aiResponse) {
      const localIssues = analyzeDesign(absElements)
      setIssues([...(aiResponse.issues || []), ...localIssues])
      setMlScore(aiResponse.overall_score)
    } else {
      // Backend unreachable — local heuristics only, start from 100
      const detectedIssues = analyzeDesign(absElements)
      setIssues(detectedIssues)
      setMlScore(null)
    }

    setIsAnalyzing(false)
  }, [elements, setIssues, setIsAnalyzing, setMlScore])

  // Reset score immediately when canvas is emptied — don't wait for debounce
  useEffect(() => {
    if (elements.length === 0) {
      setIssues([])
      setMlScore(null)
    }
  }, [elements.length, setIssues, setMlScore])

  // Debounced auto-analysis when elements change
  useEffect(() => {
    if (!autoAnalyze) return
    
    // Create a simple hash of elements to detect real changes
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
    
    // Only run if elements actually changed
    if (elementsHash === lastElementsRef.current) return
    lastElementsRef.current = elementsHash
    
    // Clear existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }
    
    // Set new debounced analysis
    timeoutRef.current = setTimeout(runAnalysis, debounceMs)
    
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [elements, debounceMs, autoAnalyze, runAnalysis])

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
    isAnalyzing,
    errorCount: scored.breakdown.errorCount,
    warningCount: scored.breakdown.warningCount,
    infoCount: scored.breakdown.infoCount,
  }
}
