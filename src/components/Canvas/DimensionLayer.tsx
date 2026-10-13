import React from 'react';
import type { CanvasView } from '../../core/types';
import type { Dimension } from '../../core/dimensionTypes';
import { worldToScreen, distance, getAngle } from '../../core/geometry';

interface Props {
  dimensions: Dimension[];
    view: CanvasView;
      width: number;
        height: number;
          fontSize: number;
            selectedId?: string | null;
              scale?: number; // ✅ إضافة scale
              }

              export const DimensionLayer: React.FC<Props> = React.memo(({ dimensions, view, width, height, fontSize, selectedId, scale = 1 }) => {
                const canvasRef = React.useRef<HTMLCanvasElement>(null);

                  React.useEffect(() => {
                      const canvas = canvasRef.current;
                          if (!canvas) return;
                              const ctx = canvas.getContext('2d');
                                  if (!ctx) return;

                                      canvas.width = width * scale; // ✅
                                          canvas.height = height * scale; // ✅
                                              ctx.scale(scale, scale); // ✅

                                                  ctx.clearRect(0, 0, width, height);

                                                      dimensions.forEach(dim => {
                                                            const angle = getAngle(dim.start, dim.end);
                                                                  const normal = { x: -Math.sin(angle), y: Math.cos(angle) };

                                                                        const startWorld = {
                                                                                x: dim.start.x + normal.x * dim.offset,
                                                                                        y: dim.start.y + normal.y * dim.offset,
                                                                                              };
                                                                                                    const endWorld = {
                                                                                                            x: dim.end.x + normal.x * dim.offset,
                                                                                                                    y: dim.end.y + normal.y * dim.offset,
                                                                                                                          };

                                                                                                                                const s = worldToScreen(startWorld.x, startWorld.y, width, height, view.zoom, view.offsetX, view.offsetY);
                                                                                                                                      const e = worldToScreen(endWorld.x, endWorld.y, width, height, view.zoom, view.offsetX, view.offsetY);

                                                                                                                                            const isSelected = selectedId === dim.id;
                                                                                                                                                  ctx.strokeStyle = isSelected ? '#0a0' : '#cccccc';
                                                                                                                                                        ctx.lineWidth = 0.5;

                                                                                                                                                              const dx = e.x - s.x;
                                                                                                                                                                    const dy = e.y - s.y;
                                                                                                                                                                          const len = Math.hypot(dx, dy) || 1;
                                                                                                                                                                                const ux = dx / len;
                                                                                                                                                                                      const uy = dy / len;

                                                                                                                                                                                            const mid = { x: (s.x + e.x) / 2, y: (s.y + e.y) / 2 };
                                                                                                                                                                                                  const text = distance(dim.start, dim.end).toFixed(2);

// ✅ حد أدنى 8 بكسل: يمنع اختفاء الأرقام عند التصغير الشديد ويحافظ على الوضوح
const dimFontSize = Math.max(8, fontSize * view.zoom);
ctx.font = `bold ${dimFontSize}px sans-serif`;                                                                                                                                                         ctx.textAlign = 'center';
                                                                                                                                                                                                                    ctx.textBaseline = 'middle';
                                                                                                                                                                                                                          const textWidth = ctx.measureText(text).width;

                                                                                                                                                                                                                                const stop1 = { x: mid.x - ux * (textWidth / 2 + 4), y: mid.y - uy * (textWidth / 2 + 4) };
                                                                                                                                                                                                                                      ctx.beginPath();
                                                                                                                                                                                                                                            ctx.moveTo(s.x, s.y);
                                                                                                                                                                                                                                                  ctx.lineTo(stop1.x, stop1.y);
                                                                                                                                                                                                                                                        ctx.stroke();

                                                                                                                                                                                                                                                              const stop2 = { x: mid.x + ux * (textWidth / 2 + 4), y: mid.y + uy * (textWidth / 2 + 4) };
                                                                                                                                                                                                                                                                    ctx.beginPath();
                                                                                                                                                                                                                                                                          ctx.moveTo(stop2.x, stop2.y);
                                                                                                                                                                                                                                                                                ctx.lineTo(e.x, e.y);
                                                                                                                                                                                                                                                                                      ctx.stroke();

                                                                                                                                                                                                                                                                                            ctx.fillStyle = '#0066cc';
                                                                                                                                                                                                                                                                                                  ctx.fillText(text, mid.x, mid.y);

                                                                                                                                                                                                                                                                                                        if (isSelected) {
                                                                                                                                                                                                                                                                                                                ctx.fillStyle = '#06f';
                                                                                                                                                                                                                                                                                                                        [s, e].forEach(p => ctx.fillRect(p.x - 6, p.y - 6, 12, 12));
                                                                                                                                                                                                                                                                                                                              }
                                                                                                                                                                                                                                                                                                                                  });
                                                                                                                                                                                                                                                                                                                                    }, [dimensions, view, width, height, fontSize, selectedId, scale]); // ✅ إضافة scale

                                                                                                                                                                                                                                                                                                                                      return (
                                                                                                                                                                                                                                                                                                                                          <canvas
                                                                                                                                                                                                                                                                                                                                                ref={canvasRef}
                                                                                                                                                                                                                                                                                                                                                      width={width * scale} // ✅
                                                                                                                                                                                                                                                                                                                                                            height={height * scale} // ✅
                                                                                                                                                                                                                                                                                                                                                                  style={{ position: 'absolute', top: 0, left: 0, pointerEvents: 'none', display: 'block' }}
                                                                                                                                                                                                                                                                                                                                                                      />
                                                                                                                                                                                                                                                                                                                                                                        );
                                                                                                                                                                                                                                                                                                                                                                        });