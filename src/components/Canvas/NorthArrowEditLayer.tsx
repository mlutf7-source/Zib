import React from 'react';
import type { NorthArrow, CanvasView } from '../../core/types';
import { worldToScreen } from '../../core/geometry';

interface Props {
  selectedArrow: NorthArrow | null;
    view: CanvasView;
      width: number;
        height: number;
        }

        export const NorthArrowEditLayer: React.FC<Props> = React.memo(({ selectedArrow, view, width, height }) => {
          const canvasRef = React.useRef<HTMLCanvasElement>(null);

            React.useEffect(() => {
                const canvas = canvasRef.current;
                    if (!canvas) return;
                        const ctx = canvas.getContext('2d');
                            if (!ctx) return;

                                ctx.clearRect(0, 0, width, height);
                                    if (!selectedArrow) return;

                                        const pos = worldToScreen(selectedArrow.position.x, selectedArrow.position.y, width, height, view.zoom, view.offsetX, view.offsetY);
                                            const rotation = selectedArrow.rotation || 0;

                                                const drawHandle = (x: number, y: number, color: string) => {
                                                      ctx.fillStyle = color;
                                                            ctx.beginPath();
                                                                  ctx.arc(x, y, 6, 0, Math.PI * 2);
                                                                        ctx.fill();
                                                                            };

                                                                                // مقبض تحريك (المركز)
                                                                                    drawHandle(pos.x, pos.y, '#0a0');

                                                                                        // مقبض تدوير (أعلى)
                                                                                            const rotateHandle = {
                                                                                                  x: pos.x + Math.sin(rotation) * (selectedArrow.size / 2 + 20),
                                                                                                        y: pos.y - Math.cos(rotation) * (selectedArrow.size / 2 + 20),
                                                                                                            };
                                                                                                                drawHandle(rotateHandle.x, rotateHandle.y, '#f80');

                                                                                                                    // مقبض حجم (يمين السهم)
                                                                                                                        const scaleHandle = {
                                                                                                                              x: pos.x + Math.cos(rotation) * (selectedArrow.size * 0.6),
                                                                                                                                    y: pos.y + Math.sin(rotation) * (selectedArrow.size * 0.6),
                                                                                                                                        };
                                                                                                                                            drawHandle(scaleHandle.x, scaleHandle.y, '#06f');
                                                                                                                                              }, [selectedArrow, view, width, height]);

                                                                                                                                                return (
                                                                                                                                                    <canvas
                                                                                                                                                          ref={canvasRef}
                                                                                                                                                                width={width}
                                                                                                                                                                      height={height}
                                                                                                                                                                            style={{ position: 'absolute', top: 0, left: 0, pointerEvents: 'none', display: 'block' }}
                                                                                                                                                                                />
                                                                                                                                                                                  );
                                                                                                                                                                                  });