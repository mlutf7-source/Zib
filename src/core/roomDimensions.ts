import type { Wall, Point } from './types';

export interface RoomDimensions {
  width: number;
    length: number;
      center: Point;
      }

      /**
       * تحليل الغرف المغلقة من الجدران.
        * هذه نسخة مبسطة تعمل مع المستطيلات المتعامدة.
         */
         export function extractRooms(walls: Wall[]): RoomDimensions[] {
           const horizontal = walls.filter(w => Math.abs(w.start.y - w.end.y) < 0.01);
             const vertical = walls.filter(w => Math.abs(w.start.x - w.end.x) < 0.01);

               if (horizontal.length < 2 || vertical.length < 2) return [];

                 const yValues = [...new Set(horizontal.flatMap(w => [w.start.y, w.end.y]))].sort((a, b) => a - b);
                   const xValues = [...new Set(vertical.flatMap(w => [w.start.x, w.end.x]))].sort((a, b) => a - b);

                     const rooms: RoomDimensions[] = [];

                       for (let i = 0; i < xValues.length - 1; i++) {
                           for (let j = 0; j < yValues.length - 1; j++) {
                                 const x1 = xValues[i];
                                       const x2 = xValues[i + 1];
                                             const y1 = yValues[j];
                                                   const y2 = yValues[j + 1];

                                                         const width = x2 - x1;
                                                               const length = y2 - y1;

                                                                     // تجاهل الفتحات الصغيرة جداً
                                                                           if (width > 0.3 && length > 0.3) {
                                                                                   rooms.push({
                                                                                             width,
                                                                                                       length,
                                                                                                                 center: { x: (x1 + x2) / 2, y: (y1 + y2) / 2 },
                                                                                                                         });
                                                                                                                               }
                                                                                                                                   }
                                                                                                                                     }

                                                                                                                                       return rooms;
                                                                                                                                       }