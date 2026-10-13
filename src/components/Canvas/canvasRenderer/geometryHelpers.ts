import type { Wall, Point } from '../../../core/types';

/** اختبار نقطة داخل مضلّع (ray casting) */
export function pointInPolygon(pt: Point, poly: Point[]): boolean {
  let inside = false;
    for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
        const a = poly[i], b = poly[j];
            if (
                  (a.y > pt.y) !== (b.y > pt.y) &&
                        pt.x < ((b.x - a.x) * (pt.y - a.y)) / (b.y - a.y) + a.x
                            ) {
                                  inside = !inside;
                                      }
                                        }
                                          return inside;
                                          }

                                          /** تطبيع متجه */
                                          export function norm(v: Point): Point {
                                            const l = Math.hypot(v.x, v.y) || 1;
                                              return { x: v.x / l, y: v.y / l };
                                              }

                                              /** زوايا مستطيل الجدار (screen) */
                                              export function getWallPolygon(
                                                wall: Wall,
                                                  toScreen: (p: Point) => Point,
                                                  ): Point[] {
                                                    const dx = wall.end.x - wall.start.x;
                                                      const dy = wall.end.y - wall.start.y;
                                                        const len = Math.hypot(dx, dy) || 1;
                                                          const nx = -dy / len, ny = dx / len;
                                                            const half = wall.thickness / 2;
                                                              const sign = wall.normalSign ?? 1;
                                                                const ox = nx * half * sign, oy = ny * half * sign;
                                                                  return [
                                                                      toScreen({ x: wall.start.x + ox, y: wall.start.y + oy }),
                                                                          toScreen({ x: wall.end.x + ox, y: wall.end.y + oy }),
                                                                              toScreen({ x: wall.end.x - ox, y: wall.end.y - oy }),
                                                                                  toScreen({ x: wall.start.x - ox, y: wall.start.y - oy }),
                                                                                    ];
                                                                                    }