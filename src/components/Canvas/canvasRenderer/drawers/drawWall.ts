import type { Wall, Point } from '../../../../core/types';
import { distance, wallRectangle, PX_PER_METER } from '../../../../core/geometry';
import { COLORS } from '../colors';
import { getCurvedWallGeometry } from '../../../../core/curvedWallGeometry';

export function drawWall(
  ctx: CanvasRenderingContext2D,
    wall: Wall,
      selected: boolean,
        ghost: boolean,
          roundCornerFirstWallId: string | null,
            toScreen: (p: Point) => Point,
              view: { zoom: number },
                scale: number,
                ): void {
                  const isBoundary = wall.kind === 'land-boundary';
                    const isHelper = wall.kind === 'helper-line';
                      if (ghost) { ctx.save(); ctx.globalAlpha = 0.3; }

                        let color = ghost ? '#999' : selected ? COLORS.selected : COLORS.wall;
                          if (isBoundary) color = selected ? COLORS.landBoundarySelected : COLORS.landBoundary;
                            else if (isHelper) color = selected ? COLORS.helperLineSelected : COLORS.helperLine;
                              if (roundCornerFirstWallId === wall.id) color = COLORS.roundCornerFirst;

                                if (wall.curveRadius) {
                                                                              const geometry = getCurvedWallGeometry(wall);
                                                                              if (geometry) {
                                                                                const c = toScreen(geometry.center);
                                                                                const start = toScreen(wall.start);
                                                                                const end = toScreen(wall.end);
                                                                                const outerRadius = geometry.outerRadius * PX_PER_METER * view.zoom * scale;
                                                                                const innerRadius = geometry.innerRadius * PX_PER_METER * view.zoom * scale;
                                                                                ctx.fillStyle = color;
                                                                                ctx.beginPath();
                                                                                ctx.arc(c.x, c.y, outerRadius, geometry.startAngle, geometry.endAngle, geometry.anticlockwise);
                                                                                ctx.arc(c.x, c.y, innerRadius, geometry.endAngle, geometry.startAngle, !geometry.anticlockwise);
                                                                                ctx.closePath();
                                                                                ctx.fill();
                                                                                if (selected && !ghost) {
                                                                                  ctx.fillStyle = COLORS.handle;
                                                                                  [start, end].forEach(p => ctx.fillRect(p.x - 4, p.y - 4, 8, 8));
                                                                                }
                                                                              }
                                                                            } else if (isHelper) {
                                    const s = toScreen(wall.start), e = toScreen(wall.end);
                                        ctx.strokeStyle = color;
                                            ctx.lineWidth = Math.max(1.5, 3 * view.zoom * scale);
                                                ctx.setLineDash([10, 6]);
                                                    ctx.beginPath();
                                                        ctx.moveTo(s.x, s.y);
                                                            ctx.lineTo(e.x, e.y);
                                                                ctx.stroke();
                                                                    ctx.setLineDash([]);
                                                                      } else {
                                                                          // ✅ استخدام wallRectangle (يحل مشكلة فراغات الأركان)
                                                                              const corners = wallRectangle(wall).corners.map(toScreen);
                                                                                  ctx.fillStyle = color;
                                                                                      ctx.beginPath();
                                                                                          ctx.moveTo(corners[0].x, corners[0].y);
                                                                                              ctx.lineTo(corners[1].x, corners[1].y);
                                                                                                  ctx.lineTo(corners[2].x, corners[2].y);
                                                                                                      ctx.lineTo(corners[3].x, corners[3].y);
                                                                                                          ctx.closePath();
                                                                                                              ctx.fill();
                                                                                                                }

                                                                                                                  if (selected && !ghost) {
                                                                                                                      const s = toScreen(wall.start), e = toScreen(wall.end);
                                                                                                                          ctx.fillStyle = COLORS.handle;
                                                                                                                              [s, e].forEach(p => ctx.fillRect(p.x - 4, p.y - 4, 8, 8));
                                                                                                                                  const mid = toScreen({
                                                                                                                                        x: (wall.start.x + wall.end.x) / 2,
                                                                                                                                              y: (wall.start.y + wall.end.y) / 2,
                                                                                                                                                  });
                                                                                                                                                      ctx.fillStyle = COLORS.dimension;
                                                                                                                                                          ctx.font = `${Math.max(11, 12 * view.zoom * scale)}px sans-serif`;
                                                                                                                                                              ctx.textAlign = 'center';
                                                                                                                                                                  ctx.fillText(distance(wall.start, wall.end).toFixed(2), mid.x + 15, mid.y - 15);
                                                                                                                                                                    }
                                                                                                                                                                      if (ghost) ctx.restore();
                                                                                                                                                                      }