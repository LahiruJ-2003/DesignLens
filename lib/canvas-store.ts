import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { CanvasElement, Layer, ToolType, UIIssue, ChatMessage, DesignProject } from './types'

interface CanvasState {
  // Project
  currentProject: DesignProject | null
  projects: DesignProject[]
  
  // Canvas
  elements: CanvasElement[]
  selectedIds: string[]
  layers: Layer[]
  zoom: number
  panOffset: { x: number; y: number }
  
  // Tools
  activeTool: ToolType
  activeColor: string
  activeStroke: string
  activeStrokeWidth: number
  
  // AI
  issues: UIIssue[]
  chatMessages: ChatMessage[]
  isAnalyzing: boolean
  
  // UI
  showGrid: boolean
  showRulers: boolean
  showIssueHighlights: boolean
  
  // Actions
  setActiveTool: (tool: ToolType) => void
  setActiveColor: (color: string) => void
  setActiveStroke: (stroke: string) => void
  setActiveStrokeWidth: (width: number) => void
  
  addElement: (element: CanvasElement) => void
  updateElement: (id: string, updates: Partial<CanvasElement>) => void
  deleteElement: (id: string) => void
  duplicateElement: (id: string) => void
  
  selectElement: (id: string, addToSelection?: boolean) => void
  deselectAll: () => void
  selectAll: () => void
  
  setZoom: (zoom: number) => void
  setPanOffset: (offset: { x: number; y: number }) => void
  
  setIssues: (issues: UIIssue[]) => void
  addChatMessage: (message: ChatMessage) => void
  clearChat: () => void
  setIsAnalyzing: (analyzing: boolean) => void
  
  toggleGrid: () => void
  toggleRulers: () => void
  toggleIssueHighlights: () => void
  
  // Project management
  createProject: (name: string) => void
  saveProject: () => void
  loadProject: (id: string) => void
  deleteProject: (id: string) => void
  
  // Layer management
  addLayer: (elementId: string, name: string) => void
  toggleLayerVisibility: (id: string) => void
  toggleLayerLock: (id: string) => void
  reorderLayers: (fromIndex: number, toIndex: number) => void
}

const generateId = () => Math.random().toString(36).substring(2, 15)

