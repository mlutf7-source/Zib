import type { Wall } from './types';
import { distance } from './geometry';

/**
 * حساب المسافة الصافية بين جدارين متقابلين.
  * تُحسب من الوجه الداخلي لكل جدار.
   */
   export function netDistanceBetween(wallA: Wall, wallB: Wall): number {
     // المسافة بين خطي المنتصف
       const centerDistance = distance(
           { x: (wallA.start.x + wallA.end.x) / 2, y: (wallA.start.y + wallA.end.y) / 2 },
               { x: (wallB.start.x + wallB.end.x) / 2, y: (wallB.start.y + wallB.end.y) / 2 },
                 );

                   // خصم نصف سماكة كل جدار
                     return centerDistance - wallA.thickness / 2 - wallB.thickness / 2;
                     }

                     /**
                      * حساب الأبعاد الصافية لمنطقة مستطيلة محددة بأربعة جدران.
                       * الجدران يجب أن تكون مرتبة: أمامي، خلفي، يسار، يمين.
                        */
                        export function netAreaDimensions(walls: Wall[]): { width: number; length: number; area: number } | null {
                          if (walls.length < 4) return null;

                            // نفترض أن الجدران الأفقية والعمودية تحدد المساحة
                              const horizontal = walls.filter(w => Math.abs(w.start.y - w.end.y) < 0.01);
                                const vertical = walls.filter(w => Math.abs(w.start.x - w.end.x) < 0.01);

                                  if (horizontal.length < 2 || vertical.length < 2) return null;

                                    // ترتيب الجدران حسب موقعها
                                      horizontal.sort((a, b) => a.start.y - b.start.y);
                                        vertical.sort((a, b) => a.start.x - b.start.x);

                                          const width = netDistanceBetween(vertical[0], vertical[vertical.length - 1]);
                                            const length = netDistanceBetween(horizontal[0], horizontal[horizontal.length - 1]);

                                              return {
                                                  width,
                                                      length,
                                                          area: width * length,
                                                            };
                                                            }