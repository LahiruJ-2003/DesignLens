// "use client";

// import { useCallback } from "react";
// import { COLLABORATION_ENABLED } from "@/lib/collaboration-config";

// export function useCollaboration() {
//   // Placeholder hooks for cursor and selection updates
//   // These would connect to a real-time backend when collaboration is enabled

//   const updateCursor = useCallback((x: number, y: number) => {
//     if (!COLLABORATION_ENABLED) return;
//     // Would broadcast cursor position to other collaborators
//   }, []);

//   const updateSelection = useCallback((ids: string[]) => {
//     if (!COLLABORATION_ENABLED) return;
//     // Would broadcast selection to other collaborators
//   }, []);

//   return {
//     isCollaborationEnabled: COLLABORATION_ENABLED,
//     updateCursor,
//     updateSelection,
//   };
// }

// // Hook to track if we're in a collaborative session
// export function useIsCollaborating() {
//   return COLLABORATION_ENABLED;
// }
"use client";

import { useCallback, useEffect, useState } from "react";
import { COLLABORATION_ENABLED } from "@/lib/collaboration-config";
import type { CollaboratorPresence, Collaborator } from "@/lib/collaboration-config";

const STORAGE_KEY = "designlens_presence";
const SESSION_ID = Math.random().toString(36).substring(7);
let userColor = ["#FF6B6B", "#4ECDC4", "#45B7D1", "#FFA07A", "#98D8C8"][Math.floor(Math.random() * 5)];

export function useCollaboration() {
  const [collaborators, setCollaborators] = useState<Collaborator[]>([]);

  const updateCursor = useCallback((x: number, y: number) => {
    if (!COLLABORATION_ENABLED) return;
    
    const presence: CollaboratorPresence = {
      cursor: { x, y },
      selectedIds: [],
      name: `User-${SESSION_ID.substring(0, 4)}`,
      color: userColor,
    };
    
    try {
      const data = {
        sessionId: SESSION_ID,
        presence,
        timestamp: Date.now(),
      };
      localStorage.setItem(`${STORAGE_KEY}_${SESSION_ID}`, JSON.stringify(data));
      window.dispatchEvent(new CustomEvent("collaboration:update", { detail: data }));
    } catch (e) {
      console.log("[v0] Collaboration storage error:", e);
    }
  }, []);

  const updateSelection = useCallback((ids: string[]) => {
    if (!COLLABORATION_ENABLED) return;
    
    const stored = localStorage.getItem(`${STORAGE_KEY}_${SESSION_ID}`);
    if (stored) {
      const data = JSON.parse(stored);
      data.presence.selectedIds = ids;
      localStorage.setItem(`${STORAGE_KEY}_${SESSION_ID}`, JSON.stringify(data));
      window.dispatchEvent(new CustomEvent("collaboration:update", { detail: data }));
    }
  }, []);

  useEffect(() => {
    if (!COLLABORATION_ENABLED) return;

    const handleCollaborationUpdate = (e: any) => {
      const collaboratorsData: Collaborator[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key?.startsWith(STORAGE_KEY)) {
          const stored = localStorage.getItem(key);
          if (stored) {
            try {
              const { sessionId, presence } = JSON.parse(stored);
              if (sessionId !== SESSION_ID) {
                collaboratorsData.push({
                  id: sessionId,
                  presence,
                });
              }
            } catch (err) {
              // ignore parse errors
            }
          }
        }
      }
      setCollaborators(collaboratorsData);
    };

    window.addEventListener("collaboration:update", handleCollaborationUpdate);
    const interval = setInterval(handleCollaborationUpdate, 500);

    return () => {
      window.removeEventListener("collaboration:update", handleCollaborationUpdate);
      clearInterval(interval);
    };
  }, []);

  return {
    isCollaborationEnabled: COLLABORATION_ENABLED,
    updateCursor,
    updateSelection,
    collaborators,
    sessionId: SESSION_ID,
  };
}

export function useIsCollaborating() {
  return COLLABORATION_ENABLED;
}
