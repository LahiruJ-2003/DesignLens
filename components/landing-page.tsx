'use client'

import { useState } from 'react'
import { useCanvasStore } from '@/lib/canvas-store'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Sparkles,
  Eye,
  Palette,
  Type,
  Grid3X3,
  Accessibility,
  ArrowRight,
  Play,
  FileText,
  Trash2,
} from 'lucide-react'

interface LandingPageProps {
  onStartDesigning: () => void
}

export function LandingPage({ onStartDesigning }: LandingPageProps) {
  const [projectName, setProjectName] = useState('')
  const { projects, createProject, loadProject, deleteProject } = useCanvasStore()

  const handleCreateProject = () => {
    const name = projectName.trim() || 'Untitled Design'
    createProject(name)
    setProjectName('')
    onStartDesigning()
  }

  const handleLoadProject = (id: string) => {
    loadProject(id)
    onStartDesigning()
  }

  const features = [
    {
      icon: <Eye className="h-5 w-5" />,
      title: 'Real-time Analysis',
      description: 'Get instant feedback on your designs as you create them',
    },
    {
      icon: <Palette className="h-5 w-5" />,
      title: 'Color Contrast',
      description: 'WCAG-compliant color contrast checking for accessibility',
    },
    {
      icon: <Type className="h-5 w-5" />,
      title: 'Typography',
      description: 'Ensure readable font sizes and proper text hierarchy',
    },
    {
      icon: <Grid3X3 className="h-5 w-5" />,
      title: 'Spacing & Alignment',
      description: 'Detect inconsistent spacing and misaligned elements',
    },
    {
      icon: <Accessibility className="h-5 w-5" />,
      title: 'Accessibility',
      description: 'Check touch targets and ARIA compliance',
    },
    {
      icon: <Sparkles className="h-5 w-5" />,
      title: 'AI Suggestions',
      description: 'Get intelligent recommendations to improve your design',
    },
  ]

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent" />
        <div className="relative max-w-6xl mx-auto px-4 py-16 sm:py-24">
          <div className="text-center">
            <div className="flex items-center justify-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center">
                <Sparkles className="h-6 w-6 text-primary-foreground" />
              </div>
              <h1 className="text-4xl sm:text-5xl font-bold text-foreground">DesignLens</h1>
            </div>
            <p className="text-xl sm:text-2xl text-muted-foreground max-w-2xl mx-auto mb-8 text-balance">
              AI-powered design canvas that analyzes your UI/UX in real-time and provides actionable suggestions
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 max-w-md mx-auto mb-8">
              <Input
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                placeholder="Enter project name..."
                className="h-12 text-base"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleCreateProject()
                }}
              />
              <Button 
                size="lg" 
                className="h-12 px-8 gap-2 w-full sm:w-auto"
                onClick={handleCreateProject}
              >
                Start Designing
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>

            <p className="text-sm text-muted-foreground">
              No account needed. Your designs are saved locally.
            </p>
          </div>
        </div>
      </div>

      {/* Features Grid */}
      <div className="max-w-6xl mx-auto px-4 py-16">
        <h2 className="text-2xl font-bold text-center text-foreground mb-12">
          What DesignLens Checks
        </h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <Card key={index} className="bg-card border-border">
              <CardHeader>
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary mb-2">
                  {feature.icon}
                </div>
                <CardTitle className="text-lg">{feature.title}</CardTitle>
                <CardDescription>{feature.description}</CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>
      </div>

      {/* Recent Projects */}
      {projects.length > 0 && (
        <div className="max-w-6xl mx-auto px-4 py-16 border-t border-border">
          <h2 className="text-2xl font-bold text-foreground mb-8">Recent Projects</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {projects.slice(0, 6).map((project) => (
              <Card 
                key={project.id} 
                className="bg-card border-border hover:border-primary/50 transition-colors cursor-pointer group"
                onClick={() => handleLoadProject(project.id)}
              >
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <FileText className="h-5 w-5 text-muted-foreground" />
                      <CardTitle className="text-base truncate">{project.name}</CardTitle>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 w-7 p-0 opacity-0 group-hover:opacity-100 transition-opacity hover:text-destructive"
                      onClick={(e) => {
                        e.stopPropagation()
                        deleteProject(project.id)
                      }}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span>{project.elements.length} element{project.elements.length !== 1 ? 's' : ''}</span>
                    <span>
                      {new Date(project.updatedAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                      })}
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Demo Section */}
      <div className="max-w-6xl mx-auto px-4 py-16 border-t border-border">
        <div className="text-center">
          <Badge variant="outline" className="mb-4">Final Year Project</Badge>
          <h2 className="text-2xl font-bold text-foreground mb-4">
            AI-Powered Design Feedback
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto mb-8">
            DesignLens uses AI to scan your canvas and identify UI/UX issues like poor color contrast, 
            inconsistent spacing, small touch targets, and typography problems. Get real-time 
            suggestions to create better designs.
          </p>
          <Button variant="outline" size="lg" className="gap-2 bg-transparent" onClick={handleCreateProject}>
            <Play className="h-4 w-4" />
            Try It Now
          </Button>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-border py-8">
        <div className="max-w-6xl mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>Built as a Final Year Project</p>
          <p className="mt-1">Powered by AI for intelligent design analysis</p>
        </div>
      </footer>
    </div>
  )
}
