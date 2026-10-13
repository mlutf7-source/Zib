import React from 'react';
import type { CanvasView } from '../../core/types';
import type { RoomRegion } from '../../core/regionTypes';
import { worldToScreen } from '../../core/geometry';

interface Props {
  regions: RoomRegion[];
    view: CanvasView;
      width: number;
        height: number;
          scale?: number; // ✅ إضافة scale
          }

          const COLORS = {
            kitchen: 'rgba(255, 165, 0, 0.35)',
              bathroom: 'rgba(0, 180, 240, 0.35)',
              };

              export const RegionLayer: React.FC<Props> = React.memo(({ regions, view, width, height, scale = 1 }) => {
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

                                                      regions.forEach(region => {
                                                            if (region.polygon.length < 3) return;
                                                                  const screenPoints = region.polygon.map(p =>
                                                                          worldToScreen(p.x, p.y, width, height, view.zoom, view.offsetX, view.offsetY)
                                                                                );
                                                                                      ctx.fillStyle = COLORS[region.type];
                                                                                            ctx.beginPath();
                                                                                                  ctx.moveTo(screenPoints[0].x, screenPoints[0].y);
                                                                                                        for (let i = 1; i < screenPoints.length; i++) ctx.lineTo(screenPoints[i].x, screenPoints[i].y);
                                                                                                              ctx.closePath();
                                                                                                                    ctx.fill();
                                                                                                                          ctx.strokeStyle = region.type === 'kitchen' ? '#f80' : '#0af';
                                                                                                                                ctx.lineWidth = 2;
                                                                                                                                      ctx.stroke();
                                                                                                                                          });
                                                                                                                                            }, [regions, view, width, height, scale]); // ✅ إضافة scale

                                                                                                                                              return (
                                                                                                                                                  <canvas
                                                                                                                                                        ref={canvasRef}
                                                                                                                                                              width={width * scale} // ✅
                                                                                                                                                                    height={height * scale} // ✅
                                                                                                                                                                          style={{ position: 'absolute', top: 0, left: 0, pointerEvents: 'none', display: 'block' }}
                                                                                                                                                                              />
                                                                                                                                                                                );
                                                                                                                                                                                });