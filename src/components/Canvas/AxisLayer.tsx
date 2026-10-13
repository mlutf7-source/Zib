import React from 'react';
import type { Axis, CanvasView } from '../../core/types';
import { worldToScreen } from '../../core/geometry';

interface Props {
  axes: Axis[];
  view: CanvasView;
  width: number;
  height: number;
  selectedId: string | null;
  scale?: number;
}

export const AxisLayer: React.FC<Props> = React.memo(({ axes, view, width, height, selectedId, scale = 1 }) => {
  const canvasRef = React.useRef<HTMLCanvasElement>(null);

  // ✅ useLayoutEffect يرسم بشكل متزامن قبل أن يلتقطه pdfExport
  React.useLayoutEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // ✅ ضبط الأبعاد
    const targetWidth = Math.max(1, Math.round(width * scale));
    const targetHeight = Math.max(1, Math.round(height * scale));

    if (canvas.width !== targetWidth) canvas.width = targetWidth;
    if (canvas.height !== targetHeight) canvas.height = targetHeight;

    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.scale(scale, scale);
    ctx.clearRect(0, 0, width, height);

    // ✅ بيانات تشخيصية: تخبرنا أن الـ canvas قد رُسم فعلاً
    canvas.setAttribute('data-axes-count', String(axes.length));

    const bubbleRadius = Math.max(6, 10 * view.zoom);
    const lineWidth = Math.max(0.5, 1.5 * view.zoom);
    const fontSize = Math.max(8, 11 * view.zoom);

    axes.forEach(axis => {
      const selected = axis.id === selectedId;
      const color = selected ? '#0a0' : '#d00';

      let p1w: { x: number; y: number };
      let p2w: { x: number; y: number };
      if (axis.type === 'vertical') {
        const x = axis.position + axis.offset;
        p1w = { x, y: axis.center - axis.length / 2 };
        p2w = { x, y: axis.center + axis.length / 2 };
      } else {
        const y = axis.position - axis.offset;
        p1w = { x: axis.center - axis.length / 2, y };
        p2w = { x: axis.center + axis.length / 2, y };
      }

      const p1 = worldToScreen(p1w.x, p1w.y, width, height, view.zoom, view.offsetX, view.offsetY);
      const p2 = worldToScreen(p2w.x, p2w.y, width, height, view.zoom, view.offsetX, view.offsetY);

      ctx.strokeStyle = color;
      ctx.lineWidth = selected ? lineWidth * 1.5 : lineWidth;
      ctx.setLineDash([6 * Math.max(0.5, view.zoom), 4 * Math.max(0.5, view.zoom)]);
      ctx.beginPath();
      ctx.moveTo(p1.x, p1.y);
      ctx.lineTo(p2.x, p2.y);
      ctx.stroke();
      ctx.setLineDash([]);

      const drawBubble = (pos: { x: number; y: number }) => {
        const r = selected ? bubbleRadius * 1.15 : bubbleRadius;
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, r, 0, Math.PI * 2);
        ctx.fillStyle = '#fff';
        ctx.fill();
        ctx.strokeStyle = color;
        ctx.lineWidth = lineWidth;
        ctx.stroke();
        ctx.fillStyle = selected ? '#0a0' : '#000';
        ctx.font = `bold ${fontSize}px sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(axis.label, pos.x, pos.y);
      };
      drawBubble(p1);
      drawBubble(p2);
    });
  }, [axes, view, width, height, selectedId, scale]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        pointerEvents: 'none',
        display: 'block',
        width: width,
        height: height,
      }}
    />
  );
});
