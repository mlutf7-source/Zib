// المسار: src/components/Canvas/ClipFrameEditLayer.tsx
import React from 'react';
import type { ClipFrame, CanvasView } from '../../core/types';
import { worldToScreen, PX_PER_METER } from '../../core/geometry';

interface Props {
  selectedClipFrame: ClipFrame | null;
    view: CanvasView;
      width: number;
        height: number;
        }

        export const ClipFrameEditLayer: React.FC<Props> = React.memo(({
          selectedClipFrame,
            view,
              width,
                height,
                }) => {
                  const canvasRef = React.useRef<HTMLCanvasElement>(null);

                    React.useEffect(() => {
                        const canvas = canvasRef.current;
                            if (!canvas) return;
                                const ctx = canvas.getContext('2d');
                                    if (!ctx) return;

                                        ctx.clearRect(0, 0, width, height);
                                            if (!selectedClipFrame) return;

                                                const center = worldToScreen(selectedClipFrame.x, selectedClipFrame.y, width, height, view.zoom, view.offsetX, view.offsetY);
                                                    const frameWidth = selectedClipFrame.width * PX_PER_METER * view.zoom;
                                                        const frameHeight = selectedClipFrame.height * PX_PER_METER * view.zoom;
                                                            const rotation = selectedClipFrame.rotation || 0;

                                                                ctx.save();
                                                                    ctx.translate(center.x, center.y);
                                                                        ctx.rotate(rotation);

                                                                            // رسم مقبض التدوير (أعلى المنتصف)
                                                                                ctx.fillStyle = '#f80';
                                                                                    ctx.beginPath();
                                                                                        ctx.arc(0, -frameHeight / 2 - 10, 6, 0, Math.PI * 2);
                                                                                            ctx.fill();

                                                                                                // رسم مقبض التكبير (يمين المنتصف)
                                                                                                    ctx.fillStyle = '#06f';
                                                                                                        ctx.beginPath();
                                                                                                            ctx.arc(frameWidth / 2 + 10, 0, 6, 0, Math.PI * 2);
                                                                                                                ctx.fill();

                                                                                                                    // رسم مقبض التحريك (المركز)
                                                                                                                        ctx.fillStyle = '#0a0';
                                                                                                                            ctx.beginPath();
                                                                                                                                ctx.arc(0, 0, 6, 0, Math.PI * 2);
                                                                                                                                    ctx.fill();

                                                                                                                                        ctx.restore();
                                                                                                                                          }, [selectedClipFrame, view, width, height]);

                                                                                                                                            return (
                                                                                                                                                <canvas
                                                                                                                                                      ref={canvasRef}
                                                                                                                                                            width={width}
                                                                                                                                                                  height={height}
                                                                                                                                                                        style={{
                                                                                                                                                                                position: 'absolute',
                                                                                                                                                                                        top: 0,
                                                                                                                                                                                                left: 0,
                                                                                                                                                                                                        pointerEvents: 'none',
                                                                                                                                                                                                                display: 'block',
                                                                                                                                                                                                                        zIndex: 60,
                                                                                                                                                                                                                              }}
                                                                                                                                                                                                                                  />
                                                                                                                                                                                                                                    );
                                                                                                                                                                                                                                    });