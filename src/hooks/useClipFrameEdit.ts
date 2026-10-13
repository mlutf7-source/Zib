import { useState, useCallback, useRef } from 'react';
import type { Point, ClipFrame } from '../core/types';
import { distance, getAngle, snapAngle } from '../core/geometry';

export type ClipFrameDragMode = 'move' | 'rotate' | 'scale' | null;

const HANDLE = 0.5; // نصف قطر المقبض (أكبر لسهولة النقر)

export function useClipFrameEdit(
  clipFrames: ClipFrame[],
    updateClipFrame: (id: string, patch: Partial<ClipFrame>) => void,
    ) {
      const [selectedClipFrameId, setSelectedClipFrameId] = useState<string | null>(null);
        const dragModeRef = useRef<ClipFrameDragMode>(null);
          const dragStartRef = useRef<Point | null>(null);

            const hitTest = useCallback((pt: Point, frame: ClipFrame): boolean => {
                const rotation = frame.rotation || 0;
                    const cos = Math.cos(rotation);
                        const sin = Math.sin(rotation);

                            // تحويل النقطة إلى إحداثيات محلية (بدون دوران)
                                const dx = pt.x - frame.x;
                                    const dy = pt.y - frame.y;
                                        const localX = dx * cos + dy * sin;
                                            const localY = -dx * sin + dy * cos;

                                                // مقبض التدوير (أعلى المنتصف)
                                                    const rotateHandleY = -frame.height / 2 - 0.5;
                                                        if (Math.abs(localX) <= HANDLE && Math.abs(localY - rotateHandleY) <= HANDLE) return true;

                                                            // مقبض التكبير (يمين المنتصف)
                                                                const scaleHandleX = frame.width / 2 + 0.5;
                                                                    if (Math.abs(localX - scaleHandleX) <= HANDLE && Math.abs(localY) <= HANDLE) return true;

                                                                        // جسم الإطار
                                                                            return Math.abs(localX) <= frame.width / 2 && Math.abs(localY) <= frame.height / 2;
                                                                              }, []);

                                                                                const detectMode = useCallback((pt: Point, frame: ClipFrame): ClipFrameDragMode => {
                                                                                    const rotation = frame.rotation || 0;
                                                                                        const cos = Math.cos(rotation);
                                                                                            const sin = Math.sin(rotation);

                                                                                                const dx = pt.x - frame.x;
                                                                                                    const dy = pt.y - frame.y;
                                                                                                        const localX = dx * cos + dy * sin;
                                                                                                            const localY = -dx * sin + dy * cos;

                                                                                                                // مقبض التدوير (أعلى المنتصف)
                                                                                                                    const rotateHandleY = -frame.height / 2 - 0.5;
                                                                                                                        if (Math.abs(localX) <= HANDLE && Math.abs(localY - rotateHandleY) <= HANDLE) return 'rotate';

                                                                                                                            // مقبض التكبير (يمين المنتصف)
                                                                                                                                const scaleHandleX = frame.width / 2 + 0.5;
                                                                                                                                    if (Math.abs(localX - scaleHandleX) <= HANDLE && Math.abs(localY) <= HANDLE) return 'scale';

                                                                                                                                        return 'move';
                                                                                                                                          }, []);

                                                                                                                                            const select = useCallback((id: string, pt: Point, mode: ClipFrameDragMode = 'move') => {
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
                                                                                                                                                                                if (!selectedClipFrameId || !dragModeRef.current || !dragStartRef.current) return;

                                                                                                                                                                                    const dx = pt.x - dragStartRef.current.x;
                                                                                                                                                                                        const dy = pt.y - dragStartRef.current.y;
                                                                                                                                                                                            dragStartRef.current = pt;

                                                                                                                                                                                                const frame = clipFrames.find(f => f.id === selectedClipFrameId);
                                                                                                                                                                                                    if (!frame) return;

                                                                                                                                                                                                        if (dragModeRef.current === 'move') {
                                                                                                                                                                                                              updateClipFrame(selectedClipFrameId, {
                                                                                                                                                                                                                      x: frame.x + dx,
                                                                                                                                                                                                                              y: frame.y + dy,
                                                                                                                                                                                                                                    });
                                                                                                                                                                                                                                        } else if (dragModeRef.current === 'rotate') {
                                                                                                                                                                                                                                              let angle = getAngle({ x: frame.x, y: frame.y }, pt) + Math.PI / 2;
                                                                                                                                                                                                                                                    angle = snapAngle(angle, 0.15);
                                                                                                                                                                                                                                                          updateClipFrame(selectedClipFrameId, { rotation: angle });
                                                                                                                                                                                                                                                              } else if (dragModeRef.current === 'scale') {
                                                                                                                                                                                                                                                                    const dist = distance({ x: frame.x, y: frame.y }, pt);
                                                                                                                                                                                                                                                                          const newWidth = Math.max(1, dist * 2);
                                                                                                                                                                                                                                                                                updateClipFrame(selectedClipFrameId, {
                                                                                                                                                                                                                                                                                        width: newWidth,
                                                                                                                                                                                                                                                                                                height: newWidth * 1.414, // نسبة A3
                                                                                                                                                                                                                                                                                                      });
                                                                                                                                                                                                                                                                                                          }
                                                                                                                                                                                                                                                                                                            }, [selectedClipFrameId, clipFrames, updateClipFrame]);

                                                                                                                                                                                                                                                                                                              const endDrag = useCallback(() => {
                                                                                                                                                                                                                                                                                                                  dragModeRef.current = null;
                                                                                                                                                                                                                                                                                                                      dragStartRef.current = null;
                                                                                                                                                                                                                                                                                                                        }, []);

                                                                                                                                                                                                                                                                                                                          return {
                                                                                                                                                                                                                                                                                                                              selectedClipFrameId,
                                                                                                                                                                                                                                                                                                                                  hitTest,
                                                                                                                                                                                                                                                                                                                                      detectMode,
                                                                                                                                                                                                                                                                                                                                          select,
                                                                                                                                                                                                                                                                                                                                              deselect,
                                                                                                                                                                                                                                                                                                                                                  moveDrag,
                                                                                                                                                                                                                                                                                                                                                      endDrag,
                                                                                                                                                                                                                                                                                                                                                        };
                                                                                                                                                                                                                                                                                                                                                        }