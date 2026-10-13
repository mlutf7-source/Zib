import { useRef, useCallback } from 'react';
import type { Point, Stair } from '../core/types';
import { isPointInPolygon, moveStair } from '../core/stairGeometry';

export function useStairEdit() {
  const dragStartRef = useRef<Point | null>(null);
    const originalStairRef = useRef<Stair | null>(null);
      const movedRef = useRef(false);

        const isDragging = useCallback(() => originalStairRef.current !== null, []);

          const detectMode = useCallback((pt: Point, stair: Stair): 'move' | null => {
              return isPointInPolygon(pt, stair.polygon) ? 'move' : null;
                }, []);

                  const start = useCallback((pt: Point, stair: Stair, mode: 'move' | null) => {
                      if (!mode) return;
                          dragStartRef.current = pt;
                              originalStairRef.current = stair;
                                  movedRef.current = false;
                                    }, []);

                                      const move = useCallback((pt: Point, onUpdate: (stair: Stair) => void) => {
                                          const original = originalStairRef.current;
                                              const startPt = dragStartRef.current;
                                                  if (!original || !startPt) return;

                                                      const dx = pt.x - startPt.x;
                                                          const dy = pt.y - startPt.y;
                                                              const dist = Math.hypot(dx, dy);

                                                                  // تجاهل الحركات الصغيرة جداً لمنع القفز
                                                                      if (dist < 0.05) return;
                                                                          movedRef.current = true;

                                                                              onUpdate(moveStair(original, dx, dy));
                                                                                }, []);

                                                                                  const end = useCallback(() => {
                                                                                      dragStartRef.current = null;
                                                                                          originalStairRef.current = null;
                                                                                              movedRef.current = false;
                                                                                                }, []);

                                                                                                  return { detectMode, start, move, end, isDragging };
                                                                                                  }