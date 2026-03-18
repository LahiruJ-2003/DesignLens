'use client'

import { useEffect, useRef } from 'react'
import { useStorage, useMutation } from '@/liveblocks.config'
import { useCanvasStore } from '@/lib/canvas-store'

export function CanvasSync() {
  const localElements = useCanvasStore(state => state.elements)
  const localLayers = useCanvasStore(state => state.layers)
  
  const remoteElements = useStorage((root: any) => root.elements)
  const remoteLayers = useStorage((root: any) => root.layers)
  
  const isSyncingFromRemote = useRef(false)
  const isFirstRemoteSync = useRef(true)
  const previousLocalState = useRef({ elements: localElements, layers: localLayers })

  // 1. Sync FROM remote TO local
  useEffect(() => {
    if (!remoteElements || !remoteLayers) return;
    
    // Check if remote is actually different from our last known local
    const remoteElementsStr = JSON.stringify(remoteElements);
    const remoteLayersStr = JSON.stringify(remoteLayers);
    const localElementsStr = JSON.stringify(previousLocalState.current.elements);
    const localLayersStr = JSON.stringify(previousLocalState.current.layers);
    
    if (remoteElementsStr !== localElementsStr || remoteLayersStr !== localLayersStr) {
      // Prevent wiping local state when connecting to a fresh empty room if local has data
      if (isFirstRemoteSync.current && remoteElements.length === 0 && previousLocalState.current.elements.length > 0) {
        isFirstRemoteSync.current = false;
        // Do not overwrite. The local-to-remote effect will push our imported data out exactly once.
        return;
      }
      
      isFirstRemoteSync.current = false;
      isSyncingFromRemote.current = true;
      useCanvasStore.setState({ elements: remoteElements as any, layers: remoteLayers as any });
      previousLocalState.current = { elements: remoteElements as any, layers: remoteLayers as any };
      
      // Reset the flag after a short delay to allow Zustand to update
      setTimeout(() => {
        isSyncingFromRemote.current = false;
      }, 50);
    } else {
      isFirstRemoteSync.current = false;
    }
  }, [remoteElements, remoteLayers]);

  // 2. Sync FROM local TO remote
  const pushToRemote = useMutation(({ storage }, elements, layers) => {
    // If we're currently processing a remote update, don't echo it back
    if (isSyncingFromRemote.current) return;
    
    const currentElementsStr = JSON.stringify(elements);
    const currentLayersStr = JSON.stringify(layers);
    const prevElementsStr = JSON.stringify(previousLocalState.current.elements);
    const prevLayersStr = JSON.stringify(previousLocalState.current.layers);
    
    // Only push if local actually changed compared to what we last knew
    if (currentElementsStr !== prevElementsStr || currentLayersStr !== prevLayersStr) {
      storage.set('elements', elements as any);
      storage.set('layers', layers as any);
      previousLocalState.current = { elements, layers };
    }
  }, []);

  useEffect(() => {
    pushToRemote(localElements, localLayers);
  }, [localElements, localLayers, pushToRemote]);

  return null;
}
