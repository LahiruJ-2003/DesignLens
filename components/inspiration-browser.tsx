'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useCanvasStore } from '@/lib/canvas-store'
import { Search, ExternalLink } from 'lucide-react'
import Image from 'next/image'

interface DesignItem {
  id: string
  title: string
  image: string
  source: string
  category: string
}

interface InspirationBrowserProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

// Mock design data - in production, this would come from APIs
const MOCK_DESIGNS: DesignItem[] = [
  { id: '1', title: 'Modern Dashboard', image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=300', source: 'Unsplash', category: 'UI' },
  { id: '2', title: 'Mobile App', image: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=400&h=300', source: 'Unsplash', category: 'Mobile' },
  { id: '3', title: 'Web Design', image: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=400&h=300', source: 'Unsplash', category: 'Web' },
  { id: '4', title: 'Landing Page', image: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=400&h=300', source: 'Unsplash', category: 'Web' },
  { id: '5', title: 'Product Design', image: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=400&h=300', source: 'Unsplash', category: 'Product' },
  { id: '6', title: 'App Interface', image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=300', source: 'Unsplash', category: 'UI' },
]

export function InspirationBrowser({ open, onOpenChange }: InspirationBrowserProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'browse' | 'pinterest' | 'dribbble'>('browse')
  const { addElement } = useCanvasStore()

  const categories = ['UI', 'Mobile', 'Web', 'Product']

  const filteredDesigns = MOCK_DESIGNS.filter((design) => {
    const matchesSearch = design.title.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = !selectedCategory || design.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const handleDragStart = (e: React.DragEvent, design: DesignItem) => {
    e.dataTransfer.effectAllowed = 'copy'
    e.dataTransfer.setData('application/json', JSON.stringify({
      type: 'inspiration-image',
      title: design.title,
      image: design.image,
      source: design.source,
    }))
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>Design Inspiration Browser</DialogTitle>
        </DialogHeader>

        {/* Tabs */}
        <div className="flex gap-2 border-b">
          <Button
            variant={activeTab === 'browse' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setActiveTab('browse')}
          >
            Browse
          </Button>
          <Button
            variant={activeTab === 'pinterest' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => window.open('https://pinterest.com/search/pins/?q=ui+design', '_blank')}
            className="gap-2"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 0C5.373 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v 3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z"/>
            </svg>
            Pinterest
          </Button>
          <Button
            variant={activeTab === 'dribbble' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => window.open('https://dribbble.com/search/ui', '_blank')}
            className="gap-2"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" strokeWidth="2"/>
              <path d="M8.56 2.75c3.611 6.577 6.832 9.898 10.449 16.151M19.5 13.5c-3.789-4.276-6.982-6.577-10.5-12" stroke="currentColor" strokeWidth="2" fill="none"/>
            </svg>
            Dribbble
          </Button>
        </div>

        {activeTab === 'browse' && (
        <div className="space-y-4">
          {/* Search Bar */}
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search designs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Category Filter */}
          <div className="flex gap-2 flex-wrap">
            {categories.map((category) => (
              <Badge
                key={category}
                variant={selectedCategory === category ? 'default' : 'outline'}
                className="cursor-pointer"
                onClick={() => setSelectedCategory(selectedCategory === category ? null : category)}
              >
                {category}
              </Badge>
            ))}
          </div>

          {/* Design Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 overflow-y-auto max-h-[50vh]">
            {filteredDesigns.map((design) => (
              <div
                key={design.id}
                draggable
                onDragStart={(e) => handleDragStart(e, design)}
                className="cursor-move group relative rounded-lg overflow-hidden border border-border hover:border-primary transition-all"
              >
                <Image
                  src={design.image}
                  alt={design.title}
                  width={400}
                  height={300}
                  className="w-full h-48 object-cover group-hover:scale-105 transition-transform"
                />
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center p-3">
                  <p className="text-white text-sm font-medium text-center">{design.title}</p>
                  <p className="text-gray-300 text-xs mt-1">{design.source}</p>
                  <Badge className="mt-2" variant="secondary">
                    Drag to canvas
                  </Badge>
                </div>
              </div>
            ))}
          </div>

          {filteredDesigns.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No designs found. Try different search terms or category.
            </div>
          )}
        </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
