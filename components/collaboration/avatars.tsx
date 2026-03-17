"use client";

import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { COLLABORATION_ENABLED } from "@/lib/collaboration-config";
import { Users } from "lucide-react";

export function CollaboratorAvatars() {
  // Return null if collaboration is not enabled
  if (!COLLABORATION_ENABLED) {
    return null;
  }

  // Placeholder for when collaboration is enabled
  // This would show real collaborator avatars when connected to a real-time backend
  return (
    <TooltipProvider delayDuration={200}>
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-muted/50">
          <Users className="h-3.5 w-3.5 text-muted-foreground" />
          <span className="text-xs text-muted-foreground">
            Collaboration enabled
          </span>
        </div>
      </div>
    </TooltipProvider>
  );
}
