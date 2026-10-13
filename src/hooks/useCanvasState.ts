import { useState, useCallback } from 'react';
import type { CanvasView } from '../core/types';

const MIN_ZOOM = 0.05;
const MAX_ZOOM = 3;

export function useCanvasState() {
  const [view, setViewState] = useState<CanvasView>({ zoom: 0.3, offsetX: 0, offsetY: 0 });

    const setZoom = useCallback((z: number) =>
        setViewState(p => ({ ...p, zoom: Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, z)) })), []);

          const pan = useCallback((dx: number, dy: number) =>
              setViewState(p => ({ ...p, offsetX: p.offsetX + dx, offsetY: p.offsetY + dy })), []);

                const setView = useCallback((v: CanvasView) => setViewState(v), []);

                  const reset = useCallback(() => setViewState({ zoom: 0.3, offsetX: 0, offsetY: 0 }), []);

                    return { view, setZoom, pan, setView, reset };
                    }