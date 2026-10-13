import React from 'react';
import type { Wall, Point, CanvasView } from '../../core/types';
import { worldToScreen, distance, PX_PER_METER } from '../../core/geometry';

interface Props {
  walls: Wall[];
    view: CanvasView;
      width: number;
        height: number;
        }

        export const DimensionRenderer: React.FC<Props> = React.memo(({ walls, view, width, height }) => {
          const canvasRef = React.useRef<HTMLCanvasElement>(null);

            const toScreen = (p: Point): Point =>
                worldToScreen(p.x, p.y, width, height, view.zoom, view.offsetX, view.offsetY);

                  React.useEffect(() => {
                      const canvas = canvasRef.current;
                          if (!canvas) return;
                              const ctx = canvas.getContext('2d');
                                  if (!ctx) return;

                                      ctx.clearRect(0, 0, width, height);

                                          const scale = PX_PER_METER * view.zoom;

                                              walls.forEach(w => {
                                                    const s = toScreen(w.start);
                                                          const e = toScreen(w.end);
                                                                const len = distance(w.start, w.end);
                                                                      const mid = { x: (s.x + e.x) / 2, y: (s.y + e.y) / 2 };

                                                                            const dx = e.x - s.x;
                                                                                  const dy = e.y - s.y;
                                                                                        const lenPx = Math.hypot(dx, dy) || 1;
                                                                                              const nx = -dy / lenPx;
                                                                                                    const ny = dx / lenPx;

                                                                                                          const offset = w.thickness * scale / 2 + 12;

                                                                                                                ctx.fillStyle = '#444';
                                                                                                                      ctx.font = `${Math.max(12, 13 * view.zoom)}px sans-serif`;
                                                                                                                            ctx.textAlign = 'center';
                                                                                                                                  ctx.fillText(len.toFixed(2), mid.x + nx * offset, mid.y + ny * offset);
                                                                                                                                      });
                                                                                                                                        }, [walls, view, width, height]);

                                                                                                                                          return (
                                                                                                                                              <canvas
                                                                                                                                                    ref={canvasRef}
                                                                                                                                                          width={width}
                                                                                                                                                                height={height}
                                                                                                                                                                      style={{ position: 'absolute', top: 0, left: 0, pointerEvents: 'none', display: 'block' }}
                                                                                                                                                                          />
                                                                                                                                                                            );
                                                                                                                                                                            });