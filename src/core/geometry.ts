import type { Point, Wall, WallRectangle } from './types';

export const PX_PER_METER = 100;

export const distance = (a: Point, b: Point): number =>
  Math.hypot(b.x - a.x, b.y - a.y);

  export const normalize = (p: Point): Point => {
    const len = Math.hypot(p.x, p.y);
      return len === 0 ? { x: 0, y: 0 } : { x: p.x / len, y: p.y / len };
      };

      export const subtract = (a: Point, b: Point): Point => ({ x: a.x - b.x, y: a.y - b.y });
      export const add = (a: Point, b: Point): Point => ({ x: a.x + b.x, y: a.y + b.y });
      export const scale = (p: Point, f: number): Point => ({ x: p.x * f, y: p.y * f });
      export const dot = (a: Point, b: Point): number => a.x * b.x + a.y * b.y;

      export const getAngle = (start: Point, end: Point): number =>
        Math.atan2(end.y - start.y, end.x - start.x);

        export const snapAngle = (angle: number, tolerance = 0.1): number => {
          let a = angle % (2 * Math.PI);
            if (a < 0) a += 2 * Math.PI;
              const targets = [0, Math.PI / 2, Math.PI, (3 * Math.PI) / 2, 2 * Math.PI];
                for (const t of targets) {
                    let diff = Math.abs(a - t);
                        if (diff > Math.PI) diff = 2 * Math.PI - diff;
                            if (diff <= tolerance) return t === 2 * Math.PI ? 0 : t;
                              }
                                return angle;
                                };

                                export const closestPointOnSegment = (p: Point, a: Point, b: Point): Point => {
                                  const ab = subtract(b, a);
                                    const lenSq = dot(ab, ab);
                                      if (lenSq === 0) return { ...a };
                                        const t = Math.max(0, Math.min(1, dot(subtract(p, a), ab) / lenSq));
                                          return { x: a.x + t * ab.x, y: a.y + t * ab.y };
                                          };

                                          export function wallRectangle(wall: Wall): WallRectangle {
                                            const dir = normalize(subtract(wall.end, wall.start));
                                              const normal: Point = { x: -dir.y, y: dir.x };
                                                const sign = wall.normalSign ?? 1;
                                                  const offset = scale(normal, wall.thickness * sign);

                                                    const edgeStart = { ...wall.start };
                                                      const edgeEnd = { ...wall.end };
                                                        const oppositeStart = add(edgeStart, offset);
                                                          const oppositeEnd = add(edgeEnd, offset);

                                                            const corners = [edgeStart, edgeEnd, oppositeEnd, oppositeStart];
                                                              const faces = [
                                                                  { start: edgeStart, end: edgeEnd },
                                                                      { start: oppositeStart, end: oppositeEnd },
                                                                        ];

                                                                          return {
                                                                              start: wall.start,
                                                                                  end: wall.end,
                                                                                      thickness: wall.thickness,
                                                                                          corners,
                                                                                              faces,
                                                                                                };
                                                                                                }

                                                                                                export function segmentIntersection(
                                                                                                  p1: Point, p2: Point,
                                                                                                    p3: Point, p4: Point,
                                                                                                    ): Point | null {
                                                                                                      const d = (p2.x - p1.x) * (p4.y - p3.y) - (p2.y - p1.y) * (p4.x - p3.x);
                                                                                                        if (Math.abs(d) < 1e-9) return null;

                                                                                                          const ua = ((p4.x - p3.x) * (p1.y - p3.y) - (p4.y - p3.y) * (p1.x - p3.x)) / d;
                                                                                                            const ub = ((p2.x - p1.x) * (p1.y - p3.y) - (p2.y - p1.y) * (p1.x - p3.x)) / d;

                                                                                                              if (ua >= 0 && ua <= 1 && ub >= 0 && ub <= 1) {
                                                                                                                  return {
                                                                                                                        x: p1.x + ua * (p2.x - p1.x),
                                                                                                                              y: p1.y + ua * (p2.y - p1.y),
                                                                                                                                  };
                                                                                                                                    }

                                                                                                                                      return null;
                                                                                                                                      }

                                                                                                                                      export const screenToWorld = (
                                                                                                                                        sx: number, sy: number,
                                                                                                                                          cw: number, ch: number,
                                                                                                                                            zoom: number, ox: number, oy: number,
                                                                                                                                            ): Point => {
                                                                                                                                              const scaleFactor = PX_PER_METER * zoom;
                                                                                                                                                return {
                                                                                                                                                    x: (sx - cw / 2) / scaleFactor - ox,
                                                                                                                                                        y: (sy - ch / 2) / scaleFactor - oy,
                                                                                                                                                          };
                                                                                                                                                          };

                                                                                                                                                          export const worldToScreen = (
                                                                                                                                                            wx: number, wy: number,
                                                                                                                                                              cw: number, ch: number,
                                                                                                                                                                zoom: number, ox: number, oy: number,
                                                                                                                                                                ): Point => {
                                                                                                                                                                  const scaleFactor = PX_PER_METER * zoom;
                                                                                                                                                                    return {
                                                                                                                                                                        x: (wx + ox) * scaleFactor + cw / 2,
                                                                                                                                                                            y: (wy + oy) * scaleFactor + ch / 2,
                                                                                                                                                                              };
                                                                                                                                                                              };