import type { DesignProject } from './types'

/**
 * Export a design project as a JSON file
 */
export function exportProject(project: DesignProject) {
  if (!project) {
    console.error('No project to export')
    return
  }

  const projectData = {
    ...project,
    exportedAt: new Date().toISOString(),
    version: '1.0',
  }

  const dataStr = JSON.stringify(projectData, null, 2)
  const dataBlob = new Blob([dataStr], { type: 'application/json' })
  const url = URL.createObjectURL(dataBlob)
  
  const link = document.createElement('a')
  link.href = url
  link.download = `${project.name.replace(/\s+/g, '-')}-${Date.now()}.json`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

/**
 * Import a design project from a JSON file
 */
export function importProject(file: File): Promise<DesignProject> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string
        const projectData = JSON.parse(content)
        
        // Validate that it's a valid project file
        if (!projectData.id || !projectData.name || !Array.isArray(projectData.elements)) {
          throw new Error('Invalid project file format')
        }

        // Ensure dates are proper Date objects
        if (typeof projectData.createdAt === 'string') {
          projectData.createdAt = new Date(projectData.createdAt)
        }
        if (typeof projectData.updatedAt === 'string') {
          projectData.updatedAt = new Date(projectData.updatedAt)
        }

        resolve(projectData as DesignProject)
      } catch (error) {
        reject(new Error(`Failed to import project: ${error instanceof Error ? error.message : 'Unknown error'}`))
      }
    }

    reader.onerror = () => {
      reject(new Error('Failed to read file'))
    }

    reader.readAsText(file)
  })
}

/**
 * Create a download link for project backup
 */
export function downloadProjectBackup(projects: DesignProject[]) {
  const backup = {
    backup: true,
    version: '1.0',
    exportedAt: new Date().toISOString(),
    projectCount: projects.length,
    projects: projects,
  }

  const dataStr = JSON.stringify(backup, null, 2)
  const dataBlob = new Blob([dataStr], { type: 'application/json' })
  const url = URL.createObjectURL(dataBlob)
  
  const link = document.createElement('a')
  link.href = url
  link.download = `designlens-backup-${Date.now()}.json`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}
