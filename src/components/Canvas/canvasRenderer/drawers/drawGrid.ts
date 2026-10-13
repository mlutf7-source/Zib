import type { Point, CanvasView } from '../../../../core/types';
import { COLORS, GRID_EXTENT, GRID_SPACING } from '../colors';

export function drawGrid(
  ctx: CanvasRenderingContext2D,
    toScreen: (p: Point) => Point,
      view: CanvasView,
        scale: number,
        ): void {
          const tl = toScreen({ x: -GRID_EXTENT, y: -GRID_EXTENT });
            const br = toScreen({ x: GRID_EXTENT, y: GRID_EXTENT });

              ctx.strokeStyle = COLORS.gridBorder;
                ctx.lineWidth = 2 * scale;
                  ctx.strokeRect(tl.x, tl.y, br.x - tl.x, br.y - tl.y);

                    ctx.strokeStyle = COLORS.grid;
                      ctx.lineWidth = 0.5 * scale;

                        for (let x = -GRID_EXTENT; x <= GRID_EXTENT; x += GRID_SPACING) {
                            const a = toScreen({ x, y: -GRID_EXTENT });
                                const b = toScreen({ x, y: GRID_EXTENT });
                                    ctx.beginPath();
                                        ctx.moveTo(a.x, a.y);
                                            ctx.lineTo(b.x, b.y);
                                                ctx.stroke();
                                                  }
                                                    for (let y = -GRID_EXTENT; y <= GRID_EXTENT; y += GRID_SPACING) {
                                                        const a = toScreen({ x: -GRID_EXTENT, y });
                                                            const b = toScreen({ x: GRID_EXTENT, y });
                                                                ctx.beginPath();
                                                                    ctx.moveTo(a.x, a.y);
                                                                        ctx.lineTo(b.x, b.y);
                                                                            ctx.stroke();
                                                                              }
                                                                              }