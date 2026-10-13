import React from 'react';
import type { StairElement, CanvasView } from '../../core/types';
import { worldToScreen, PX_PER_METER } from '../../core/geometry';
import { getElementCorners } from '../../core/stairElementGeometry';

interface Props {
  selectedElement: StairElement | null;
  view: CanvasView;
  width: number;
  height: number;
}

export const StairElementEditLayer: React.FC<Props> = React.memo(({ selectedElement, view, width, height }) => {
  const canvasRef = React.useRef<HTMLCanvasElement>(null);

  React.useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, width, height);
    if (!selectedElement) return;

    const toScreen = (p: { x: number; y: number }) =>
      worldToScreen(p.x, p.y, width, height, view.zoom, view.offsetX, view.offsetY);

    const corners = getElementCorners(selectedElement).map(toScreen);
    const centerScreen = toScreen(selectedElement.position);

    // إطار التحديد
    ctx.strokeStyle = '#0a0';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(corners[0].x, corners[0].y);
    for (let i = 1; i < corners.length; i++) ctx.lineTo(corners[i].x, corners[i].y);
    ctx.closePath();
    ctx.stroke();

    // مقبض التحريك (المركز)
    ctx.fillStyle = '#0a0';
    ctx.beginPath();
    ctx.arc(centerScreen.x, centerScreen.y, 6, 0, Math.PI * 2);
    ctx.fill();

    // مقبض التدوير (فوق العنصر)
    const topMid = {
      x: (corners[0].x + corners[1].x) / 2,
      y: (corners[0].y + corners[1].y) / 2,
    };
    const dirX = topMid.x - centerScreen.x;
    const dirY = topMid.y - centerScreen.y;
    const dirLen = Math.hypot(dirX, dirY) || 1;
    const rotateHandle = {
      x: topMid.x + (dirX / dirLen) * 25,
      y: topMid.y + (dirY / dirLen) * 25,
    };
    ctx.fillStyle = '#f80';
    ctx.beginPath();
    ctx.arc(rotateHandle.x, rotateHandle.y, 7, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 10px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('↻', rotateHandle.x, rotateHandle.y);
  }, [selectedElement, view, width, height]);

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      style={{ position: 'absolute', top: 0, left: 0, pointerEvents: 'none', display: 'block' }}
    />
  );
});
