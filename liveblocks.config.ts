'use client'

import { createClient } from '@liveblocks/client'
import { createRoomContext } from '@liveblocks/react'
import type { CanvasElement, Layer } from '@/lib/types'

type Presence = {
  cursor: { x: number; y: number } | null
  selectedElementIds: string[]
  user: {
    id: string
    name: string
    color: string
  }
}

type Storage = {
  elements: CanvasElement[]
  layers: Layer[]
  projectName: string
}

type UserMeta = {
  id: string
  name: string
  color: string
}

const client = createClient({
  publicApiKey: process.env.NEXT_PUBLIC_LIVEBLOCKS_PUBLIC_KEY!,
  throttle: 16,
})

const roomContext = createRoomContext<Presence, Storage, UserMeta>(client)

export const RoomProvider = roomContext.suspense.RoomProvider
export const useMyPresence = roomContext.suspense.useMyPresence
export const useUpdateMyPresence = roomContext.suspense.useUpdateMyPresence
export const useOthers = roomContext.suspense.useOthers
export const useSelf = roomContext.suspense.useSelf
export const useStorage = roomContext.suspense.useStorage
export const useMutation = roomContext.suspense.useMutation
