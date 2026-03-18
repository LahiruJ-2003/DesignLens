"use client";

import { useCallback, useEffect } from "react";
import { useOthers, useUpdateMyPresence, useSelf } from "@/liveblocks.config";
import { useUser } from "@clerk/nextjs";

export function useCollaboration() {
  const others = useOthers();
  const updateMyPresence = useUpdateMyPresence();
  const self = useSelf();
  const { user } = useUser();

  // Initialize random user info if not present
  useEffect(() => {
    if (self && !self.presence.user?.name) {
      const sessionId = self.connectionId;
      const colors = ["#FF6B6B", "#4ECDC4", "#45B7D1", "#FFA07A", "#98D8C8", "#9B59B6", "#E67E22"];
      const userColor = colors[sessionId % colors.length] || colors[0];
      
      updateMyPresence({
        user: {
          id: user ? user.id : String(sessionId),
          name: user ? (user.fullName || user.firstName || "User") : `User-${String(sessionId).substring(0, 4)}`,
          color: userColor,
          picture: user?.imageUrl,
        }
      });
    }
  }, [self, updateMyPresence, user]);

  const updateCursor = useCallback((x: number, y: number) => {
    updateMyPresence({ cursor: { x, y } });
  }, [updateMyPresence]);

  const updateSelection = useCallback((ids: string[]) => {
    updateMyPresence({ selectedElementIds: ids });
  }, [updateMyPresence]);

  // Map Liveblocks 'useOthers' to the format CanvasEditor expects
  const collaborators = others.map(other => ({
    id: String(other.connectionId),
    presence: {
      cursor: other.presence.cursor,
      name: other.presence.user?.name || `User-${other.connectionId}`,
      color: other.presence.user?.color || "#FF6B6B",
      selectedIds: other.presence.selectedElementIds || [],
      picture: other.presence.user?.picture,
    }
  }));

  return {
    isCollaborationEnabled: true,
    updateCursor,
    updateSelection,
    collaborators,
    sessionId: self?.connectionId ? String(self.connectionId) : "",
  };
}

export function useIsCollaborating() {
  return true;
}
