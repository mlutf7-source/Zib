import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { worldToScreen } from './geometry';
import type { ClipFrame, CanvasView } from './types';

export async function exportClipFrameToPDF(
  container: HTMLElement,
    clipFrame: ClipFrame,
      view: CanvasView
      ) {
        // 1. إخفاء الشبكة مؤقتاً (الآن الـ id موجود في CanvasRenderer)
          const canvases = container.querySelectorAll('canvas');
            const originalDisplay: string[] = [];
              canvases.forEach((c) => {
                  originalDisplay.push(c.style.display);
                      if (c.id === 'grid-canvas') {
                            c.style.display = 'none';
                                }
                                  });

                                    // 2. التقاط الصورة بدقة عالية جداً
                                      const canvas = await html2canvas(container, {
                                          scale: 4,
                                              useCORS: true,
                                                  backgroundColor: '#ffffff',
                                                    });

                                                      // 3. استعادة إظهار الشبكة
                                                        canvases.forEach((c, i) => {
                                                            c.style.display = originalDisplay[i];
                                                              });

                                                                // 4. حساب منطقة الكليشة في إحداثيات الشاشة
                                                                  const width = container.clientWidth;
                                                                    const height = container.clientHeight;

                                                                      const corners = [
                                                                          { x: clipFrame.x, y: clipFrame.y },
                                                                              { x: clipFrame.x + clipFrame.width, y: clipFrame.y },
                                                                                  { x: clipFrame.x + clipFrame.width, y: clipFrame.y + clipFrame.height },
                                                                                      { x: clipFrame.x, y: clipFrame.y + clipFrame.height },
                                                                                        ].map(p => worldToScreen(p.x, p.y, width, height, view.zoom, view.offsetX, view.offsetY));

                                                                                          const minX = Math.min(...corners.map(c => c.x));
                                                                                            const maxX = Math.max(...corners.map(c => c.x));
                                                                                              const minY = Math.min(...corners.map(c => c.y));
                                                                                                const maxY = Math.max(...corners.map(c => c.y));

                                                                                                  const cropW = Math.max(1, maxX - minX);
                                                                                                    const cropH = Math.max(1, maxY - minY);

                                                                                                      // 5. اقتصاص الصورة من منطقة الكليشة
                                                                                                        const croppedCanvas = document.createElement('canvas');
                                                                                                          croppedCanvas.width = cropW * 4;
                                                                                                            croppedCanvas.height = cropH * 4;
                                                                                                              const ctx = croppedCanvas.getContext('2d');
                                                                                                                if (!ctx) return;

                                                                                                                  ctx.drawImage(
                                                                                                                      canvas,
                                                                                                                          minX * 4, minY * 4, cropW * 4, cropH * 4,
                                                                                                                              0, 0, cropW * 4, cropH * 4
                                                                                                                                );

                                                                                                                                  const imgData = croppedCanvas.toDataURL('image/png');

                                                                                                                                    // 6. إنشاء PDF بحجم A3 أفقي
                                                                                                                                      const pdf = new jsPDF('landscape', 'mm', 'a3');
                                                                                                                                        const pageWidth = pdf.internal.pageSize.getWidth();
                                                                                                                                          const pageHeight = pdf.internal.pageSize.getHeight();

                                                                                                                                            const imgWidth = pageWidth;
                                                                                                                                              const imgHeight = (croppedCanvas.height * pageWidth) / croppedCanvas.width;

                                                                                                                                                if (imgHeight <= pageHeight) {
                                                                                                                                                    pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
                                                                                                                                                      } else {
                                                                                                                                                          const scaledWidth = (croppedCanvas.width * pageHeight) / croppedCanvas.height;
                                                                                                                                                              pdf.addImage(imgData, 'PNG', (pageWidth - scaledWidth) / 2, 0, scaledWidth, pageHeight);
                                                                                                                                                                }

                                                                                                                                                                  pdf.save('المسقط_المعماري.pdf');
                                                                                                                                                                  }