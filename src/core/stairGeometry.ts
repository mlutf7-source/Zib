import type { Point, Stair } from './types';
import { distance } from './geometry';

export type StairHandleType = 'move' | 'rotate' | 'scaleWidth' | 'scaleLength';

export interface StairHandle {
  type: StairHandleType;
    point: Point;
      edgeIndex: number;
      }

      export function getStairCenter(stair: Stair): Point {
        if (stair.center) return stair.center;
          const poly = stair.polygon;
            if (!poly || poly.length === 0) return { x: 0, y: 0 };
              return {
                  x: poly.reduce((s, p) => s + p.x, 0) / poly.length,
                      y: poly.reduce((s, p) => s + p.y, 0) / poly.length,
                        };
                        }

                        export function getStairEdges(stair: Stair) {
                          const poly = stair.polygon;
                            return poly.map((p, i) => {
                                const q = poly[(i + 1) % poly.length];
                                    return { p, q, len: distance(p, q) };
                                      });
                                      }

                                      export function getStairHandles(stair: Stair): StairHandle[] {
                                        const center = getStairCenter(stair);
                                          const edges = getStairEdges(stair);
                                            if (edges.length === 0) return [];

                                              const longestEdge = edges.reduce((max, e) => (e.len > max.len ? e : max), edges[0]);

                                                const handles: StairHandle[] = [];

                                                  const topMid = {
                                                      x: (longestEdge.p.x + longestEdge.q.x) / 2,
                                                          y: (longestEdge.p.y + longestEdge.q.y) / 2,
                                                            };
                                                              const dirX = topMid.x - center.x;
                                                                const dirY = topMid.y - center.y;
                                                                  const lenDir = Math.hypot(dirX, dirY) || 1;
                                                                    handles.push({
                                                                        type: 'rotate',
                                                                            point: {
                                                                                  x: topMid.x + (dirX / lenDir) * 0.8,
                                                                                        y: topMid.y + (dirY / lenDir) * 0.8,
                                                                                            },
                                                                                                edgeIndex: -1,
                                                                                                  });

                                                                                                    edges.forEach((edge, idx) => {
                                                                                                        const mid = { x: (edge.p.x + edge.q.x) / 2, y: (edge.p.y + edge.q.y) / 2 };
                                                                                                            const isLong = edge.len > longestEdge.len * 0.8;
                                                                                                                handles.push({
                                                                                                                      type: isLong ? 'scaleLength' : 'scaleWidth',
                                                                                                                            point: mid,
                                                                                                                                  edgeIndex: idx,
                                                                                                                                      });
                                                                                                                                        });

                                                                                                                                          handles.push({ type: 'move', point: center, edgeIndex: -1 });
                                                                                                                                            return handles;
                                                                                                                                            }

                                                                                                                                            export function detectStairHandle(stair: Stair, pt: Point, tolerance = 0.8): StairHandle | null {
                                                                                                                                              const handles = getStairHandles(stair);
                                                                                                                                                let best: StairHandle | null = null;
                                                                                                                                                  let bestDist = tolerance;

                                                                                                                                                    for (const handle of handles) {
                                                                                                                                                        const d = distance(pt, handle.point);
                                                                                                                                                            if (d < bestDist) {
                                                                                                                                                                  bestDist = d;
                                                                                                                                                                        best = handle;
                                                                                                                                                                            }
                                                                                                                                                                              }

                                                                                                                                                                                if (!best && isPointInPolygon(pt, stair.polygon)) {
                                                                                                                                                                                    best = { type: 'move', point: getStairCenter(stair), edgeIndex: -1 };
                                                                                                                                                                                      }

                                                                                                                                                                                        return best;
                                                                                                                                                                                        }

                                                                                                                                                                                        export function isPointInPolygon(pt: Point, poly: Point[]): boolean {
                                                                                                                                                                                          let inside = false;
                                                                                                                                                                                            for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
                                                                                                                                                                                                const xi = poly[i].x, yi = poly[i].y;
                                                                                                                                                                                                    const xj = poly[j].x, yj = poly[j].y;
                                                                                                                                                                                                        const intersect = ((yi > pt.y) !== (yj > pt.y)) &&
                                                                                                                                                                                                              (pt.x < (xj - xi) * (pt.y - yi) / (yj - yi) + xi);
                                                                                                                                                                                                                  if (intersect) inside = !inside;
                                                                                                                                                                                                                    }
                                                                                                                                                                                                                      return inside;
                                                                                                                                                                                                                      }

                                                                                                                                                                                                                      export function moveStair(stair: Stair, dx: number, dy: number): Stair {
                                                                                                                                                                                                                        const newCenter = { x: getStairCenter(stair).x + dx, y: getStairCenter(stair).y + dy };
                                                                                                                                                                                                                          return {
                                                                                                                                                                                                                              ...stair,
                                                                                                                                                                                                                                  center: newCenter,
                                                                                                                                                                                                                                      polygon: stair.polygon.map(p => ({ x: p.x + dx, y: p.y + dy })),
                                                                                                                                                                                                                                        };
                                                                                                                                                                                                                                        }

                                                                                                                                                                                                                                        export function rotateStair(stair: Stair, angle: number): Stair {
                                                                                                                                                                                                                                          const center = getStairCenter(stair);
                                                                                                                                                                                                                                            const cos = Math.cos(angle);
                                                                                                                                                                                                                                              const sin = Math.sin(angle);
                                                                                                                                                                                                                                                return {
                                                                                                                                                                                                                                                    ...stair,
                                                                                                                                                                                                                                                        center,
                                                                                                                                                                                                                                                            rotation: (stair.rotation ?? 0) + angle,
                                                                                                                                                                                                                                                                polygon: stair.polygon.map(p => ({
                                                                                                                                                                                                                                                                      x: center.x + (p.x - center.x) * cos - (p.y - center.y) * sin,
                                                                                                                                                                                                                                                                            y: center.y + (p.x - center.x) * sin + (p.y - center.y) * cos,
                                                                                                                                                                                                                                                                                })),
                                                                                                                                                                                                                                                                                  };
                                                                                                                                                                                                                                                                                  }

                                                                                                                                                                                                                                                                                  export function scaleStair(stair: Stair, type: 'scaleWidth' | 'scaleLength', dx: number, dy: number): Stair {
                                                                                                                                                                                                                                                                                    const edges = getStairEdges(stair);
                                                                                                                                                                                                                                                                                      if (edges.length === 0) return stair;

                                                                                                                                                                                                                                                                                        const longestEdge = edges.reduce((max, e) => (e.len > max.len ? e : max), edges[0]);
                                                                                                                                                                                                                                                                                          const longDir = {
                                                                                                                                                                                                                                                                                              x: (longestEdge.q.x - longestEdge.p.x) / longestEdge.len,
                                                                                                                                                                                                                                                                                                  y: (longestEdge.q.y - longestEdge.p.y) / longestEdge.len,
                                                                                                                                                                                                                                                                                                    };
                                                                                                                                                                                                                                                                                                      const shortDir = { x: -longDir.y, y: longDir.x };

                                                                                                                                                                                                                                                                                                        const delta = type === 'scaleLength'
                                                                                                                                                                                                                                                                                                            ? dx * longDir.x + dy * longDir.y
                                                                                                                                                                                                                                                                                                                : dx * shortDir.x + dy * shortDir.y;

                                                                                                                                                                                                                                                                                                                  const newPoly = stair.polygon.map(p => {
                                                                                                                                                                                                                                                                                                                      if (type === 'scaleLength') {
                                                                                                                                                                                                                                                                                                                            return { x: p.x + longDir.x * delta * 0.5, y: p.y + longDir.y * delta * 0.5 };
                                                                                                                                                                                                                                                                                                                                } else {
                                                                                                                                                                                                                                                                                                                                      return { x: p.x + shortDir.x * delta * 0.5, y: p.y + shortDir.y * delta * 0.5 };
                                                                                                                                                                                                                                                                                                                                          }
                                                                                                                                                                                                                                                                                                                                            });

                                                                                                                                                                                                                                                                                                                                              return { ...stair, polygon: newPoly };
                                                                                                                                                                                                                                                                                                                                              }

                                                                                                                                                                                                                                                                                                                                              export function rebuildStairPolygon(stair: Stair): Stair {
                                                                                                                                                                                                                                                                                                                                                const center = getStairCenter(stair);
                                                                                                                                                                                                                                                                                                                                                  const angle = stair.rotation || 0;
                                                                                                                                                                                                                                                                                                                                                    const halfW = stair.width / 2;
                                                                                                                                                                                                                                                                                                                                                      const halfL = stair.totalLength / 2;

                                                                                                                                                                                                                                                                                                                                                        const cos = Math.cos(angle);
                                                                                                                                                                                                                                                                                                                                                          const sin = Math.sin(angle);

                                                                                                                                                                                                                                                                                                                                                            const localPoints = [
                                                                                                                                                                                                                                                                                                                                                                { x: -halfL, y: -halfW },
                                                                                                                                                                                                                                                                                                                                                                    { x: halfL, y: -halfW },
                                                                                                                                                                                                                                                                                                                                                                        { x: halfL, y: halfW },
                                                                                                                                                                                                                                                                                                                                                                            { x: -halfL, y: halfW },
                                                                                                                                                                                                                                                                                                                                                                              ];

                                                                                                                                                                                                                                                                                                                                                                                const polygon = localPoints.map(p => ({
                                                                                                                                                                                                                                                                                                                                                                                    x: center.x + p.x * cos - p.y * sin,
                                                                                                                                                                                                                                                                                                                                                                                        y: center.y + p.x * sin + p.y * cos,
                                                                                                                                                                                                                                                                                                                                                                                          }));

                                                                                                                                                                                                                                                                                                                                                                                            return { ...stair, center, polygon };
                                                                                                                                                                                                                                                                                                                                                                                            }