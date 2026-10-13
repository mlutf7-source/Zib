import React from 'react';
import type { NorthArrow, CanvasView } from '../../core/types';
import { worldToScreen } from '../../core/geometry';

interface Props {
  northArrows: NorthArrow[];
    view: CanvasView;
      width: number;
        height: number;
          selectedId: string | null;
            scale?: number; // ✅ إضافة scale
            }

            export const NorthArrowLayer: React.FC<Props> = React.memo(({ northArrows, view, width, height, selectedId, scale = 1 }) => {
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

                                                    northArrows.forEach(arrow => {
                                                          const screenPos = worldToScreen(arrow.position.x, arrow.position.y, width, height, view.zoom, view.offsetX, view.offsetY);
                                                                const size = arrow.size * view.zoom;
                                                                      const rotation = arrow.rotation;

                                                                            ctx.save();
                                                                                  ctx.translate(screenPos.x, screenPos.y);
                                                                                        ctx.rotate(rotation);
                                                                                              ctx.fillStyle = '#000';
                                                                                                    ctx.beginPath();
                                                                                                          ctx.moveTo(0, -size);
                                                                                                                ctx.lineTo(-size * 0.4, 0);
                                                                                                                      ctx.lineTo(-size * 0.15, 0);
                                                                                                                            ctx.lineTo(-size * 0.15, size * 0.8);
                                                                                                                                  ctx.lineTo(size * 0.15, size * 0.8);
                                                                                                                                        ctx.lineTo(size * 0.15, 0);
                                                                                                                                              ctx.lineTo(size * 0.4, 0);
                                                                                                                                                    ctx.closePath();
                                                                                                                                                          ctx.fill();

                                                                                                                                                                ctx.fillStyle = '#000';
                                                                                                                                                                      ctx.font = `bold ${Math.max(10, size * 0.4)}px sans-serif`;
                                                                                                                                                                            ctx.textAlign = 'center';
                                                                                                                                                                                  ctx.textBaseline = 'middle';
                                                                                                                                                                                        ctx.fillText('N', 0, -size - 12);
                                                                                                                                                                                              ctx.restore();

                                                                                                                                                                                                    if (arrow.id === selectedId) {
                                                                                                                                                                                                            ctx.save();
                                                                                                                                                                                                                    ctx.translate(screenPos.x, screenPos.y);
                                                                                                                                                                                                                            ctx.rotate(rotation);
                                                                                                                                                                                                                                    ctx.strokeStyle = '#0a0';
                                                                                                                                                                                                                                            ctx.lineWidth = 2;
                                                                                                                                                                                                                                                    ctx.strokeRect(-size, -size, size * 2, size * 2);
                                                                                                                                                                                                                                                            ctx.restore();
                                                                                                                                                                                                                                                                  }
                                                                                                                                                                                                                                                                      });
                                                                                                                                                                                                                                                                        }, [northArrows, view, width, height, selectedId, scale]); // ✅ إضافة scale

                                                                                                                                                                                                                                                                          return (
                                                                                                                                                                                                                                                                              <canvas
                                                                                                                                                                                                                                                                                    ref={canvasRef}
                                                                                                                                                                                                                                                                                          width={width * scale} // ✅
                                                                                                                                                                                                                                                                                                height={height * scale} // ✅
                                                                                                                                                                                                                                                                                                      style={{ position: 'absolute', top: 0, left: 0, pointerEvents: 'none', display: 'block' }}
                                                                                                                                                                                                                                                                                                          />
                                                                                                                                                                                                                                                                                                            );
                                                                                                                                                                                                                                                                                                            });