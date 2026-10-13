import type { Point, Wall } from './types';
import type { RoomRegion, RegionType } from './regionTypes';
import { wallRectangle } from './geometry';
import { v4 as uuidv4 } from 'uuid';

// استخراج جميع الوجوه الداخلية للجدران (faces)
function getAllFaces(walls: Wall[]): { start: Point; end: Point; wallId: string }[] {
  const faces: { start: Point; end: Point; wallId: string }[] = [];
    for (const wall of walls) {
        const rect = wallRectangle(wall);
            for (const face of rect.faces) {
                  faces.push({ start: face.start, end: face.end, wallId: wall.id });
                      }
                        }
                          return faces;
                          }

                          // تصنيف الوجوه إلى أفقية ورأسية
                          function classifyFaces(faces: { start: Point; end: Point; wallId: string }[]) {
                            const horizontal: typeof faces = [];
                              const vertical: typeof faces = [];
                                for (const face of faces) {
                                    const angle = Math.atan2(face.end.y - face.start.y, face.end.x - face.start.x);
                                        if (Math.abs(angle) < 0.01 || Math.abs(angle - Math.PI) < 0.01 || Math.abs(angle + Math.PI) < 0.01) {
                                              horizontal.push(face);
                                                  } else {
                                                        vertical.push(face);
                                                            }
                                                              }
                                                                return { horizontal, vertical };
                                                                }

                                                                // إيجاد أقرب وجه أفقي فوق وتحت النقطة، وأقرب وجه رأسي يمين ويسار
                                                                function findBoundingFaces(
                                                                  pt: Point,
                                                                    horizontal: { start: Point; end: Point; wallId: string }[],
                                                                      vertical: { start: Point; end: Point; wallId: string }[],
                                                                      ) {
                                                                        let topFace: typeof horizontal[0] | null = null;
                                                                          let bottomFace: typeof horizontal[0] | null = null;
                                                                            let leftFace: typeof vertical[0] | null = null;
                                                                              let rightFace: typeof vertical[0] | null = null;

                                                                                // ترشيح الوجوه الأفقية التي تغطي النقطة أفقياً
                                                                                  const validHorizontal = horizontal.filter(face => {
                                                                                      const minX = Math.min(face.start.x, face.end.x);
                                                                                          const maxX = Math.max(face.start.x, face.end.x);
                                                                                              return pt.x >= minX && pt.x <= maxX;
                                                                                                });

                                                                                                  for (const face of validHorizontal) {
                                                                                                      const y = face.start.y;
                                                                                                          if (y < pt.y) {
                                                                                                                if (!topFace || y > topFace.start.y) topFace = face;
                                                                                                                    } else if (y > pt.y) {
                                                                                                                          if (!bottomFace || y < bottomFace.start.y) bottomFace = face;
                                                                                                                              }
                                                                                                                                }

                                                                                                                                  // ترشيح الوجوه الرأسية التي تغطي النقطة رأسياً
                                                                                                                                    const validVertical = vertical.filter(face => {
                                                                                                                                        const minY = Math.min(face.start.y, face.end.y);
                                                                                                                                            const maxY = Math.max(face.start.y, face.end.y);
                                                                                                                                                return pt.y >= minY && pt.y <= maxY;
                                                                                                                                                  });

                                                                                                                                                    for (const face of validVertical) {
                                                                                                                                                        const x = face.start.x;
                                                                                                                                                            if (x < pt.x) {
                                                                                                                                                                  if (!leftFace || x > leftFace.start.x) leftFace = face;
                                                                                                                                                                      } else if (x > pt.x) {
                                                                                                                                                                            if (!rightFace || x < rightFace.start.x) rightFace = face;
                                                                                                                                                                                }
                                                                                                                                                                                  }

                                                                                                                                                                                    return { topFace, bottomFace, leftFace, rightFace };
                                                                                                                                                                                    }

                                                                                                                                                                                    // حساب نقاط تقاطع الخطوط
                                                                                                                                                                                    function lineIntersection(a1: Point, a2: Point, b1: Point, b2: Point): Point | null {
                                                                                                                                                                                      const d = (a2.x - a1.x) * (b2.y - b1.y) - (a2.y - a1.y) * (b2.x - b1.x);
                                                                                                                                                                                        if (Math.abs(d) < 1e-9) return null;
                                                                                                                                                                                          const ua = ((b2.x - b1.x) * (a1.y - b1.y) - (b2.y - b1.y) * (a1.x - b1.x)) / d;
                                                                                                                                                                                            const ub = ((a2.x - a1.x) * (a1.y - b1.y) - (a2.y - a1.y) * (a1.x - b1.x)) / d;
                                                                                                                                                                                              if (ua >= 0 && ua <= 1 && ub >= 0 && ub <= 1) {
                                                                                                                                                                                                  return { x: a1.x + ua * (a2.x - a1.x), y: a1.y + ua * (a2.y - a1.y) };
                                                                                                                                                                                                    }
                                                                                                                                                                                                      return null;
                                                                                                                                                                                                      }

                                                                                                                                                                                                      // التحقق إذا كانت النقطة داخل المضلع
                                                                                                                                                                                                      function isPointInPolygon(pt: Point, polygon: Point[]): boolean {
                                                                                                                                                                                                        let inside = false;
                                                                                                                                                                                                          for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
                                                                                                                                                                                                              const xi = polygon[i].x, yi = polygon[i].y;
                                                                                                                                                                                                                  const xj = polygon[j].x, yj = polygon[j].y;
                                                                                                                                                                                                                      const intersect = ((yi > pt.y) !== (yj > pt.y)) &&
                                                                                                                                                                                                                            (pt.x < (xj - xi) * (pt.y - yi) / (yj - yi) + xi);
                                                                                                                                                                                                                                if (intersect) inside = !inside;
                                                                                                                                                                                                                                  }
                                                                                                                                                                                                                                    return inside;
                                                                                                                                                                                                                                    }

                                                                                                                                                                                                                                    // اكتشاف منطقة الغرفة المحيطة بالنقطة
                                                                                                                                                                                                                                    export function detectRoomRegion(pt: Point, walls: Wall[], type: RegionType): RoomRegion | null {
                                                                                                                                                                                                                                      const faces = getAllFaces(walls);
                                                                                                                                                                                                                                        const { horizontal, vertical } = classifyFaces(faces);
                                                                                                                                                                                                                                          const { topFace, bottomFace, leftFace, rightFace } = findBoundingFaces(pt, horizontal, vertical);

                                                                                                                                                                                                                                            if (!topFace || !bottomFace || !leftFace || !rightFace) return null;

                                                                                                                                                                                                                                              const topLeft = lineIntersection(topFace.start, topFace.end, leftFace.start, leftFace.end);
                                                                                                                                                                                                                                                const topRight = lineIntersection(topFace.start, topFace.end, rightFace.start, rightFace.end);
                                                                                                                                                                                                                                                  const bottomRight = lineIntersection(bottomFace.start, bottomFace.end, rightFace.start, rightFace.end);
                                                                                                                                                                                                                                                    const bottomLeft = lineIntersection(bottomFace.start, bottomFace.end, leftFace.start, leftFace.end);

                                                                                                                                                                                                                                                      if (!topLeft || !topRight || !bottomRight || !bottomLeft) return null;

                                                                                                                                                                                                                                                        const polygon = [topLeft, topRight, bottomRight, bottomLeft];

                                                                                                                                                                                                                                                          // ✅ التحقق النهائي: النقطة يجب أن تكون داخل المضلع
                                                                                                                                                                                                                                                            if (!isPointInPolygon(pt, polygon)) return null;

                                                                                                                                                                                                                                                              let area = 0;
                                                                                                                                                                                                                                                                for (let i = 0; i < polygon.length; i++) {
                                                                                                                                                                                                                                                                    const j = (i + 1) % polygon.length;
                                                                                                                                                                                                                                                                        area += polygon[i].x * polygon[j].y - polygon[j].x * polygon[i].y;
                                                                                                                                                                                                                                                                          }
                                                                                                                                                                                                                                                                            area = Math.abs(area) / 2;

                                                                                                                                                                                                                                                                              const wallIds = Array.from(new Set([
                                                                                                                                                                                                                                                                                  topFace.wallId,
                                                                                                                                                                                                                                                                                      bottomFace.wallId,
                                                                                                                                                                                                                                                                                          leftFace.wallId,
                                                                                                                                                                                                                                                                                              rightFace.wallId,
                                                                                                                                                                                                                                                                                                ]));

                                                                                                                                                                                                                                                                                                  return {
                                                                                                                                                                                                                                                                                                      id: uuidv4(),
                                                                                                                                                                                                                                                                                                          type,
                                                                                                                                                                                                                                                                                                              polygon,
                                                                                                                                                                                                                                                                                                                  area,
                                                                                                                                                                                                                                                                                                                      wallIds,
                                                                                                                                                                                                                                                                                                                        };
                                                                                                                                                                                                                                                                                                                        }