import React from 'react';
import type { Wall, Point } from '../../core/types';
import { PX_PER_METER, wallRectangle } from '../../core/geometry';
import { COLORS } from './canvasRenderer/colors';

interface Props {
  /** نقطة الالتقاء (بإحداثيات العالم) — مركز العدسة */
  worldPt: Point;
  /** كل الجدران في الدور الحالي */
  walls: Wall[];
  /** الجدار قيد الرسم/التعديل (اختياري) */
  tempWall: { start: Point; end: Point; thickness?: number } | null;
  /** معرّف الجدار قيد التعديل لتخطّيه */
  excludeWallId?: string | null;
}

const LOUPE_SIZE = 110;
const LOUPE_ZOOM = 1.4;

export const DrawingLoupe: React.FC<Props> = ({ worldPt, walls, tempWall, excludeWallId }) => {
  const canvasRef = React.useRef<HTMLCanvasElement>(null);

  React.useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = LOUPE_SIZE;
    canvas.height = LOUPE_SIZE;

    ctx.fillStyle = COLORS.bg;
    ctx.fillRect(0, 0, LOUPE_SIZE, LOUPE_SIZE);

    const s = PX_PER_METER * LOUPE_ZOOM;
    ctx.setTransform(
      s, 0, 0, s,
      LOUPE_SIZE / 2 - worldPt.x * s,
      LOUPE_SIZE / 2 - worldPt.y * s,
    );

    for (const w of walls) {
      if (w.kind && w.kind !== 'wall') continue;
      if (excludeWallId && w.id === excludeWallId) continue;
      const corners = wallRectangle(w).corners;
      ctx.fillStyle = COLORS.wall;
      ctx.beginPath();
      ctx.moveTo(corners[0].x, corners[0].y);
      ctx.lineTo(corners[1].x, corners[1].y);
      ctx.lineTo(corners[2].x, corners[2].y);
      ctx.lineTo(corners[3].x, corners[3].y);
      ctx.closePath();
      ctx.fill();
    }

    if (tempWall) {
      const dx = tempWall.end.x - tempWall.start.x;
      const dy = tempWall.end.y - tempWall.start.y;
      const len = Math.hypot(dx, dy) || 1;
      const nx = -dy / len;
      const ny = dx / len;
      const th = tempWall.thickness ?? 0.3;
      const half = th / 2;
      const corners: Point[] = [
        { x: tempWall.start.x + nx * half, y: tempWall.start.y + ny * half },
        { x: tempWall.end.x + nx * half, y: tempWall.end.y + ny * half },
        { x: tempWall.end.x - nx * half, y: tempWall.end.y - ny * half },
        { x: tempWall.start.x - nx * half, y: tempWall.start.y - ny * half },
      ];
      ctx.fillStyle = 'rgba(0, 80, 158, 0.35)';
      ctx.beginPath();
      ctx.moveTo(corners[0].x, corners[0].y);
      ctx.lineTo(corners[1].x, corners[1].y);
      ctx.lineTo(corners[2].x, corners[2].y);
      ctx.lineTo(corners[3].x, corners[3].y);
      ctx.closePath();
      ctx.fill();
    }

    ctx.setTransform(1, 0, 0, 1, 0, 0);

    ctx.strokeStyle = 'rgba(200, 0, 0, 0.6)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(LOUPE_SIZE / 2 - 8, LOUPE_SIZE / 2);
    ctx.lineTo(LOUPE_SIZE / 2 - 3, LOUPE_SIZE / 2);
    ctx.moveTo(LOUPE_SIZE / 2 + 3, LOUPE_SIZE / 2);
    ctx.lineTo(LOUPE_SIZE / 2 + 8, LOUPE_SIZE / 2);
    ctx.moveTo(LOUPE_SIZE / 2, LOUPE_SIZE / 2 - 8);
    ctx.lineTo(LOUPE_SIZE / 2, LOUPE_SIZE / 2 - 3);
    ctx.moveTo(LOUPE_SIZE / 2, LOUPE_SIZE / 2 + 3);
    ctx.lineTo(LOUPE_SIZE / 2, LOUPE_SIZE / 2 + 8);
    ctx.stroke();

    ctx.strokeStyle = '#00509e';
    ctx.lineWidth = 2;
    ctx.strokeRect(1, 1, LOUPE_SIZE - 2, LOUPE_SIZE - 2);
  }, [worldPt, walls, tempWall, excludeWallId]);

  return (
    <canvas
      ref={canvasRef}
      width={LOUPE_SIZE}
      height={LOUPE_SIZE}
      style={{
        borderRadius: 8,
        boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
        pointerEvents: 'none',
        flexShrink: 0,
      }}
    />
  );
};
