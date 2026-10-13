import type { Wall, Point } from '../../../core/types';
import {
  distance,
    PX_PER_METER,
      segmentIntersection,
      } from '../../../core/geometry';
      import { norm } from './geometryHelpers';

      export interface CornerGeom {
        O: Point;
          center: Point;
            tangentA: Point;
              tangentB: Point;
                radius: number;
                  innerRadius: number;
                    startAngle: number;
                      endAngle: number;
                        ccw: boolean;
                        }

                        export function computeCorner(
                          wallA: Wall,
                            wallB: Wall,
                              radiusWorld: number,
                                toScreen: (p: Point) => Point,
                                  zoom: number,
                                    scale: number,
                                    ): CornerGeom | null {
                                      // ═══════════════════════════════════════════════
                                        // 1) التحقق من صحة المدخلات
                                          // ═══════════════════════════════════════════════
                                            if (
                                                !Number.isFinite(radiusWorld) ||
                                                    radiusWorld <= 0 ||
                                                        !Number.isFinite(zoom) ||
                                                            zoom <= 0 ||
                                                                !Number.isFinite(scale) ||
                                                                    scale <= 0
                                                                      ) {
                                                                          return null;
                                                                            }

                                                                              const worldP = segmentIntersection(
                                                                                  wallA.start,
                                                                                      wallA.end,
                                                                                          wallB.start,
                                                                                              wallB.end,
                                                                                                );
                                                                                                  if (!worldP) return null;

                                                                                                    const P = toScreen(worldP);
                                                                                                      const factor = PX_PER_METER * zoom * scale;

                                                                                                        // ═══════════════════════════════════════════════
                                                                                                          // 2) اتجاهات "بعيداً عن الركن" لكل جدار
                                                                                                            // ═══════════════════════════════════════════════
                                                                                                              const sA = toScreen(wallA.start);
                                                                                                                const eA = toScreen(wallA.end);
                                                                                                                  const sB = toScreen(wallB.start);
                                                                                                                    const eB = toScreen(wallB.end);

                                                                                                                      const farA = distance(sA, P) > distance(eA, P) ? sA : eA;
                                                                                                                        const farB = distance(sB, P) > distance(eB, P) ? sB : eB;

                                                                                                                          const uA = norm({ x: farA.x - P.x, y: farA.y - P.y });
                                                                                                                            const uB = norm({ x: farB.x - P.x, y: farB.y - P.y });

                                                                                                                              const perpA = { x: -uA.y, y: uA.x };
                                                                                                                                const perpB = { x: -uB.y, y: uB.x };

                                                                                                                                  const dotA = (farB.x - P.x) * perpA.x + (farB.y - P.y) * perpA.y;
                                                                                                                                    const dotB = (farA.x - P.x) * perpB.x + (farA.y - P.y) * perpB.y;

                                                                                                                                      const nA = dotA > 0 ? { x: -perpA.x, y: -perpA.y } : perpA;
                                                                                                                                        const nB = dotB > 0 ? { x: -perpB.x, y: -perpB.y } : perpB;

                                                                                                                                          // ═══════════════════════════════════════════════
                                                                                                                                            // 3) ✅ نصف السماكة (متوافق مع drawWall + getWallPolygon)
                                                                                                                                              // ═══════════════════════════════════════════════
                                                                                                                                                const halfA = wallA.thickness * factor;
                                                                                                                                                  const halfB = wallB.thickness * factor;

                                                                                                                                                    if (
                                                                                                                                                        !Number.isFinite(halfA) ||
                                                                                                                                                            !Number.isFinite(halfB) ||
                                                                                                                                                                halfA <= 0 ||
                                                                                                                                                                    halfB <= 0
                                                                                                                                                                      ) {
                                                                                                                                                                          return null;
                                                                                                                                                                            }

                                                                                                                                                                              const det = nA.x * nB.y - nA.y * nB.x;
                                                                                                                                                                                if (Math.abs(det) < 1e-7) return null;

                                                                                                                                                                              // ✅ قيد واحد فقط: لا يتجاوز طول الجدارين
                                                                                                                                                                              const maxRByLength =
                                                                                                                                                                                Math.min(distance(P, farA), distance(P, farB)) * 0.9;
                                                                                                                                                                                const maxR = maxRByLength;

                                                                                                                                                                                const thickness = Math.max(wallA.thickness, wallB.thickness) * factor;
                                                                                                                                                                                  const requestedInnerR = radiusWorld * factor;
                                                                                                                                                                                    const R = Math.min(requestedInnerR + thickness, maxR);
                                                                                                                                                                                                    if (!Number.isFinite(R) || R < 1) return null;

                                                                                                                                                                                                      // ═══════════════════════════════════════════════
                                                                                                                                                                                                        // 5) نقطة الركن الخارجي O
                                                                                                                                                                                                          // ═══════════════════════════════════════════════
                                                                                                                                                                                                            const O = {
                                                                                                                                                                                                                x: P.x + (halfA * nB.y - nA.y * halfB) / det,
                                                                                                                                                                                                                    y: P.y + (nA.x * halfB - halfA * nB.x) / det,
                                                                                                                                                                                                                      };

                                                                                                                                                                                                                        // ═══════════════════════════════════════════════
                                                                                                                                                                                                                          // 6) مركز القوس C (على بُعد R من الأوجه الخارجية)
                                                                                                                                                                                                                            // ═══════════════════════════════════════════════
                                                                                                                                                                                                                              const hA = halfA - R;
                                                                                                                                                                                                                                const hB = halfB - R;
                                                                                                                                                                                                                                  const C = {
                                                                                                                                                                                                                                      x: P.x + (hA * nB.y - nA.y * hB) / det,
                                                                                                                                                                                                                                          y: P.y + (nA.x * hB - hA * nB.x) / det,
                                                                                                                                                                                                                                            };

                                                                                                                                                                                                                                              // ═══════════════════════════════════════════════
                                                                                                                                                                                                                                                // 7) نقاط التماس على الأوجه الخارجية
                                                                                                                                                                                                                                                  // ═══════════════════════════════════════════════
                                                                                                                                                                                                                                                    const tangentA = { x: C.x + nA.x * R, y: C.y + nA.y * R };
                                                                                                                                                                                                                                                      const tangentB = { x: C.x + nB.x * R, y: C.y + nB.y * R };

                                                                                                                                                                                                                                                        // ═══════════════════════════════════════════════
                                                                                                                                                                                                                                                          // 8) زوايا القوس
                                                                                                                                                                                                                                                            // ═══════════════════════════════════════════════
                                                                                                                                                                                                                                                              const startAngle = Math.atan2(tangentA.y - C.y, tangentA.x - C.x);
                                                                                                                                                                                                                                                                const endAngle = Math.atan2(tangentB.y - C.y, tangentB.x - C.x);

                                                                                                                                                                                                                                                                  let diff = endAngle - startAngle;
                                                                                                                                                                                                                                                                    while (diff > Math.PI) diff -= Math.PI * 2;
                                                                                                                                                                                                                                                                      while (diff < -Math.PI) diff += Math.PI * 2;

                                                                                                                                                                                                                                                                        // ═══════════════════════════════════════════════
                                                                                                                                                                                                                                                                          // 9) نصف القطر الداخلي (للقوس الداخلي)
                                                                                                                                                                                                                                                                            // ═══════════════════════════════════════════════
                                                                                                                                                                                                                                                                              const thicknessA = wallA.thickness * factor;
                                                                                                                                                                                                                                                                                const thicknessB = wallB.thickness * factor;
                                                                                                                                                                                                                                                                                  const innerRadius = Math.max(1, R - Math.max(thicknessA, thicknessB));

                                                                                                                                                                                                                                                                                    return {
                                                                                                                                                                                                                                                                                        O,
                                                                                                                                                                                                                                                                                            center: C,
                                                                                                                                                                                                                                                                                                tangentA,
                                                                                                                                                                                                                                                                                                    tangentB,
                                                                                                                                                                                                                                                                                                        radius: R,
                                                                                                                                                                                                                                                                                                            innerRadius,
                                                                                                                                                                                                                                                                                                                startAngle,
                                                                                                                                                                                                                                                                                                                    endAngle,
                                                                                                                                                                                                                                                                                                                        ccw: diff < 0,
                                                                                                                                                                                                                                                                                                                          };
                                                                                                                                                                                                                                                                                                                          }
