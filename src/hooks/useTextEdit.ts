import { useState, useCallback, useRef } from 'react';
import type { Point, TextElement } from '../core/types';
import { distance, getAngle, snapAngle } from '../core/geometry';

export type TextDragMode = 'move' | 'rotate' | 'scale' | null;

const HANDLE = 0.3;

export function useTextEdit(
  texts: TextElement[],
    updateText: (id: string, patch: Partial<TextElement>) => void,
      removeText: (id: string) => void,
        addText: (position: Point, text: string) => void,
        ) {
          const [selectedTextId, setSelectedTextId] = useState<string | null>(null);
            const dragModeRef = useRef<TextDragMode>(null);
              const dragStartRef = useRef<Point | null>(null);

                const hitTest = useCallback((pt: Point, text: TextElement): boolean => {
                    // مقبض التدوير (أعلى النص)
                        const rotateHandle = {
                              x: text.position.x + Math.sin(text.rotation || 0) * (text.fontSize + 0.25),
                                    y: text.position.y - Math.cos(text.rotation || 0) * (text.fontSize + 0.25),
                                        };
                                            if (distance(pt, rotateHandle) <= HANDLE) return true;

                                                // مقبض الحجم (جانب النص)
                                                    const scaleHandle = {
                                                          x: text.position.x + Math.cos(text.rotation || 0) * (text.fontSize * 0.5),
                                                                y: text.position.y + Math.sin(text.rotation || 0) * (text.fontSize * 0.5),
                                                                    };
                                                                        if (distance(pt, scaleHandle) <= HANDLE) return true;

                                                                            // جسم النص
                                                                                return distance(pt, text.position) <= 0.8;
                                                                                  }, []);

                                                                                    const detectMode = useCallback((pt: Point, text: TextElement): TextDragMode => {
                                                                                        const rotateHandle = {
                                                                                              x: text.position.x + Math.sin(text.rotation || 0) * (text.fontSize + 0.25),
                                                                                                    y: text.position.y - Math.cos(text.rotation || 0) * (text.fontSize + 0.25),
                                                                                                        };
                                                                                                            if (distance(pt, rotateHandle) <= HANDLE) return 'rotate';

                                                                                                                const scaleHandle = {
                                                                                                                      x: text.position.x + Math.cos(text.rotation || 0) * (text.fontSize * 0.5),
                                                                                                                            y: text.position.y + Math.sin(text.rotation || 0) * (text.fontSize * 0.5),
                                                                                                                                };
                                                                                                                                    if (distance(pt, scaleHandle) <= HANDLE) return 'scale';

                                                                                                                                        return 'move';
                                                                                                                                          }, []);

                                                                                                                                            const select = useCallback((id: string, pt: Point, mode: TextDragMode = 'move') => {
                                                                                                                                                setSelectedTextId(id);
                                                                                                                                                    dragStartRef.current = pt;
                                                                                                                                                        dragModeRef.current = mode;
                                                                                                                                                          }, []);

                                                                                                                                                            const deselect = useCallback(() => {
                                                                                                                                                                setSelectedTextId(null);
                                                                                                                                                                    dragModeRef.current = null;
                                                                                                                                                                        dragStartRef.current = null;
                                                                                                                                                                          }, []);

                                                                                                                                                                            const moveDrag = useCallback((pt: Point) => {
                                                                                                                                                                                if (!selectedTextId || !dragModeRef.current || !dragStartRef.current) return;

                                                                                                                                                                                    const dx = pt.x - dragStartRef.current.x;
                                                                                                                                                                                        const dy = pt.y - dragStartRef.current.y;
                                                                                                                                                                                            dragStartRef.current = pt;

                                                                                                                                                                                                const text = texts.find(t => t.id === selectedTextId);
                                                                                                                                                                                                    if (!text) return;

                                                                                                                                                                                                        if (dragModeRef.current === 'move') {
                                                                                                                                                                                                              updateText(selectedTextId, {
                                                                                                                                                                                                                      position: { x: text.position.x + dx, y: text.position.y + dy },
                                                                                                                                                                                                                            });
                                                                                                                                                                                                                                } else if (dragModeRef.current === 'rotate') {
                                                                                                                                                                                                                                      let angle = getAngle(text.position, pt) + Math.PI / 2;
                                                                                                                                                                                                                                            angle = snapAngle(angle, 0.15);
                                                                                                                                                                                                                                                  updateText(selectedTextId, { rotation: angle });
                                                                                                                                                                                                                                                      } else if (dragModeRef.current === 'scale') {
                                                                                                                                                                                                                                                            const newSize = Math.max(0.1, text.fontSize + dx);
                                                                                                                                                                                                                                                                  updateText(selectedTextId, { fontSize: newSize });
                                                                                                                                                                                                                                                                      }
                                                                                                                                                                                                                                                                        }, [selectedTextId, texts, updateText]);

                                                                                                                                                                                                                                                                          const endDrag = useCallback(() => {
                                                                                                                                                                                                                                                                              dragModeRef.current = null;
                                                                                                                                                                                                                                                                                  dragStartRef.current = null;
                                                                                                                                                                                                                                                                                    }, []);

                                                                                                                                                                                                                                                                                      const copySelected = useCallback(() => {
                                                                                                                                                                                                                                                                                          const text = texts.find(t => t.id === selectedTextId);
                                                                                                                                                                                                                                                                                              if (!text) return;
                                                                                                                                                                                                                                                                                                  addText(
                                                                                                                                                                                                                                                                                                        { x: text.position.x + 1, y: text.position.y + 1 },
                                                                                                                                                                                                                                                                                                              text.text,
                                                                                                                                                                                                                                                                                                                  );
                                                                                                                                                                                                                                                                                                                    }, [texts, selectedTextId, addText]);

                                                                                                                                                                                                                                                                                                                      return {
                                                                                                                                                                                                                                                                                                                          selectedTextId,
                                                                                                                                                                                                                                                                                                                              hitTest,
                                                                                                                                                                                                                                                                                                                                  detectMode,
                                                                                                                                                                                                                                                                                                                                      select,
                                                                                                                                                                                                                                                                                                                                          deselect,
                                                                                                                                                                                                                                                                                                                                              moveDrag,
                                                                                                                                                                                                                                                                                                                                                  endDrag,
                                                                                                                                                                                                                                                                                                                                                      copySelected,
                                                                                                                                                                                                                                                                                                                                                          removeSelected: () => {
                                                                                                                                                                                                                                                                                                                                                                if (selectedTextId) {
                                                                                                                                                                                                                                                                                                                                                                        removeText(selectedTextId);
                                                                                                                                                                                                                                                                                                                                                                                deselect();
                                                                                                                                                                                                                                                                                                                                                                                      }
                                                                                                                                                                                                                                                                                                                                                                                          },
                                                                                                                                                                                                                                                                                                                                                                                            };
                                                                                                                                                                                                                                                                                                                                                                                            }