// // Collaboration feature configuration
// // Currently disabled - enable when you set up a real-time backend

// export const COLLABORATION_ENABLED = false;

// // Placeholder types for collaboration
// export type CollaboratorPresence = {
//   cursor: { x: number; y: number } | null;
//   selectedIds: string[];
//   name: string;
//   color: string;
// };

// export type Collaborator = {
//   id: string;
//   presence: CollaboratorPresence;
// };
// Collaboration feature configuration
// Uses browser storage and local broadcasting for multi-tab/multi-window collaboration
// In production, this would connect to a real-time backend like Liveblocks or Supabase

export const COLLABORATION_ENABLED = true;

// Placeholder types for collaboration
export type CollaboratorPresence = {
  cursor: { x: number; y: number } | null;
  selectedIds: string[];
  name: string;
  color: string;
};

export type Collaborator = {
  id: string;
  presence: CollaboratorPresence;
};