// ✅ Hit-test: هل النقطة داخل منطقة القوس للركن المقوس؟
export function hitTestRoundedCorner(
  pt: Point,
  wallA: Wall,
  wallB: Wall,
  radiusWorld: number,
  zoom: number,
  scale: number,
  toScreen: (p: Point) => Point,
): boolean {
  const g = computeCorner(wallA, wallB, radiusWorld, toScreen, zoom, scale);
  if (!g) return false;
  const { O, center: C, tangentA: TA, tangentB: TB, radius: R, startAngle, endAngle, ccw } = g;
  // تحويل النقطة إلى إحداثيات الشاشة
  const S = toScreen(pt);
  // المسافة من مركز القوس
  const dist = Math.hypot(S.x - C.x, S.y - C.y);
  // يجب أن تكون قريبة من القوس (داخل شريحة بعرض ~15px)
  if (dist > R + 15 || dist < R - 15) return false;
  // فحص الزاوية: هل النقطة ضمن نطاق القوس؟
  const ptAngle = Math.atan2(S.y - C.y, S.x - C.x);
  // تطبيع الفرق
  let diff = ptAngle - startAngle;
  while (diff > Math.PI) diff -= Math.PI * 2;
  while (diff < -Math.PI) diff += Math.PI * 2;
  const arcSpan = (() => {
    let d = endAngle - startAngle;
    while (d > Math.PI) d -= Math.PI * 2;
    while (d < -Math.PI) d += Math.PI * 2;
    return d;
  })();
  // إذا كان ccw (diff<0 originally), فالقوس يذهب في الاتجاه السلبي
  if (ccw) {
    // القوس من startAngle إلى endAngle في الاتجاه السلبي
    return diff <= 0 && diff >= arcSpan;
  } else {
    // القوس في الاتجاه الموجب
    return diff >= 0 && diff <= arcSpan;
  }
}
