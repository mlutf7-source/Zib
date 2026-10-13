import React from 'react';
import type { Axis, CanvasView } from '../../core/types';
import { worldToScreen } from '../../core/geometry';

interface Props { selectedAxis: Axis | null; view: CanvasView; width: number; height: number; }
export const AxisEditLayer: React.FC<Props> = React.memo(({ selectedAxis, view, width, height }) => {
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  React.useEffect(() => {
    const canvas = canvasRef.current; if (!canvas) return;
    const ctx = canvas.getContext('2d'); if (!ctx) return;
    ctx.clearRect(0, 0, width, height);
    if (!selectedAxis) return;
    let p1w: { x: number; y: number }; let p2w: { x: number; y: number };
    if (selectedAxis.type === 'vertical') {
      const x = selectedAxis.position + selectedAxis.offset;
      p1w = { x, y: selectedAxis.center - selectedAxis.length / 2 };
      p2w = { x, y: selectedAxis.center + selectedAxis.length / 2 };
    } else {
      const y = selectedAxis.position - selectedAxis.offset;
      p1w = { x: selectedAxis.center - selectedAxis.length / 2, y };
      p2w = { x: selectedAxis.center + selectedAxis.length / 2, y };
    }
    const p1 = worldToScreen(p1w.x, p1w.y, width, height, view.zoom, view.offsetX, view.offsetY);
    const p2 = worldToScreen(p2w.x, p2w.y, width, height, view.zoom, view.offsetX, view.offsetY);
    ctx.strokeStyle = '#0a0'; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(p1.x, p1.y); ctx.lineTo(p2.x, p2.y); ctx.stroke();
    ctx.fillStyle = '#06f';
    [p1, p2].forEach(p => { ctx.beginPath(); ctx.arc(p.x, p.y, 7, 0, Math.PI * 2); ctx.fill(); });
  }, [selectedAxis, view, width, height]);
  return <canvas ref={canvasRef} width={width} height={height} style={{ position: 'absolute', top: 0, left: 0, pointerEvents: 'none', display: 'block' }} />;
});
