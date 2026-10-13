import React from 'react';
import type { TextElement, CanvasView } from '../../core/types';
import { worldToScreen, PX_PER_METER } from '../../core/geometry';

interface Props {
  texts: TextElement[];
    view: CanvasView;
      width: number;
        height: number;
          selectedId: string | null;
            scale?: number; // ✅ إضافة scale
            }

            export const TextLayer: React.FC<Props> = React.memo(({ texts, view, width, height, selectedId, scale = 1 }) => {
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

                                                    texts.forEach(text => {
                                                          const pos = worldToScreen(text.position.x, text.position.y, width, height, view.zoom, view.offsetX, view.offsetY);
const fontSizePx = text.fontSize * PX_PER_METER * view.zoom * 1.3; // ✅ زيادة حجم الخط بنسبة 30%
                                                                      ctx.save();
                                                                            ctx.translate(pos.x, pos.y);
                                                                                  ctx.rotate(text.rotation || 0);
                                                                                    ctx.fillStyle = text.color;
ctx.font = `500 ${fontSizePx}px ${text.fontFamily || '"Traditional Arabic", "Noto Naskh Arabic", serif'}`;                                                                                    ctx.textAlign = 'center';
                                                                                    ctx.textBaseline = 'middle';
                                                                                    // ✅ رسم النص كاملاً ككلمة واحدة (يدعم العربية بشكل صحيح)
                                                                                    ctx.fillText(text.text, 0, 0);                                   
                                                                                                                      ctx.restore();

                                                                                                                            if (text.id === selectedId) {
                                                                                                                                    ctx.save();
                                                                                                                                            ctx.translate(pos.x, pos.y);
                                                                                                                                                    ctx.rotate(text.rotation || 0);
                                                                                                                                                            ctx.strokeStyle = '#0a0';
                                                                                                                                                                    ctx.lineWidth = 2;
                                                                                                                                                                            const textWidth = ctx.measureText(text.text).width;
                                                                                                                                                                                    const textHeight = fontSizePx;
                                                                                                                                                                                            ctx.strokeRect(-textWidth / 2 - 5, -textHeight / 2 - 5, textWidth + 10, textHeight + 10);
                                                                                                                                                                                                    ctx.restore();
                                                                                                                                                                                                          }
                                                                                                                                                                                                              });
                                                                                                                                                                                                                }, [texts, view, width, height, selectedId, scale]); // ✅ إضافة scale

                                                                                                                                                                                                                  return (
                                                                                                                                                                                                                      <canvas
                                                                                                                                                                                                                            ref={canvasRef}
                                                                                                                                                                                                                                  width={width * scale} // ✅
                                                                                                                                                                                                                                        height={height * scale} // ✅
                                                                                                                                                                                                                                              style={{ position: 'absolute', top: 0, left: 0, pointerEvents: 'none', display: 'block' }}
                                                                                                                                                                                                                                                  />
                                                                                                                                                                                                                                                    );
                                                                                                                                                                                                                                                    });
