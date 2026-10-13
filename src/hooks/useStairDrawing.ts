import { useRef, useState, useCallback } from 'react';
import type { Point, Stair } from '../core/types';
import { distance } from '../core/geometry';
import { DEFAULT_STAIR } from '../core/types';

type AddStair = (stair: Omit<Stair, 'id'>) => void;

export function useStairDrawing(onAddStair: AddStair) {
const [draftPath, setDraftPath] = useState<Point[]>([]);
const startRef = useRef<Point | null>(null);

const begin = useCallback((pt: Point) => {
startRef.current = pt;
setDraftPath([pt]);
}, []);

const move = useCallback((pt: Point) => {
if (startRef.current) {
setDraftPath([startRef.current, pt]);
}
}, []);

const finish = useCallback(
(pt: Point) => {
const start = startRef.current;

  if (!start) return;

    const dx = pt.x - start.x;
      const dy = pt.y - start.y;
        const len = Math.hypot(dx, dy);

          if (len < 0.1) {
              startRef.current = null;
                  setDraftPath([]);
                      return;
                        }

                          const mid = {
                              x: start.x + dx / 2,
                                  y: start.y + dy / 2,
                                    };

                                      const normal = {
                                          x: -dy / len,
                                              y: dx / len,
                                                };

                                                  const halfWidth = DEFAULT_STAIR.width / 2;

                                                    const p1 = {
                                                        x: mid.x - normal.x * halfWidth,
                                                            y: mid.y - normal.y * halfWidth,
                                                              };

                                                                const p2 = {
                                                                    x: mid.x + normal.x * halfWidth,
                                                                        y: mid.y + normal.y * halfWidth,
                                                                          };

                                                                            const polygon: Point[] = [
                                                                                start,
                                                                                    p1,
                                                                                        p2,
                                                                                            pt,
                                                                                              ];

                                                                                                const stair: Omit<Stair, 'id'> = {
                                                                                                    polygon,
                                                                                                        center: mid,
                                                                                                            width: DEFAULT_STAIR.width,
                                                                                                                totalLength: len,
                                                                                                                    landingLength: DEFAULT_STAIR.landingLength,
                                                                                                                        treadDepth: DEFAULT_STAIR.treadDepth,
                                                                                                                            riserHeight: DEFAULT_STAIR.riserHeight,
                                                                                                                                rotation: Math.atan2(dy, dx),
                                                                                                                                  };

                                                                                                                                    onAddStair(stair);

                                                                                                                                      startRef.current = null;
                                                                                                                                        setDraftPath([]);
                                                                                                                                        },
                                                                                                                                        [onAddStair]

                                                                                                                                        );

                                                                                                                                        const cancel = useCallback(() => {
                                                                                                                                        startRef.current = null;
                                                                                                                                        setDraftPath([]);
                                                                                                                                        }, []);

                                                                                                                                        const hitTest = useCallback(
                                                                                                                                        (pt: Point, stairs: Stair[]): Stair | null => {
                                                                                                                                        for (const stair of stairs) {
                                                                                                                                        if (
                                                                                                                                        stair.polygon.some(
                                                                                                                                        (p: Point) => distance(p, pt) < 0.3
                                                                                                                                        )
                                                                                                                                        ) {
                                                                                                                                        return stair;
                                                                                                                                        }
                                                                                                                                        }

                                                                                                                                          return null;
                                                                                                                                          },
                                                                                                                                          []

                                                                                                                                          );

                                                                                                                                          return {
                                                                                                                                          draftPath,
                                                                                                                                          begin,
                                                                                                                                          move,
                                                                                                                                          finish,
                                                                                                                                          cancel,
                                                                                                                                          hitTest,
                                                                                                                                          };
                                                                                                                                          }