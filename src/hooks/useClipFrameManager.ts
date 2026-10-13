import { useState, useCallback, useRef } from 'react';
import type { Point, ClipFrame } from '../core/types';
import { distance, getAngle, snapAngle } from '../core/geometry';

export function useClipFrameManager(
  clipFrame: ClipFrame | null,
    setClipFrame: (frame: ClipFrame | null) => void
    ) {
      const [selectedClipFrameId, setSelectedClipFrameId] = useState<string | null>(null);
        const dragModeRef = useRef<'move' | 'rotate' | 'scale' | null>(null);
          const dragStartRef = useRef<Point | null>(null);

            const hitTest = useCallback((pt: Point, frame: ClipFrame): boolean => {
                const size = Math.max(frame.width, frame.height);
                    const rotateHandle = { x: frame.x + Math.sin(frame.rotation) * (size / 2 + 0.25), y: frame.y - Math.cos(frame.rotation) * (size / 2 + 0.25) };
                        if (distance(pt, rotateHandle) <= 0.3) return true;
                            const scaleHandle = { x: frame.x + Math.cos(frame.rotation) * (frame.width * 0.5), y: frame.y + Math.sin(frame.rotation) * (frame.width * 0.5) };
                                if (distance(pt, scaleHandle) <= 0.3) return true;
                                    return distance(pt, { x: frame.x, y: frame.y }) <= Math.max(frame.width, frame.height) * 0.6;
                                      }, []);

                                        const detectMode = useCallback((pt: Point, frame: ClipFrame): 'move' | 'rotate' | 'scale' => {
                                            const size = Math.max(frame.width, frame.height);
                                                const rotateHandle = { x: frame.x + Math.sin(frame.rotation) * (size / 2 + 0.25), y: frame.y - Math.cos(frame.rotation) * (size / 2 + 0.25) };
                                                    if (distance(pt, rotateHandle) <= 0.3) return 'rotate';
                                                        const scaleHandle = { x: frame.x + Math.cos(frame.rotation) * (frame.width * 0.5), y: frame.y + Math.sin(frame.rotation) * (frame.width * 0.5) };
                                                            if (distance(pt, scaleHandle) <= 0.3) return 'scale';
                                                                return 'move';
                                                                  }, []);

                                                                    const select = useCallback((id: string, pt: Point, mode: 'move' | 'rotate' | 'scale') => {
                                                                        setSelectedClipFrameId(id);
                                                                            dragStartRef.current = pt;
                                                                                dragModeRef.current = mode;
                                                                                  }, []);

                                                                                    const deselect = useCallback(() => {
                                                                                        setSelectedClipFrameId(null);
                                                                                            dragModeRef.current = null;
                                                                                                dragStartRef.current = null;
                                                                                                  }, []);

                                                                                                    const moveDrag = useCallback((pt: Point) => {
                                                                                                        if (!clipFrame || !dragModeRef.current || !dragStartRef.current) return;
                                                                                                            const dx = pt.x - dragStartRef.current.x;
                                                                                                                const dy = pt.y - dragStartRef.current.y;
                                                                                                                    dragStartRef.current = pt;
                                                                                                                        if (dragModeRef.current === 'move') {
                                                                                                                              setClipFrame({ ...clipFrame, x: clipFrame.x + dx, y: clipFrame.y + dy });
                                                                                                                                  } else if (dragModeRef.current === 'rotate') {
                                                                                                                                        let angle = getAngle({ x: clipFrame.x, y: clipFrame.y }, pt) + Math.PI / 2;
                                                                                                                                              angle = snapAngle(angle, 0.15);
                                                                                                                                                    setClipFrame({ ...clipFrame, rotation: angle });
                                                                                                                                                        } else if (dragModeRef.current === 'scale') {
                                                                                                                                                              const dist = distance({ x: clipFrame.x, y: clipFrame.y }, pt);
                                                                                                                                                                    setClipFrame({ ...clipFrame, width: Math.max(2, dist * 2), height: Math.max(2, dist * 2) * 1.414 });
                                                                                                                                                                        }
                                                                                                                                                                          }, [clipFrame, setClipFrame]);

                                                                                                                                                                            const endDrag = useCallback(() => {
                                                                                                                                                                                dragModeRef.current = null;
                                                                                                                                                                                    dragStartRef.current = null;
                                                                                                                                                                                      }, []);

                                                                                                                                                                                        return { selectedClipFrameId, hitTest, detectMode, select, deselect, moveDrag, endDrag };
                                                                                                                                                                                        }