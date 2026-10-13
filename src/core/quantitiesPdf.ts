import jsPDF from 'jspdf';
import type { Wall, Column, Window, Door } from './types';
import { distance } from './geometry';

interface CalculationData {
  walls: Wall[];
    columns: Column[];
      windows: Window[];
        doors: Door[];
        }

        export function exportQuantitiesPDF({ walls, columns, windows, doors }: CalculationData) {
          const pdf = new jsPDF('portrait', 'mm', 'a4');
            pdf.text('تقرير الكميات - المسقط المعماري', 10, 10);
              pdf.setFontSize(10);

                let y = 20;
                  pdf.text('1. الجدران:', 10, y); y += 5;
                    walls.forEach((wall) => {
                        const len = distance(wall.start, wall.end);
                            pdf.text(`- ${wall.type === 'exterior' ? 'خارجي' : 'داخلي'} بسمك ${wall.thickness} م، طول ${len.toFixed(2)} م`, 15, y);
                                y += 5;
                                  });

                                    y += 5;
                                      pdf.text('2. الأعمدة:', 10, y); y += 5;
                                        columns.forEach((col) => {
                                            pdf.text(`- ${col.width} × ${col.length} م`, 15, y);
                                                y += 5;
                                                  });

                                                    y += 5;
                                                      pdf.text('3. النوافذ:', 10, y); y += 5;
                                                        windows.forEach((win) => {
                                                            pdf.text(`- عرض ${win.width} م، ارتفاع ${win.height} م`, 15, y);
                                                                y += 5;
                                                                  });

                                                                    y += 5;
                                                                      pdf.text('4. الأبواب:', 10, y); y += 5;
                                                                        doors.forEach((door) => {
                                                                            pdf.text(`- عرض ${door.width} م، ارتفاع ${door.height} م`, 15, y);
                                                                                y += 5;
                                                                                  });

                                                                                    pdf.save('تقرير_الكميات.pdf');
                                                                                    }