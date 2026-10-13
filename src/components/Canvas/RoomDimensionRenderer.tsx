import React from 'react';
import type { Wall, CanvasView } from '../../core/types';
import { extractRooms } from '../../core/roomDimensions';
import { worldToScreen, PX_PER_METER } from '../../core/geometry';

interface Props {
  walls: Wall[];
    view: CanvasView;
      width: number;
        height: number;
        }

        export const RoomDimensionRenderer: React.FC<Props> = React.memo(({ walls, view, width, height }) => {
          const canvasRef = React.useRef<HTMLCanvasElement>(null);

            React.useEffect(() => {
                const canvas = canvasRef.current;
                    if (!canvas) return;
                        const ctx = canvas.getContext('2d');
                            if (!ctx) return;

                                ctx.clearRect(0, 0, width, height);
                                    const rooms = extractRooms(walls);

                                        rooms.forEach(room => {
                                              const center = worldToScreen(room.center.x, room.center.y, width, height, view.zoom, view.offsetX, view.offsetY);
                                                    const scale = PX_PER_METER * view.zoom;

                                                          ctx.fillStyle = '#222';
                                                                ctx.font = `${Math.max(11, 12 * view.zoom)}px sans-serif`;
                                                                      ctx.textAlign = 'center';

                                                                            // عرض الطول والعرض داخل الغرفة
                                                                                  ctx.fillText(`${room.width.toFixed(2)} × ${room.length.toFixed(2)}`, center.x, center.y);
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