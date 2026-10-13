import React from 'react';
import type { TextElement, CanvasView } from '../../core/types';
import { worldToScreen, PX_PER_METER } from '../../core/geometry';

interface Props {
  selectedText: TextElement | null;
    view: CanvasView;
      width: number;
        height: number;
        }

        export const TextEditLayer: React.FC<Props> = React.memo(({ selectedText, view, width, height }) => {
          const canvasRef = React.useRef<HTMLCanvasElement>(null);

            React.useEffect(() => {
                const canvas = canvasRef.current;
                    if (!canvas) return;
                        const ctx = canvas.getContext('2d');
                            if (!ctx) return;

                                ctx.clearRect(0, 0, width, height);
                                    if (!selectedText) return;

                                        const pos = worldToScreen(selectedText.position.x, selectedText.position.y, width, height, view.zoom, view.offsetX, view.offsetY);
                                            const fontSizePx = selectedText.fontSize * PX_PER_METER * view.zoom;
                                                const rotation = selectedText.rotation || 0;

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
                                                                                                      x: pos.x + Math.sin(rotation) * (fontSizePx / 2 + 20),
                                                                                                            y: pos.y - Math.cos(rotation) * (fontSizePx / 2 + 20),
                                                                                                                };
                                                                                                                    drawHandle(rotateHandle.x, rotateHandle.y, '#f80');

                                                                                                                        // مقبض حجم (يمين النص)
                                                                                                                            const scaleHandle = {
                                                                                                                                  x: pos.x + Math.cos(rotation) * (fontSizePx * 0.6),
                                                                                                                                        y: pos.y + Math.sin(rotation) * (fontSizePx * 0.6),
                                                                                                                                            };
                                                                                                                                                drawHandle(scaleHandle.x, scaleHandle.y, '#06f');
                                                                                                                                                  }, [selectedText, view, width, height]);

                                                                                                                                                    return (
                                                                                                                                                        <canvas
                                                                                                                                                              ref={canvasRef}
                                                                                                                                                                    width={width}
                                                                                                                                                                          height={height}
                                                                                                                                                                                style={{ position: 'absolute', top: 0, left: 0, pointerEvents: 'none', display: 'block' }}
                                                                                                                                                                                    />
                                                                                                                                                                                      );
                                                                                                                                                                                      });