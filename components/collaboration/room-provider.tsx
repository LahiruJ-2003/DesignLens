"use client";

import { ReactNode } from "react";
import { COLLABORATION_ENABLED } from "@/lib/collaboration-config";

interface CollaborationRoomProps {
  children: ReactNode;
  roomId: string;
}

export function CollaborationRoom({ children, roomId }: CollaborationRoomProps) {
  // When collaboration is not enabled, just render children directly
  if (!COLLABORATION_ENABLED) {
    return <>{children}</>;
  }

  // Placeholder for real-time collaboration
  // When you integrate a real-time backend (Liveblocks, Partykit, etc.),
  // wrap children with the appropriate provider here
  return <>{children}</>;
}
