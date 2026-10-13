import React from 'react';
import type { ClipFrame, CanvasView } from '../../core/types';
import { worldToScreen, PX_PER_METER } from '../../core/geometry';

interface Props {
  clipFrames: ClipFrame[];
    view: CanvasView;
      width: number;
        height: number;
          selectedId: string | null;
            scale?: number; // ✅ إضافة scale
            }

            export const ClipFrameLayer: React.FC<Props> = React.memo(({ clipFrames, view, width, height, selectedId, scale = 1 }) => {
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

                                                    clipFrames.forEach(frame => {
                                                          const center = worldToScreen(frame.x, frame.y, width, height, view.zoom, view.offsetX, view.offsetY);
                                                                const frameWidth = frame.width * PX_PER_METER * view.zoom;
                                                                      const frameHeight = frame.height * PX_PER_METER * view.zoom;

                                                                            ctx.save();
                                                                                  ctx.translate(center.x, center.y);
                                                                                        ctx.rotate(frame.rotation || 0);
                                                                                              ctx.strokeStyle = '#f00';
                                                                                                    ctx.lineWidth = 2;
                                                                                                          ctx.setLineDash([8, 4]);
                                                                                                                ctx.strokeRect(-frameWidth / 2, -frameHeight / 2, frameWidth, frameHeight);
                                                                                                                      ctx.setLineDash([]);
                                                                                                                            ctx.restore();
                                                                                                                                });
                                                                                                                                  }, [clipFrames, view, width, height, selectedId, scale]); // ✅ إضافة scale

                                                                                                                                    return (
                                                                                                                                        <canvas
                                                                                                                                              ref={canvasRef}
                                                                                                                                                    width={width * scale} // ✅
                                                                                                                                                          height={height * scale} // ✅
                                                                                                                                                                style={{
                                                                                                                                                                        position: 'absolute',
                                                                                                                                                                                top: 0,
                                                                                                                                                                                        left: 0,
                                                                                                                                                                                                pointerEvents: 'none',
                                                                                                                                                                                                        display: 'block',
                                                                                                                                                                                                                zIndex: 50,
                                                                                                                                                                                                                      }}
                                                                                                                                                                                                                          />
                                                                                                                                                                                                                            );
                                                                                                                                                                                                                            });