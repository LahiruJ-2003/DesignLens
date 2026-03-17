import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { CanvasElement, Layer, ToolType, UIIssue, ChatMessage, DesignProject } from './types'

interface HistoryState {
  elements: CanvasElement[]
  layers: Layer[]
}

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
  
  // History for undo/redo
  history: HistoryState[]
  historyIndex: number
  
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
  editingTextId: string | null
  
  // Actions
  setActiveTool: (tool: ToolType) => void
  setActiveColor: (color: string) => void
  setActiveStroke: (stroke: string) => void
  setActiveStrokeWidth: (width: number) => void
  
  addElement: (element: CanvasElement, autoSelectTool?: boolean) => void
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
  setEditingTextId: (id: string | null) => void
  
  // History actions
  undo: () => void
  redo: () => void
  pushHistory: () => void
  canUndo: () => boolean
  canRedo: () => boolean
  
  // Project management
  createProject: (name: string) => void
  saveProject: () => void
  loadProject: (id: string) => void
  deleteProject: (id: string) => void
  importProject: (project: DesignProject) => void
  renameProject: (id: string, name: string) => void
  
  // Layer management
  addLayer: (elementId: string, name: string) => void
  toggleLayerVisibility: (id: string) => void
  toggleLayerLock: (id: string) => void
  reorderLayers: (fromIndex: number, toIndex: number) => void
  renameLayer: (id: string, name: string) => void
  
  // Frame management
  getFrameChildren: (frameId: string) => CanvasElement[]
  moveFrameWithChildren: (frameId: string, dx: number, dy: number) => void
  setElementParent: (elementId: string, parentId: string | null) => void
  getChildElements: (parentId: string) => CanvasElement[]
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
      history: [],
      historyIndex: -1,
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
      editingTextId: null,
      
      // Tool actions
      setActiveTool: (tool) => set({ activeTool: tool }),
      setActiveColor: (color) => set({ activeColor: color }),
      setActiveStroke: (stroke) => set({ activeStroke: stroke }),
      setActiveStrokeWidth: (width) => set({ activeStrokeWidth: width }),
      
      // Element actions
      addElement: (element, autoSelectTool = true) => {
        const state = get()
        // Push current state to history before making changes
        const newHistory = state.history.slice(0, state.historyIndex + 1)
        newHistory.push({ elements: state.elements, layers: state.layers })
        
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
            history: newHistory.slice(-50), // Keep last 50 states
            historyIndex: newHistory.length - 1,
            // Auto-switch to select tool after drawing
            activeTool: autoSelectTool ? 'select' : state.activeTool,
          }
        })
      },
      
      updateElement: (id, updates) => {
        set((state) => {
          // Also update the layer name if element name is being updated
          const updatedLayers = updates.name
            ? state.layers.map((l) =>
                l.elementId === id ? { ...l, name: updates.name as string } : l
              )
            : state.layers
          
          return {
            elements: state.elements.map((el) =>
              el.id === id ? { ...el, ...updates } : el
            ),
            layers: updatedLayers,
          }
        })
      },
      
      deleteElement: (id) => {
        const state = get()
        // Push current state to history
        const newHistory = state.history.slice(0, state.historyIndex + 1)
        newHistory.push({ elements: state.elements, layers: state.layers })
        
        set((state) => ({
          elements: state.elements.filter((el) => el.id !== id),
          layers: state.layers.filter((l) => l.elementId !== id),
          selectedIds: state.selectedIds.filter((sid) => sid !== id),
          history: newHistory.slice(-50),
          historyIndex: newHistory.length - 1,
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
      setEditingTextId: (id) => set({ editingTextId: id }),
      
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
          history: [{ elements: [], layers: [] }],
          historyIndex: 0,
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
            history: [{ elements: project.elements, layers: project.layers }],
            historyIndex: 0,
          })
        }
      },
      
      deleteProject: (id) => {
        set((state) => ({
          projects: state.projects.filter((p) => p.id !== id),
          currentProject: state.currentProject?.id === id ? null : state.currentProject,
        }))
      },

      importProject: (importedProject) => {
        // Generate a new ID for the imported project to avoid conflicts
        const newProject: DesignProject = {
          ...importedProject,
          id: generateId(),
          createdAt: new Date(),
          updatedAt: new Date(),
        }
        
        set((state) => ({
          projects: [...state.projects, newProject],
          currentProject: newProject,
          elements: importedProject.elements || [],
          layers: importedProject.layers || [],
          selectedIds: [],
          chatMessages: [],
          issues: [],
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
      
      renameLayer: (id, name) => {
        set((state) => {
          const layer = state.layers.find((l) => l.id === id)
          if (layer) {
            return {
              layers: state.layers.map((l) =>
                l.id === id ? { ...l, name } : l
              ),
              elements: state.elements.map((el) =>
                el.id === layer.elementId ? { ...el, name } : el
              ),
            }
          }
          return state
        })
      },
      
      // History actions
      undo: () => {
        const state = get()
        if (state.historyIndex > 0) {
          const newIndex = state.historyIndex - 1
          const prevState = state.history[newIndex]
          set({
            elements: prevState.elements,
            layers: prevState.layers,
            historyIndex: newIndex,
            selectedIds: [],
          })
        }
      },
      
      redo: () => {
        const state = get()
        if (state.historyIndex < state.history.length - 1) {
          const newIndex = state.historyIndex + 1
          const nextState = state.history[newIndex]
          set({
            elements: nextState.elements,
            layers: nextState.layers,
            historyIndex: newIndex,
            selectedIds: [],
          })
        }
      },
      
      pushHistory: () => {
        const state = get()
        // Slice to remove any redo states beyond current index
        const newHistory = state.history.slice(0, state.historyIndex + 1)
        // Add current state to history
        newHistory.push({ elements: state.elements, layers: state.layers })
        // Keep only last 50 states
        const trimmedHistory = newHistory.slice(-50)
        const newIndex = trimmedHistory.length - 1
        set({
          history: trimmedHistory,
          historyIndex: newIndex,
        })
      },
      
      canUndo: () => {
        const state = get()
        return state.historyIndex > 0
      },
      
      canRedo: () => {
        const state = get()
        return state.historyIndex < state.history.length - 1
      },
      
      // Project rename
      renameProject: (id, name) => {
        set((state) => ({
          projects: state.projects.map((p) =>
            p.id === id ? { ...p, name, updatedAt: new Date() } : p
          ),
          currentProject: state.currentProject?.id === id
            ? { ...state.currentProject, name, updatedAt: new Date() }
            : state.currentProject,
        }))
      },
      
      // Frame management - get all elements inside a frame (by parentId)
      getFrameChildren: (frameId) => {
        const state = get()
        return state.elements.filter((el) => el.parentId === frameId)
      },
      
      // Get all child elements recursively
      getChildElements: (parentId) => {
        const state = get()
        const directChildren = state.elements.filter((el) => el.parentId === parentId)
        const allChildren = [...directChildren]
        
        directChildren.forEach((child) => {
          const subChildren = get().getChildElements(child.id)
          allChildren.push(...subChildren)
        })
        
        return allChildren
      },
      
      // Set element's parent (or remove parent if null)
      setElementParent: (elementId, parentId) => {
        set((state) => ({
          elements: state.elements.map((el) =>
            el.id === elementId ? { ...el, parentId: parentId || undefined } : el
          ),
        }))
      },
      
      moveFrameWithChildren: (frameId, dx, dy) => {
        const state = get()
        const frame = state.elements.find((el) => el.id === frameId)
        if (!frame || frame.type !== 'frame') return
        
        const children = get().getFrameChildren(frameId)
        const childIds = children.map((c) => c.id)
        
        set((state) => ({
          elements: state.elements.map((el) => {
            if (el.id === frameId || childIds.includes(el.id)) {
              return { ...el, x: el.x + dx, y: el.y + dy }
            }
            return el
          }),
        }))
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
