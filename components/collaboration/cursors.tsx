"use client";

import { COLLABORATION_ENABLED, type Collaborator } from "@/lib/collaboration-config";
import { memo } from "react";

// Single cursor component
const Cursor = memo(function Cursor({
  x,
  y,
  name,
  color,
}: {
  x: number;
  y: number;
  name: string;
  color: string;
}) {
  return (
    <div
      className="pointer-events-none absolute"
      style={{
        left: x,
        top: y,
        transform: "translate(-2px, -2px)",
        zIndex: 9999,
      }}
    >
      {/* Cursor SVG */}
      <svg
        width="24"
        height="36"
        viewBox="0 0 24 36"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M5.65376 12.3673H5.46026L5.31717 12.4976L0.500002 16.8829L0.500002 1.19841L11.7841 12.3673H5.65376Z"
          fill={color}
          stroke="white"
          strokeWidth="1"
        />
      </svg>

      {/* User name label */}
      <div
        className="absolute left-4 top-4 px-2 py-1 rounded-md text-xs font-medium whitespace-nowrap"
        style={{
          backgroundColor: color,
          color: "white",
        }}
      >
        {name}
      </div>
    </div>
  );
});

interface LiveCursorsProps {
  zoom: number;
  panOffset: { x: number; y: number };
  collaborators?: Collaborator[];
}

export function LiveCursors({ zoom, panOffset, collaborators = [] }: LiveCursorsProps) {
  if (!COLLABORATION_ENABLED || collaborators.length === 0) {
    return null;
  }

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {collaborators.map((collaborator) => {
        if (!collaborator.presence?.cursor) return null;

        // Transform cursor position based on zoom and pan
        const x = collaborator.presence.cursor.x * zoom + panOffset.x;
        const y = collaborator.presence.cursor.y * zoom + panOffset.y;

        return (
          <Cursor
            key={collaborator.id}
            x={x}
            y={y}
            name={collaborator.presence.name || "Anonymous"}
            color={collaborator.presence.color || "#666"}
          />
        );
      })}
    </div>
  );
}
