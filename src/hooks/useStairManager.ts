import { useState, useCallback } from 'react';
import type { Stair, Point, Wall } from '../core/types';
import { DEFAULT_STAIR } from '../core/types';
import { detectRoomRegion } from '../core/roomDetection';
import { v4 as uuidv4 } from 'uuid';

export function useStairManager(walls: Wall[]) {
  const [stairs, setStairs] = useState<Stair[]>([]);

    const addStairAtPoint = useCallback((pt: Point) => {
        const region = detectRoomRegion(pt, walls, 'bathroom');
            if (!region) return;

                const center = {
                      x: region.polygon.reduce((s, p) => s + p.x, 0) / region.polygon.length,
                            y: region.polygon.reduce((s, p) => s + p.y, 0) / region.polygon.length,
                                };

                                    const newStair: Stair = {
                                          id: uuidv4(),
                                                polygon: region.polygon,
                                                      center,
                                                            width: DEFAULT_STAIR.width,
                                                                  totalLength: DEFAULT_STAIR.totalLength,
                                                                        landingLength: DEFAULT_STAIR.landingLength,
                                                                              treadDepth: DEFAULT_STAIR.treadDepth,
                                                                                    riserHeight: DEFAULT_STAIR.riserHeight,
                                                                                          rotation: 0, // زاوية البداية
                                                                                              };

                                                                                                  setStairs(prev => [...prev, newStair]);
                                                                                                    }, [walls]);

                                                                                                      const updateStair = useCallback((id: string, patch: Partial<Stair>) => {
                                                                                                          setStairs(prev => prev.map(s => s.id === id ? { ...s, ...patch } : s));
                                                                                                            }, []);

                                                                                                              // ✅ دالة التدوير (تدوير البلوك بالكامل بتغيير الزاوية فقط)
                                                                                                                const rotateStairById = useCallback((id: string) => {
                                                                                                                    setStairs(prev => prev.map(s => {
                                                                                                                          if (s.id !== id) return s;
                                                                                                                                // تدوير 90 درجة في كل ضغطة (4 اتجاهات)
                                                                                                                                      const newRotation = (s.rotation + Math.PI / 2) % (Math.PI * 2);
                                                                                                                                            return { ...s, rotation: newRotation };
                                                                                                                                                }));
                                                                                                                                                  }, []);

                                                                                                                                                    const removeStair = useCallback((id: string) => {
                                                                                                                                                        setStairs(prev => prev.filter(s => s.id !== id));
                                                                                                                                                          }, []);

                                                                                                                                                            const setAllStairs = useCallback((newStairs: Stair[]) => {
                                                                                                                                                                setStairs(newStairs);
                                                                                                                                                                  }, []);

                                                                                                                                                                    return {
                                                                                                                                                                        stairs,
                                                                                                                                                                            addStairAtPoint,
                                                                                                                                                                                updateStair,
                                                                                                                                                                                    rotateStairById,
                                                                                                                                                                                        removeStair,
                                                                                                                                                                                            setAllStairs,
                                                                                                                                                                                              };
                                                                                                                                                                                              }