export const useCanvasStore = create<CanvasState>()(
  persist(
    (set, get) => ({
      // Initial state
      currentProject: null,
      projects: [],
      elements: [],
      selectedIds: [],
      layers: [],
      zoom: 1,
      panOffset: { x: 0, y: 0 },
      activeTool: 'select',
      activeColor: '#3B82F6',
      activeStroke: '#1E40AF',
      activeStrokeWidth: 2,
      issues: [],
      chatMessages: [],
      isAnalyzing: false,
      showGrid: true,
      showRulers: true,
      showIssueHighlights: true,
      
      // Tool actions
      setActiveTool: (tool) => set({ activeTool: tool }),
      setActiveColor: (color) => set({ activeColor: color }),
      setActiveStroke: (stroke) => set({ activeStroke: stroke }),
      setActiveStrokeWidth: (width) => set({ activeStrokeWidth: width }),
      
      // Element actions
      addElement: (element) => {
        set((state) => {
          const newLayer: Layer = {
            id: generateId(),
            name: element.name,
            visible: true,
            locked: false,
            elementId: element.id,
          }
          return {
            elements: [...state.elements, element],
            layers: [newLayer, ...state.layers],
          }
        })
      },
      
      updateElement: (id, updates) => {
        set((state) => ({
          elements: state.elements.map((el) =>
            el.id === id ? { ...el, ...updates } : el
          ),
        }))
      },
      
      deleteElement: (id) => {
        set((state) => ({
          elements: state.elements.filter((el) => el.id !== id),
          layers: state.layers.filter((l) => l.elementId !== id),
          selectedIds: state.selectedIds.filter((sid) => sid !== id),
        }))
      },
      
      duplicateElement: (id) => {
        const state = get()
        const element = state.elements.find((el) => el.id === id)
        if (element) {
          const newElement: CanvasElement = {
            ...element,
            id: generateId(),
            x: element.x + 20,
            y: element.y + 20,
            name: `${element.name} copy`,
          }
          get().addElement(newElement)
          set({ selectedIds: [newElement.id] })
        }
      },
      
      // Selection actions
      selectElement: (id, addToSelection = false) => {
        set((state) => ({
          selectedIds: addToSelection
            ? state.selectedIds.includes(id)
              ? state.selectedIds.filter((sid) => sid !== id)
              : [...state.selectedIds, id]
            : [id],
        }))
      },
      
      deselectAll: () => set({ selectedIds: [] }),
      
      selectAll: () => {
        set((state) => ({
          selectedIds: state.elements.map((el) => el.id),
        }))
      },
      
      // Viewport actions
      setZoom: (zoom) => set({ zoom: Math.max(0.1, Math.min(5, zoom)) }),
      setPanOffset: (offset) => set({ panOffset: offset }),
      
      // AI actions
      setIssues: (issues) => set({ issues }),
      addChatMessage: (message) => {
        set((state) => ({
          chatMessages: [...state.chatMessages, message],
        }))
      },
      clearChat: () => set({ chatMessages: [] }),
      setIsAnalyzing: (analyzing) => set({ isAnalyzing: analyzing }),
      
      // UI toggles
      toggleGrid: () => set((state) => ({ showGrid: !state.showGrid })),
      toggleRulers: () => set((state) => ({ showRulers: !state.showRulers })),
      toggleIssueHighlights: () => set((state) => ({ showIssueHighlights: !state.showIssueHighlights })),
      
      // Project management
      createProject: (name) => {
        const project: DesignProject = {
          id: generateId(),
          name,
          elements: [],
          layers: [],
          canvasWidth: 1920,
          canvasHeight: 1080,
          createdAt: new Date(),
          updatedAt: new Date(),
        }
        set((state) => ({
          projects: [...state.projects, project],
          currentProject: project,
          elements: [],
          layers: [],
          selectedIds: [],
          chatMessages: [],
          issues: [],
        }))
      },
      
      saveProject: () => {
        const state = get()
        if (state.currentProject) {
          const updatedProject: DesignProject = {
            ...state.currentProject,
            elements: state.elements,
            layers: state.layers,
            updatedAt: new Date(),
          }
          set((state) => ({
            currentProject: updatedProject,
            projects: state.projects.map((p) =>
              p.id === updatedProject.id ? updatedProject : p
            ),
          }))
        }
      },
      
      loadProject: (id) => {
        const state = get()
        const project = state.projects.find((p) => p.id === id)
        if (project) {
          set({
            currentProject: project,
            elements: project.elements,
            layers: project.layers,
            selectedIds: [],
            chatMessages: [],
            issues: [],
          })
        }
      },
      
      deleteProject: (id) => {
        set((state) => ({
          projects: state.projects.filter((p) => p.id !== id),
          currentProject: state.currentProject?.id === id ? null : state.currentProject,
        }))
      },
      
      // Layer management
      addLayer: (elementId, name) => {
        const newLayer: Layer = {
          id: generateId(),
          name,
          visible: true,
          locked: false,
          elementId,
        }
        set((state) => ({
          layers: [newLayer, ...state.layers],
        }))
      },
      
      toggleLayerVisibility: (id) => {
        set((state) => {
          const layer = state.layers.find((l) => l.id === id)
          if (layer) {
            return {
              layers: state.layers.map((l) =>
                l.id === id ? { ...l, visible: !l.visible } : l
              ),
              elements: state.elements.map((el) =>
                el.id === layer.elementId ? { ...el, visible: !layer.visible } : el
              ),
            }
          }
          return state
        })
      },
      
      toggleLayerLock: (id) => {
        set((state) => {
          const layer = state.layers.find((l) => l.id === id)
          if (layer) {
            return {
              layers: state.layers.map((l) =>
                l.id === id ? { ...l, locked: !l.locked } : l
              ),
              elements: state.elements.map((el) =>
                el.id === layer.elementId ? { ...el, locked: !layer.locked } : el
              ),
            }
          }
          return state
        })
      },
      
      reorderLayers: (fromIndex, toIndex) => {
        set((state) => {
          const newLayers = [...state.layers]
          const [removed] = newLayers.splice(fromIndex, 1)
          newLayers.splice(toIndex, 0, removed)
          return { layers: newLayers }
        })
      },
    }),
    {
      name: 'designlens-storage',
      partialize: (state) => ({
        projects: state.projects,
        showGrid: state.showGrid,
        showRulers: state.showRulers,
        showIssueHighlights: state.showIssueHighlights,
      }),
    }
  )
)
