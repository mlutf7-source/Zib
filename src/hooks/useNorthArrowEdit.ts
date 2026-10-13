import { useState, useCallback, useRef } from 'react';
import type { Point, NorthArrow } from '../core/types';
import { distance, getAngle, snapAngle } from '../core/geometry';

export type NorthArrowDragMode = 'move' | 'rotate' | 'scale' | null;

const HANDLE = 0.3;

export function useNorthArrowEdit(
  northArrows: NorthArrow[],
    updateNorthArrow: (id: string, patch: Partial<NorthArrow>) => void,
    ) {
      const [selectedNorthArrowId, setSelectedNorthArrowId] = useState<string | null>(null);
        const dragModeRef = useRef<NorthArrowDragMode>(null);
          const dragStartRef = useRef<Point | null>(null);

            const hitTest = useCallback((pt: Point, arrow: NorthArrow): boolean => {
                // تحويل size من بكسل إلى متر (تقريباً 0.6 متر لكل 30 بكسل)
                    const sizeInMeters = arrow.size / 50;

                        // مقبض التدوير (أعلى السهم) - نفس معادلة النص
                            const rotateHandle = {
                                  x: arrow.position.x + Math.sin(arrow.rotation || 0) * (sizeInMeters + 0.25),
                                        y: arrow.position.y - Math.cos(arrow.rotation || 0) * (sizeInMeters + 0.25),
                                            };
                                                if (distance(pt, rotateHandle) <= HANDLE) return true;

                                                    // مقبض الحجم (جانب السهم) - نفس معادلة النص
                                                        const scaleHandle = {
                                                              x: arrow.position.x + Math.cos(arrow.rotation || 0) * (sizeInMeters * 0.5),
                                                                    y: arrow.position.y + Math.sin(arrow.rotation || 0) * (sizeInMeters * 0.5),
                                                                        };
                                                                            if (distance(pt, scaleHandle) <= HANDLE) return true;

                                                                                // جسم السهم
                                                                                    return distance(pt, arrow.position) <= 0.8;
                                                                                      }, []);

                                                                                        const detectMode = useCallback((pt: Point, arrow: NorthArrow): NorthArrowDragMode => {
                                                                                            const sizeInMeters = arrow.size / 50;

                                                                                                const rotateHandle = {
                                                                                                      x: arrow.position.x + Math.sin(arrow.rotation || 0) * (sizeInMeters + 0.25),
                                                                                                            y: arrow.position.y - Math.cos(arrow.rotation || 0) * (sizeInMeters + 0.25),
                                                                                                                };
                                                                                                                    if (distance(pt, rotateHandle) <= HANDLE) return 'rotate';

                                                                                                                        const scaleHandle = {
                                                                                                                              x: arrow.position.x + Math.cos(arrow.rotation || 0) * (sizeInMeters * 0.5),
                                                                                                                                    y: arrow.position.y + Math.sin(arrow.rotation || 0) * (sizeInMeters * 0.5),
                                                                                                                                        };
                                                                                                                                            if (distance(pt, scaleHandle) <= HANDLE) return 'scale';

                                                                                                                                                return 'move';
                                                                                                                                                  }, []);

                                                                                                                                                    const select = useCallback((id: string, pt: Point, mode: NorthArrowDragMode = 'move') => {
                                                                                                                                                        setSelectedNorthArrowId(id);
                                                                                                                                                            dragStartRef.current = pt;
                                                                                                                                                                dragModeRef.current = mode;
                                                                                                                                                                  }, []);

                                                                                                                                                                    const deselect = useCallback(() => {
                                                                                                                                                                        setSelectedNorthArrowId(null);
                                                                                                                                                                            dragModeRef.current = null;
                                                                                                                                                                                dragStartRef.current = null;
                                                                                                                                                                                  }, []);

                                                                                                                                                                                    const moveDrag = useCallback((pt: Point) => {
                                                                                                                                                                                        if (!selectedNorthArrowId || !dragModeRef.current || !dragStartRef.current) return;

                                                                                                                                                                                            const dx = pt.x - dragStartRef.current.x;
                                                                                                                                                                                                const dy = pt.y - dragStartRef.current.y;
                                                                                                                                                                                                    dragStartRef.current = pt;

                                                                                                                                                                                                        const arrow = northArrows.find(n => n.id === selectedNorthArrowId);
                                                                                                                                                                                                            if (!arrow) return;

                                                                                                                                                                                                                if (dragModeRef.current === 'move') {
                                                                                                                                                                                                                      updateNorthArrow(selectedNorthArrowId, {
                                                                                                                                                                                                                              position: { x: arrow.position.x + dx, y: arrow.position.y + dy },
                                                                                                                                                                                                                                    });
                                                                                                                                                                                                                                        } else if (dragModeRef.current === 'rotate') {
                                                                                                                                                                                                                                              let angle = getAngle(arrow.position, pt) + Math.PI / 2;
                                                                                                                                                                                                                                                    angle = snapAngle(angle, 0.15);
                                                                                                                                                                                                                                                          updateNorthArrow(selectedNorthArrowId, { rotation: angle });
                                                                                                                                                                                                                                                              } else if (dragModeRef.current === 'scale') {
                                                                                                                                                                                                                                                                    // نفس أسلوب النص: تغيير الحجم بناءً على dx
                                                                                                                                                                                                                                                                          const newSize = Math.max(10, arrow.size + dx * 50);
                                                                                                                                                                                                                                                                                updateNorthArrow(selectedNorthArrowId, { size: newSize });
                                                                                                                                                                                                                                                                                    }
                                                                                                                                                                                                                                                                                      }, [selectedNorthArrowId, northArrows, updateNorthArrow]);

                                                                                                                                                                                                                                                                                        const endDrag = useCallback(() => {
                                                                                                                                                                                                                                                                                            dragModeRef.current = null;
                                                                                                                                                                                                                                                                                                dragStartRef.current = null;
                                                                                                                                                                                                                                                                                                  }, []);

                                                                                                                                                                                                                                                                                                    return {
                                                                                                                                                                                                                                                                                                        selectedNorthArrowId,
                                                                                                                                                                                                                                                                                                            hitTest,
                                                                                                                                                                                                                                                                                                                detectMode,
                                                                                                                                                                                                                                                                                                                    select,
                                                                                                                                                                                                                                                                                                                        deselect,
                                                                                                                                                                                                                                                                                                                            moveDrag,
                                                                                                                                                                                                                                                                                                                                endDrag,
                                                                                                                                                                                                                                                                                                                                  };
                                                                                                                                                                                                                                                                                                                                  }