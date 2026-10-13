import React from 'react';
import type { Stair, CanvasView } from '../../core/types';
import { worldToScreen } from '../../core/geometry';

interface Props {
selectedStair: Stair | null;
view: CanvasView;
width: number;
height: number;
}

export const StairEditLayer: React.FC<Props> = React.memo(
({ selectedStair, view, width, height }) => {
const canvasRef = React.useRef<HTMLCanvasElement>(null);

React.useEffect(() => {
  const canvas = canvasRef.current;

    if (!canvas) return;

      const ctx = canvas.getContext('2d');

        if (!ctx) return;

          ctx.clearRect(0, 0, width, height);

            if (!selectedStair || selectedStair.polygon.length === 0) {
                return;
                  }

                    const pts = selectedStair.polygon.map(p =>
                        worldToScreen(
                              p.x,
                                    p.y,
                                          width,
                                                height,
                                                      view.zoom,
                                                            view.offsetX,
                                                                  view.offsetY
                                                                      )
                                                                        );

                                                                          ctx.strokeStyle = '#0a0';
                                                                            ctx.lineWidth = 2;

                                                                              ctx.beginPath();

                                                                                ctx.moveTo(pts[0].x, pts[0].y);

                                                                                  for (let i = 1; i < pts.length; i++) {
                                                                                      ctx.lineTo(pts[i].x, pts[i].y);
                                                                                        }

                                                                                          ctx.closePath();
                                                                                            ctx.stroke();
                                                                                            }, [selectedStair, view, width, height]);

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
                                                                                                                                                }}
                                                                                                                                                  />
                                                                                                                                                  );

                                                                                                                                                  }
                                                                                                                                                  );