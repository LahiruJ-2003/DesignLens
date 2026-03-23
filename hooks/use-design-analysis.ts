'use client'

import { useEffect, useCallback, useRef } from 'react'
import { useCanvasStore } from '@/lib/canvas-store'
import { analyzeDesign, analyzeDesignWithAI, calculateDesignScore, generateIssueSummary } from '@/lib/design-analyzer'


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
    
    // Ping Python PyTorch Backend
    const aiResponse = await analyzeDesignWithAI(elements)
    if (aiResponse) {
      // Merge local spatial heuristic issues with ML model output
      const localIssues = analyzeDesign(elements)
      setIssues([...(aiResponse.issues || []), ...localIssues])
      setMlScore(aiResponse.overall_score)
    } else {
      // Fallback
      const detectedIssues = analyzeDesign(elements)
      setIssues(detectedIssues)
      setMlScore(null)
    }
    
    setIsAnalyzing(false)
  }, [elements, setIssues, setIsAnalyzing, setMlScore])

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

  const score = mlScore !== null ? Math.round(mlScore) : 0
  const summary = generateIssueSummary(issues)

  return {
    issues,
    score,
    summary,
    runAnalysis,
    isAnalyzing,
    errorCount: issues.filter((i) => i.severity === 'error').length,
    warningCount: issues.filter((i) => i.severity === 'warning').length,
    infoCount: issues.filter((i) => i.severity === 'info').length,
  }
}
