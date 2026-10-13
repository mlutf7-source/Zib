import type { Axis, Point } from '../../../../core/types';
import { COLORS } from '../colors';

export function drawAxes(
  ctx: CanvasRenderingContext2D,
    axes: Axis[],
      selectedAxisId: string | null,
        axisBubbleSize: number,
          toScreen: (p: Point) => Point,
          ): void {
            axes.forEach(axis => {
                const sel = axis.id === selectedAxisId;
                    const color = sel ? COLORS.axisSelected : COLORS.axis;
                        const vertical = axis.type === 'vertical';

                            const p1 = toScreen(vertical
                                  ? { x: axis.position + axis.offset, y: axis.center - axis.length / 2 }
                                        : { x: axis.center - axis.length / 2, y: axis.position - axis.offset });

                                            const p2 = toScreen(vertical
                                                  ? { x: axis.position + axis.offset, y: axis.center + axis.length / 2 }
                                                        : { x: axis.center + axis.length / 2, y: axis.position - axis.offset });

                                                            ctx.strokeStyle = color;
                                                                ctx.lineWidth = sel ? 1.5 : 1;
                                                                    ctx.setLineDash([6, 4]);
                                                                        ctx.beginPath();
                                                                            ctx.moveTo(p1.x, p1.y);
                                                                                ctx.lineTo(p2.x, p2.y);
                                                                                    ctx.stroke();
                                                                                        ctx.setLineDash([]);

                                                                                            [p1, p2].forEach(p => {
                                                                                                  const r = sel ? axisBubbleSize * 1.15 : axisBubbleSize;
                                                                                                        ctx.beginPath();
                                                                                                              ctx.arc(p.x, p.y, r, 0, Math.PI * 2);
                                                                                                                    ctx.fillStyle = '#fff';
                                                                                                                          ctx.fill();
                                                                                                                                ctx.strokeStyle = color;
                                                                                                                                      ctx.stroke();
                                                                                                                                            ctx.fillStyle = sel ? COLORS.axisSelected : '#000';
                                                                                                                                                  ctx.font = 'bold 9px sans-serif';
                                                                                                                                                        ctx.textAlign = 'center';
                                                                                                                                                              ctx.textBaseline = 'middle';
                                                                                                                                                                    ctx.fillText(axis.label, p.x, p.y);
                                                                                                                                                                        });
                                                                                                                                                                          });
                                                                                                                                                                          }