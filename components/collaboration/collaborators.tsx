'use client'

import { useOthers, useSelf } from '@/liveblocks.config'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'

export function Collaborators() {
  const self = useSelf()
  const others = useOthers()

  if (!others || others.length === 0) {
    return null
  }

  const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8', '#F7DC6F']

  return (
    <TooltipProvider>
      <div className="flex items-center -space-x-2">
        {others.slice(0, 5).map((other) => {
          const colorIndex = (other.connectionId % colors.length)
          const color = other.presence?.user?.color || colors[colorIndex]
          const name = other.presence?.user?.name || 'Guest'
          const initials = name[0] || '?'

          return (
            <Tooltip key={other.connectionId}>
              <TooltipTrigger>
                <Avatar className="h-8 w-8 border-2 border-background hover:border-foreground transition-colors">
                  <AvatarFallback style={{ backgroundColor: color }}>
                    <span className="text-white font-bold text-xs">{initials}</span>
                  </AvatarFallback>
                </Avatar>
              </TooltipTrigger>
              <TooltipContent>
                <p>{name}</p>
              </TooltipContent>
            </Tooltip>
          )
        })}
        {others.length > 5 && (
          <Tooltip>
            <TooltipTrigger>
              <Avatar className="h-8 w-8 border-2 border-background">
                <AvatarFallback className="bg-muted">
                  <span className="text-xs">+{others.length - 5}</span>
                </AvatarFallback>
              </Avatar>
            </TooltipTrigger>
            <TooltipContent>
              <p>+{others.length - 5} more collaborators</p>
            </TooltipContent>
          </Tooltip>
        )}
      </div>
    </TooltipProvider>
  )
}
