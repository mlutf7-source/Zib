import { useState, useCallback } from 'react';
import type { Point, Wall } from '../core/types';
import type { RoomRegion, RegionType } from '../core/regionTypes';
import { detectRoomRegion } from '../core/roomDetection';

export function useRegionManager(walls: Wall[]) {
  const [regions, setRegions] = useState<RoomRegion[]>([]);

    const addRegion = useCallback((pt: Point, type: RegionType) => {
        const region = detectRoomRegion(pt, walls, type);
            if (region) {
                  setRegions(prev => [...prev, region]);
                      }
                        }, [walls]);

                          const removeRegion = useCallback((id: string) => {
                              setRegions(prev => prev.filter(r => r.id !== id));
                                }, []);

                                  const clearRegions = useCallback(() => {
                                      setRegions([]);
                                        }, []);

                                          // ✅ إضافة setRegions لاستعادة الحالة عند التراجع
                                            const setAllRegions = useCallback((newRegions: RoomRegion[]) => {
                                                setRegions(newRegions);
                                                  }, []);

                                                    return {
                                                        regions,
                                                            addRegion,
                                                                removeRegion,
                                                                    clearRegions,
                                                                        setRegions: setAllRegions,
                                                                          };
                                                                          }