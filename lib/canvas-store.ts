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
  mlScore: number | null
  
  
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
  updateElements: (updates: Record<string, Partial<CanvasElement>>) => void
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
  setMlScore: (score: number | null) => void
  
  
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
  clearCurrentProject: () => void
  
  // Layer management
  addLayer: (elementId: string, name: string) => void
  toggleLayerVisibility: (id: string) => void
  toggleLayerLock: (id: string) => void
  reorderLayers: (fromIndex: number, toIndex: number) => void
  reorderElements: (elementId: string, targetId: string, position: 'before' | 'after') => void
  renameLayer: (id: string, name: string) => void
  
  // Frame management
  getFrameChildren: (frameId: string) => CanvasElement[]
  moveFrameWithChildren: (frameId: string, dx: number, dy: number) => void
  setElementParent: (elementId: string, parentId: string | null) => void
  getChildElements: (parentId: string) => CanvasElement[]
  
  // Advanced Layout Actions
  alignElements: (type: 'left' | 'center' | 'right' | 'top' | 'middle' | 'bottom') => void
  distributeElements: (type: 'horizontal' | 'vertical') => void
  tidyUpElements: () => void
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
      activeStrokeWidth: 0,
      issues: [],
      chatMessages: [],
      isAnalyzing: false,
      mlScore: null,
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
        state.pushHistory()
        
        set((state) => ({
          elements: [...state.elements, element],
          layers: [
            {
              id: generateId(),
              elementId: element.id,
              name: element.name,
              visible: true,
              locked: false,
            },
            ...state.layers,
          ],
          activeTool: autoSelectTool ? 'select' : state.activeTool,
        }))
      },
      
      updateElement: (id, updates) => {
        set((state) => {
          const element = state.elements.find(el => el.id === id)
          if (!element) return state

          // Handle Frame constraints if resizing
          let childUpdates: { id: string, updates: Partial<CanvasElement> }[] = []
          
          if (element.type === 'frame' && (updates.width !== undefined || updates.height !== undefined)) {
            const dw = (updates.width ?? element.width) - element.width
            const dh = (updates.height ?? element.height) - element.height
            
            if (dw !== 0 || dh !== 0) {
              const children = state.elements.filter(el => el.parentId === id)
              children.forEach(child => {
                const cUpdates: Partial<CanvasElement> = {}
                const h = child.constraints?.horizontal || 'left'
                const v = child.constraints?.vertical || 'top'

                // Horizontal Constraints
                if (h === 'right') cUpdates.x = child.x + dw
                else if (h === 'center') cUpdates.x = child.x + dw / 2
                else if (h === 'left-right') cUpdates.width = (child.width ?? 0) + dw
                else if (h === 'scale') {
                  const relX = child.x / element.width
                  const relW = child.width / element.width
                  cUpdates.x = relX * (updates.width ?? element.width)
                  cUpdates.width = relW * (updates.width ?? element.width)
                }

                // Vertical Constraints
                if (v === 'bottom') cUpdates.y = child.y + dh
                else if (v === 'center') cUpdates.y = child.y + dh / 2
                else if (v === 'top-bottom') cUpdates.height = (child.height ?? 0) + dh
                else if (v === 'scale') {
                  const relY = child.y / element.height
                  const relH = child.height / element.height
                  cUpdates.y = relY * (updates.height ?? element.height)
                  cUpdates.height = relH * (updates.height ?? element.height)
                }

                if (Object.keys(cUpdates).length > 0) {
                  childUpdates.push({ id: child.id, updates: cUpdates })
                }
              })
            }
          }

          // Also update the layer name if element name is being updated
          const updatedLayers = updates.name
            ? state.layers.map((l) =>
                l.elementId === id ? { ...l, name: updates.name as string } : l
              )
            : state.layers
          
          return {
            elements: state.elements.map((el) => {
              if (el.id === id) return { ...el, ...updates }
              const childUpdate = childUpdates.find(cu => cu.id === el.id)
              if (childUpdate) return { ...el, ...childUpdate.updates }
              return el
            }),
            layers: updatedLayers,
          }
        })
      },
      
      updateElements: (elementUpdates) => {
        set((state) => {
          const newElements = state.elements.map((el) => {
            const update = elementUpdates[el.id]
            if (update) return { ...el, ...update }
            return el
          })
          
          const newLayers = state.layers.map((l) => {
            const update = elementUpdates[l.elementId]
            if (update && update.name) return { ...l, name: update.name }
            return l
          })
          
          return { elements: newElements, layers: newLayers }
        })
      },
      
      deleteElement: (id) => {
        const state = get()
        state.pushHistory()
        
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
          const newId = generateId()
          const newElement: CanvasElement = {
            ...element,
            id: newId,
            x: element.x + 20,
            y: element.y + 20,
            name: `${element.name} copy`,
          }
          get().addElement(newElement)
          set({ selectedIds: [newId] })
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
      setMlScore: (score) => set({ mlScore: score }),
      
      
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
          mlScore: null,
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
            mlScore: null,
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
          mlScore: null,
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
            const element = state.elements.find((el) => el.id === layer.elementId)
            const newVisibility = !layer.visible
            
            // Get all child elements if this is a frame
            const getChildIds = (elementId: string): string[] => {
              const children = state.elements.filter((el) => el.parentId === elementId)
              const allChildIds = children.map((child) => child.id)
              children.forEach((child) => {
                allChildIds.push(...getChildIds(child.id))
              })
              return allChildIds
            }
            
            const childElementIds = element?.type === 'frame' ? getChildIds(layer.elementId) : []
            
            return {
              layers: state.layers.map((l) => {
                // Toggle visibility of the main layer
                if (l.id === id) {
                  return { ...l, visible: newVisibility }
                }
                // Also toggle visibility of all child layers if parent is a frame
                if (childElementIds.includes(l.elementId)) {
                  return { ...l, visible: newVisibility }
                }
                return l
              }),
              elements: state.elements.map((el) => {
                // Toggle main element
                if (el.id === layer.elementId) {
                  return { ...el, visible: newVisibility }
                }
                // Toggle all children if parent is a frame
                if (childElementIds.includes(el.id)) {
                  return { ...el, visible: newVisibility }
                }
                return el
              }),
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
      
      clearCurrentProject: () => {
        set({
          currentProject: null,
          elements: [],
          layers: [],
          selectedIds: [],
          chatMessages: [],
          issues: [],
          mlScore: null,
          history: [{ elements: [], layers: [] }],
          historyIndex: 0,
        })
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
        const state = get()
        const element = state.elements.find(el => el.id === elementId)
        if (!element) return

        state.pushHistory()

        set((state) => {
          let newX = element.x
          let newY = element.y

          if (parentId) {
            const parent = state.elements.find(p => p.id === parentId)
            if (parent) {
              // Convert absolute to relative
              newX = element.x - parent.x
              newY = element.y - parent.y
            }
          } else if (element.parentId) {
            const oldParent = state.elements.find(p => p.id === element.parentId)
            if (oldParent) {
              // Convert relative to absolute
              newX = element.x + oldParent.x
              newY = element.y + oldParent.y
            }
          }

          return {
            elements: state.elements.map((el) =>
              el.id === elementId ? { ...el, parentId: parentId || undefined, x: newX, y: newY } : el
            ),
          }
        })
      },
      
      reorderElements: (elementId: string, targetId: string, position: 'before' | 'after') => {
        const state = get()
        state.pushHistory()
        
        set((state) => {
          // Reorder elements
          const elements = [...state.elements]
          const fromIdx = elements.findIndex(el => el.id === elementId)
          if (fromIdx === -1) return state
          
          const [element] = elements.splice(fromIdx, 1)
          const toIdx = elements.findIndex(el => el.id === targetId)
          
          if (toIdx === -1) {
            elements.push(element)
          } else {
            const insertIdx = position === 'after' ? toIdx + 1 : toIdx
            elements.splice(insertIdx, 0, element)
          }

          // Reorder layers list to match (Figma-style: top of list is top of stack)
          // Elements at the END of the array are TOP of the stack.
          // Layers at the BEGINNING of the list are TOP of the panel.
          // So they should be inverses.
          const newLayers = [...elements]
            .reverse() // Top element -> First layer
            .map(el => {
              const existingLayer = state.layers.find(l => l.elementId === el.id)
              return existingLayer || {
                id: generateId(),
                elementId: el.id,
                name: el.name,
                visible: true,
                locked: false
              }
            })
          
          return { elements, layers: newLayers }
        })
      },
      
      moveFrameWithChildren: (frameId, dx, dy) => {
        const { updateElement } = get()
        const frame = get().elements.find((el) => el.id === frameId)
        if (!frame || frame.type !== 'frame') return
        
        updateElement(frameId, {
          x: frame.x + dx,
          y: frame.y + dy,
        })
      },

      // Advanced Layout Actions
      alignElements: (type) => {
        const state = get()
        const selectedElements = state.elements.filter((el) => state.selectedIds.includes(el.id))
        if (selectedElements.length < 1) return

        state.pushHistory()

        let minX = Math.min(...selectedElements.map((el) => el.x))
        let maxX = Math.max(...selectedElements.map((el) => el.x + el.width))
        let minY = Math.min(...selectedElements.map((el) => el.y))
        let maxY = Math.max(...selectedElements.map((el) => el.y + el.height))
        
        // If single element, align relative to canvas or parent frame
        if (selectedElements.length === 1) {
          const el = selectedElements[0]
          const parent = el.parentId ? state.elements.find(p => p.id === el.parentId) : null
          const bounds = parent ? { x: 0, y: 0, width: parent.width, height: parent.height } : { x: 0, y: 0, width: 1920, height: 1080 }
          
          let updates: Partial<CanvasElement> = {}
          if (type === 'left') updates.x = bounds.x
          if (type === 'center') updates.x = bounds.x + (bounds.width - el.width) / 2
          if (type === 'right') updates.x = bounds.x + bounds.width - el.width
          if (type === 'top') updates.y = bounds.y
          if (type === 'middle') updates.y = bounds.y + (bounds.height - el.height) / 2
          if (type === 'bottom') updates.y = bounds.y + bounds.height - el.height
          
          get().updateElement(el.id, updates)
          return
        }

        // Multiple elements: align to selection bounds
        set((state) => ({
          elements: state.elements.map((el) => {
            if (!state.selectedIds.includes(el.id)) return el
            const updates: Partial<CanvasElement> = {}
            if (type === 'left') updates.x = minX
            if (type === 'center') updates.x = minX + (maxX - minX) / 2 - el.width / 2
            if (type === 'right') updates.x = maxX - el.width
            if (type === 'top') updates.y = minY
            if (type === 'middle') updates.y = minY + (maxY - minY) / 2 - el.height / 2
            if (type === 'bottom') updates.y = maxY - el.height
            return { ...el, ...updates }
          })
        }))
      },

      distributeElements: (type) => {
        const state = get()
        const selectedElements = [...state.elements]
          .filter((el) => state.selectedIds.includes(el.id))
          .sort((a, b) => type === 'horizontal' ? a.x - b.x : a.y - b.y)
          
        if (selectedElements.length < 3) return
        state.pushHistory()

        if (type === 'horizontal') {
          const first = selectedElements[0]
          const last = selectedElements[selectedElements.length - 1]
          const totalWidth = last.x - (first.x + first.width)
          const elementsWidth = selectedElements.slice(1, -1).reduce((acc, el) => acc + el.width, 0)
          const totalGap = (last.x) - (first.x + first.width)
          // Simplified distribute: equal gaps
          const totalElementsWidth = selectedElements.reduce((sum, el) => sum + el.width, 0)
          const range = (last.x + last.width) - first.x
          const gap = (range - totalElementsWidth) / (selectedElements.length - 1)
          
          let currentPos = first.x
          set((state) => ({
            elements: state.elements.map((el) => {
              const idx = selectedElements.findIndex(sel => sel.id === el.id)
              if (idx === -1) return el
              if (idx === 0) { currentPos = first.x + first.width + gap; return el; }
              const newX = currentPos
              currentPos += el.width + gap
              return { ...el, x: newX }
            })
          }))
        } else {
          const first = selectedElements[0]
          const last = selectedElements[selectedElements.length - 1]
          const totalElementsHeight = selectedElements.reduce((sum, el) => sum + el.height, 0)
          const range = (last.y + last.height) - first.y
          const gap = (range - totalElementsHeight) / (selectedElements.length - 1)
          
          let currentPos = first.y
          set((state) => ({
            elements: state.elements.map((el) => {
              const idx = selectedElements.findIndex(sel => sel.id === el.id)
              if (idx === -1) return el
              if (idx === 0) { currentPos = first.y + first.height + gap; return el; }
              const newY = currentPos
              currentPos += el.height + gap
              return { ...el, y: newY }
            })
          }))
        }
      },

      tidyUpElements: () => {
        const state = get()
        const selectedElements = state.elements.filter(el => state.selectedIds.includes(el.id))
        if (selectedElements.length < 2) return

        state.pushHistory()
        
        // Simple tidy up: sort by X then Y, and space evenly if they are in a "line"
        // or just apply equal spacing to the distribution.
        // For now, let's implement a "smart horizontal/vertical" hybrid
        const minX = Math.min(...selectedElements.map(el => el.x))
        const minY = Math.min(...selectedElements.map(el => el.y))
        const maxX = Math.max(...selectedElements.map(el => el.x + el.width))
        const maxY = Math.max(...selectedElements.map(el => el.y + el.height))
        
        const isMoreHorizontal = (maxX - minX) > (maxY - minY)
        
        if (isMoreHorizontal) {
          const sorted = [...selectedElements].sort((a, b) => a.x - b.x)
          const totalWidth = sorted.reduce((sum, el) => sum + el.width, 0)
          const gap = ( (maxX - minX) - totalWidth ) / (sorted.length - 1)
          
          let currentX = minX
          set((state) => ({
            elements: state.elements.map(el => {
              const sIdx = sorted.findIndex(s => s.id === el.id)
              if (sIdx === -1) return el
              const newEl = { ...el, x: currentX, y: minY } // Also align Y to top for tidy look
              currentX += el.width + gap
              return newEl
            })
          }))
        } else {
          const sorted = [...selectedElements].sort((a, b) => a.y - b.y)
          const totalHeight = sorted.reduce((sum, el) => sum + el.height, 0)
          const gap = ( (maxY - minY) - totalHeight ) / (sorted.length - 1)
          
          let currentY = minY
          set((state) => ({
            elements: state.elements.map(el => {
              const sIdx = sorted.findIndex(s => s.id === el.id)
              if (sIdx === -1) return el
              const newEl = { ...el, y: currentY, x: minX } // Also align X to left
              currentY += el.height + gap
              return newEl
            })
          }))
        }
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
