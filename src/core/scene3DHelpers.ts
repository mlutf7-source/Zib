import type { Wall, Point } from './types';

/**
 * تحويل جدار ثنائي الأبعاد إلى إحداثيات ثلاثية الأبعاد
  * الاستراتيجية:
   *   app.x → three.x
    *   app.y → three.z
     *   height → three.y
      */
      export interface Wall3D {
        position: [number, number, number];   // مركز الجدار
          size: [number, number, number];       // [طول، ارتفاع، سماكة]
            rotationY: number;                    // زاوية الدوران حول المحور الرأسي
            }

            export function wallTo3D(wall: Wall, height: number): Wall3D {
              const dx = wall.end.x - wall.start.x;
                const dy = wall.end.y - wall.start.y;
                  const len = Math.hypot(dx, dy) || 1;

                    // منتصف الجدار (نقطة على الحافة)
                      const midX = (wall.start.x + wall.end.x) / 2;
                        const midY = (wall.start.y + wall.end.y) / 2;

                          // الاتجاه العمودي (normal) على الجدار في مستوى XY
                            const nx = -dy / len;
                              const ny = dx / len;
                                const sign = wall.normalSign ?? 1;

                                  // إزاحة بمقدار نصف السماكة باتجاه جسم الجدار (normalSign)
                                    const offX = nx * (wall.thickness / 2) * sign;
                                      const offY = ny * (wall.thickness / 2) * sign;

                                        // زاوية الدوران حول Y (three.js)
                                          const rotationY = Math.atan2(-dy, dx);

                                            return {
                                                position: [midX + offX, height / 2, midY + offY],
                                                    size: [len, height, wall.thickness],
                                                        rotationY,
                                                          };
                                                          }

                                                          /**
                                                           * حساب مركز المبنى (لتمركز الكاميرا)
                                                            */
                                                            export function computeBuildingCenter(walls: Wall[]): Point {
                                                              if (walls.length === 0) return { x: 0, y: 0 };
                                                                let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
                                                                  walls.forEach(w => {
                                                                      minX = Math.min(minX, w.start.x, w.end.x);
                                                                          maxX = Math.max(maxX, w.start.x, w.end.x);
                                                                              minY = Math.min(minY, w.start.y, w.end.y);
                                                                                  maxY = Math.max(maxY, w.start.y, w.end.y);
                                                                                    });
                                                                                      return { x: (minX + maxX) / 2, y: (minY + maxY) / 2 };
                                                                                      }

                                                                                      /**
                                                                                       * حساب أكبر بُعد للمبنى (لتحديد مسافة الكاميرا)
                                                                                        */
                                                                                        export function computeBuildingSize(walls: Wall[]): number {
                                                                                          if (walls.length === 0) return 10;
                                                                                            let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
                                                                                              walls.forEach(w => {
                                                                                                  minX = Math.min(minX, w.start.x, w.end.x);
                                                                                                      maxX = Math.max(maxX, w.start.x, w.end.x);
                                                                                                          minY = Math.min(minY, w.start.y, w.end.y);
                                                                                                              maxY = Math.max(maxY, w.start.y, w.end.y);
                                                                                                                });
                                                                                                                  return Math.max(maxX - minX, maxY - minY);
                                                                                                                  }