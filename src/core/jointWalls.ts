import type { Point, Wall } from './types';
import { distance } from './geometry';

const TOLERANCE = 0.05; // 5 سم

/**
 * دمج الجدران الخارجية المغلقة في كتلة واحدة.
  * @param walls جميع الجدران
   * @returns قائمة جديدة بجدران خارجية مدموجة الأطراف
    */
    export function jointExteriorWalls(walls: Wall[]): Wall[] {
      const exterior = walls.filter(w => w.type === 'exterior');
        if (exterior.length < 4) return walls;

          const snapped = exterior.map(w => ({ ...w, start: { ...w.start }, end: { ...w.end } }));

            // ضبط الأطراف المتطابقة
              for (let i = 0; i < snapped.length; i++) {
                  for (let j = i + 1; j < snapped.length; j++) {
                        const wi = snapped[i];
                              const wj = snapped[j];

                                    // إذا كانت نهاية wi قريبة من بداية wj
                                          if (distance(wi.end, wj.start) < TOLERANCE) {
                                                  wi.end = { ...wj.start };
                                                        }
                                                              // إذا كانت نهاية wi قريبة من نهاية wj
                                                                    if (distance(wi.end, wj.end) < TOLERANCE) {
                                                                            wi.end = { ...wj.end };
                                                                                  }
                                                                                        // إذا كانت بداية wi قريبة من بداية wj
                                                                                              if (distance(wi.start, wj.start) < TOLERANCE) {
                                                                                                      wi.start = { ...wj.start };
                                                                                                            }
                                                                                                                  // إذا كانت بداية wi قريبة من نهاية wj
                                                                                                                        if (distance(wi.start, wj.end) < TOLERANCE) {
                                                                                                                                wi.start = { ...wj.end };
                                                                                                                                      }
                                                                                                                                          }
                                                                                                                                            }

                                                                                                                                              // إعادة بناء الجدران الداخلية كما هي
                                                                                                                                                const interior = walls.filter(w => w.type === 'interior');
                                                                                                                                                  return [...snapped, ...interior];
                                                                                                                                                  }

                                                                                                                                                  /**
                                                                                                                                                   * التحقق مما إذا كانت الجدران الخارجية تشكل شكلاً مغلقاً.
                                                                                                                                                    */
                                                                                                                                                    export function isExteriorClosed(walls: Wall[]): boolean {
                                                                                                                                                      const exterior = walls.filter(w => w.type === 'exterior');
                                                                                                                                                        if (exterior.length < 4) return false;

                                                                                                                                                          const points: Point[] = [];
                                                                                                                                                            exterior.forEach(w => {
                                                                                                                                                                points.push(w.start, w.end);
                                                                                                                                                                  });

                                                                                                                                                                    // في الشكل المغلق البسيط، كل نقطة يجب أن تتكرر مرتين على الأقل
                                                                                                                                                                      for (const p of points) {
                                                                                                                                                                          const matches = points.filter(q => distance(p, q) < TOLERANCE).length;
                                                                                                                                                                              if (matches < 2) return false;
                                                                                                                                                                                }

                                                                                                                                                                                  return true;
                                                                                                                                                                                  }