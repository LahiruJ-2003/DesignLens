"use client";

import { ReactNode } from "react";
import { CollaborationRoom } from "./room-provider";
import { COLLABORATION_ENABLED } from "@/lib/collaboration-config";

interface CollaborationWrapperProps {
  children: ReactNode;
  roomId?: string;
}

export function CollaborationWrapper({ 
  children, 
  roomId = "designlens-default-room" 
}: CollaborationWrapperProps) {
  // Pass through to room provider (which handles the enabled check)
  return (
    <CollaborationRoom roomId={roomId}>
      {children}
    </CollaborationRoom>
  );
}
