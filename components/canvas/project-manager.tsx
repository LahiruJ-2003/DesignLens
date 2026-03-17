'use client'

import React from "react"

import { useState, useRef, useEffect } from 'react'
import { useCanvasStore } from '@/lib/canvas-store'
import { exportProject, importProject } from '@/lib/export-import'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { FolderOpen, Plus, ChevronDown, Trash2, FileText, Save, Pencil, Check, X, Download, Upload } from 'lucide-react'

export function ProjectManager() {
  const [isNewProjectOpen, setIsNewProjectOpen] = useState(false)
  const [newProjectName, setNewProjectName] = useState('')
  const [isEditingName, setIsEditingName] = useState(false)
  const [editedName, setEditedName] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  const {
    currentProject,
    projects,
    createProject,
    loadProject,
    deleteProject,
    saveProject,
    renameProject,
    importProject: importProjectToStore,
  } = useCanvasStore()

  useEffect(() => {
    if (isEditingName && inputRef.current) {
      inputRef.current.focus()
      inputRef.current.select()
    }
  }, [isEditingName])

  const handleCreateProject = () => {
    if (newProjectName.trim()) {
      createProject(newProjectName.trim())
      setNewProjectName('')
      setIsNewProjectOpen(false)
    }
  }

  const handleStartEditing = () => {
    if (currentProject) {
      setEditedName(currentProject.name)
      setIsEditingName(true)
    }
  }

  const handleSaveRename = () => {
    if (currentProject && editedName.trim()) {
      renameProject(currentProject.id, editedName.trim())
    }
    setIsEditingName(false)
  }

  const handleCancelRename = () => {
    setIsEditingName(false)
    setEditedName('')
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSaveRename()
    } else if (e.key === 'Escape') {
      handleCancelRename()
    }
  }

  const handleExportProject = () => {
    if (currentProject) {
      exportProject(currentProject)
    }
  }

  const handleImportClick = () => {
    fileInputRef.current?.click()
  }

  const handleFileImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) {
      console.log('No file selected')
      return
    }

    try {
      console.log('Starting import for file:', file.name)
      const importedProject = await importProject(file)
      console.log('Import successful, adding to store:', importedProject)
      importProjectToStore(importedProject)
      console.log('Project added to store')
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
      alert('Project imported successfully!')
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error'
      console.error('Import failed:', errorMsg)
      alert(`Failed to import project: ${errorMsg}`)
    }
  }

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  return (
    <div className="flex items-center gap-2">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm" className="h-8 gap-2 px-3">
            <FolderOpen className="h-4 w-4" />
            {isEditingName ? (
              <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                <Input
                  ref={inputRef}
                  value={editedName}
                  onChange={(e) => setEditedName(e.target.value)}
                  onKeyDown={handleKeyDown}
                  onBlur={handleSaveRename}
                  className="h-6 w-32 text-xs py-0 px-2"
                />
                <div
                  className="h-5 w-5 p-0 inline-flex items-center justify-center rounded hover:bg-muted cursor-pointer"
                  onClick={(e) => {
                    e.stopPropagation()
                    handleSaveRename()
                  }}
                  title="Save"
                >
                  <Check className="h-3 w-3 text-success" />
                </div>
                <div
                  className="h-5 w-5 p-0 inline-flex items-center justify-center rounded hover:bg-muted cursor-pointer"
                  onClick={(e) => {
                    e.stopPropagation()
                    handleCancelRename()
                  }}
                  title="Cancel"
                >
                  <X className="h-3 w-3 text-destructive" />
                </div>
              </div>
            ) : (
              <>
                <span 
                  className="max-w-32 truncate"
                  onDoubleClick={(e) => {
                    e.stopPropagation()
                    handleStartEditing()
                  }}
                >
                  {currentProject?.name || 'Untitled Design'}
                </span>
                {currentProject && (
                  <div
                    className="h-5 w-5 p-0 opacity-0 group-hover:opacity-100 inline-flex items-center justify-center rounded hover:bg-muted cursor-pointer"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleStartEditing()
                    }}
                    title="Edit name"
                  >
                    <Pencil className="h-3 w-3" />
                  </div>
                )}
              </>
            )}
            <ChevronDown className="h-3 w-3 opacity-50" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-64">
          <Dialog open={isNewProjectOpen} onOpenChange={setIsNewProjectOpen}>
            <DialogTrigger asChild>
              <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                <Plus className="h-4 w-4 mr-2" />
                New Project
              </DropdownMenuItem>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Project</DialogTitle>
                <DialogDescription>
                  Give your project a name to get started.
                </DialogDescription>
              </DialogHeader>
              <div className="py-4">
                <Input
                  value={newProjectName}
                  onChange={(e) => setNewProjectName(e.target.value)}
                  placeholder="Project name"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleCreateProject()
                  }}
                />
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsNewProjectOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreateProject} disabled={!newProjectName.trim()}>
                  Create Project
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          
          {currentProject && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem onSelect={handleStartEditing}>
                <Pencil className="h-4 w-4 mr-2" />
                Rename Project
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={handleExportProject}>
                <Download className="h-4 w-4 mr-2" />
                Export Project
              </DropdownMenuItem>
            </>
          )}

          <DropdownMenuSeparator />
          <DropdownMenuItem onSelect={handleImportClick}>
            <Upload className="h-4 w-4 mr-2" />
            Import Project
          </DropdownMenuItem>
          
          {projects.length > 0 && (
            <>
              <DropdownMenuSeparator />
              <div className="px-2 py-1.5 text-xs font-medium text-muted-foreground">
                Recent Projects
              </div>
              {projects.slice(0, 10).map((project) => (
                <div
                  key={project.id}
                  className={cn(
                    'flex items-center justify-between px-2 py-1.5 rounded cursor-pointer hover:bg-accent group',
                    currentProject?.id === project.id && 'bg-accent'
                  )}
                  onClick={() => loadProject(project.id)}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <FileText className="h-4 w-4 shrink-0" />
                    <span className="truncate text-sm">{project.name}</span>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <span className="text-[10px] text-muted-foreground">
                      {formatDate(project.updatedAt)}
                    </span>
                    <button
                      type="button"
                      className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 hover:text-destructive inline-flex items-center justify-center rounded hover:bg-muted/50 transition-opacity"
                      onClick={(e) => {
                        e.stopPropagation()
                        deleteProject(project.id)
                      }}
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                </div>
              ))}
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      {currentProject && (
        <>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 gap-2"
            onClick={saveProject}
          >
            <Save className="h-4 w-4" />
            <span className="hidden sm:inline">Save</span>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 gap-2"
            onClick={handleExportProject}
            title="Export project as JSON"
          >
            <Download className="h-4 w-4" />
            <span className="hidden sm:inline">Export</span>
          </Button>
        </>
      )}

      {/* Hidden file input for project import - placed outside dropdown */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".json"
        style={{ display: 'none' }}
        onChange={handleFileImport}
        aria-label="Import project file"
      />
    </div>
  )
}
