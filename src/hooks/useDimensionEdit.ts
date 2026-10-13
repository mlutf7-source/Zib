import { useState, useCallback, useRef } from 'react';
import type { Point, Wall, Axis } from '../core/types';
import type { Dimension } from '../core/dimensionTypes';
import { distance, closestPointOnSegment, getAngle, wallRectangle } from '../core/geometry';

const HANDLE = 0.2;
const SNAP = 0.3;
const SNAP_TO_AXIS = 0.3;

function findNearestWallX(pt: Point, walls: Wall[], tol: number): number | null {
  let best: number | null = null;
  let bestDist = tol;
  for (const wall of walls) {
    const rect = wallRectangle(wall);
    for (const c of rect.corners) {
      const d = Math.abs(c.x - pt.x);
      if (d < bestDist) { bestDist = d; best = c.x; }
    }
  }
  return best;
}

function findNearestWallY(pt: Point, walls: Wall[], tol: number): number | null {
  let best: number | null = null;
  let bestDist = tol;
  for (const wall of walls) {
    const rect = wallRectangle(wall);
    for (const c of rect.corners) {
      const d = Math.abs(c.y - pt.y);
      if (d < bestDist) { bestDist = d; best = c.y; }
    }
  }
  return best;
}

function findNearestAxisX(pt: Point, axes: Axis[], tol: number): number | null {
  let best: number | null = null;
  let bestDist = tol;
  for (const axis of axes) {
    if (axis.type !== 'vertical') continue;
    const axisX = axis.position + axis.offset;
    const d = Math.abs(pt.x - axisX);
    if (d < bestDist) { bestDist = d; best = axisX; }
  }
  return best;
}

function findNearestAxisY(pt: Point, axes: Axis[], tol: number): number | null {
  let best: number | null = null;
  let bestDist = tol;
  for (const axis of axes) {
    if (axis.type !== 'horizontal') continue;
    const axisY = axis.position - axis.offset;
    const d = Math.abs(pt.y - axisY);
    if (d < bestDist) { bestDist = d; best = axisY; }
  }
  return best;
}

export function useDimensionEdit(
  dimensions: Dimension[],
  walls: Wall[],
  axes: Axis[],
  onChange: (dims: Dimension[]) => void,
  orthogonalMode: boolean = false,
) {
  const [selectedDimId, setSelectedDimId] = useState<string | null>(null);
  const dragTypeRef = useRef<'move' | 'start' | 'end' | null>(null);
  const dragStartRef = useRef<Point | null>(null);

  const hitTest = useCallback((pt: Point, dim: Dimension): 'move' | 'start' | 'end' | null => {
    const angle = getAngle(dim.start, dim.end);
    const normal = { x: -Math.sin(angle), y: Math.cos(angle) };
    const startHandle = { x: dim.start.x + normal.x * dim.offset, y: dim.start.y + normal.y * dim.offset };
    const endHandle = { x: dim.end.x + normal.x * dim.offset, y: dim.end.y + normal.y * dim.offset };
    const dStart = distance(pt, startHandle);
    const dEnd = distance(pt, endHandle);
    if (dStart <= HANDLE) return 'start';
    if (dEnd <= HANDLE) return 'end';
    const cp = closestPointOnSegment(pt, startHandle, endHandle);
    return distance(pt, cp) <= HANDLE ? 'move' : null;
  }, []);

  const select = useCallback((id: string, type: 'move' | 'start' | 'end', pt: Point) => {
    setSelectedDimId(id);
    dragTypeRef.current = type;
    dragStartRef.current = pt;
  }, []);

  const deselect = useCallback(() => {
    setSelectedDimId(null);
    dragTypeRef.current = null;
    dragStartRef.current = null;
  }, []);

  const moveEdit = useCallback((pt: Point) => {
    if (!selectedDimId || !dragTypeRef.current || !dragStartRef.current) return;
    const dx = pt.x - dragStartRef.current.x;
    const dy = pt.y - dragStartRef.current.y;
    dragStartRef.current = pt;

    onChange(dimensions.map(dim => {
      if (dim.id !== selectedDimId) return dim;

      // === تحريك كامل (إزاحة) ===
      if (dragTypeRef.current === 'move') {
        const angle = getAngle(dim.start, dim.end);
        const normal = { x: -Math.sin(angle), y: Math.cos(angle) };
        const delta = dx * normal.x + dy * normal.y;
        const newOffset = dim.offset + delta;

        const SNAP_TOLERANCE = 0.08;
        let snappedOffset = newOffset;

        const isHorizontal = Math.abs(Math.abs(angle) - Math.PI / 2) > Math.PI / 4;

        const currentLinePos = isHorizontal
          ? dim.start.y + normal.y * newOffset
          : dim.start.x + normal.x * newOffset;

        let bestDist = SNAP_TOLERANCE;
        for (const other of dimensions) {
          if (other.id === dim.id) continue;
          const otherAngle = getAngle(other.start, other.end);
          const isOtherHorizontal = Math.abs(Math.abs(otherAngle) - Math.PI / 2) > Math.PI / 4;
          if (isOtherHorizontal !== isHorizontal) continue;

          const otherNormal = { x: -Math.sin(otherAngle), y: Math.cos(otherAngle) };
          const otherLinePos = isHorizontal
            ? other.start.y + otherNormal.y * other.offset
            : other.start.x + otherNormal.x * other.offset;

          const d = Math.abs(currentLinePos - otherLinePos);
          if (d < bestDist) {
            bestDist = d;
            snappedOffset = isHorizontal
              ? (otherLinePos - dim.start.y) / (normal.y || 1)
              : (otherLinePos - dim.start.x) / (normal.x || 1);
          }
        }

        return { ...dim, offset: snappedOffset };
      }

      // === تمديد البداية أو النهاية ===
      const baseAngle = getAngle(dim.start, dim.end);
      const isHorizontal =
        Math.abs(baseAngle) < 0.001 || Math.abs(baseAngle - Math.PI) < 0.001;

      const normal = { x: -Math.sin(baseAngle), y: Math.cos(baseAngle) };
      const originalPt: Point = {
        x: pt.x - normal.x * dim.offset,
        y: pt.y - normal.y * dim.offset,
      };

      const isVertical =
        Math.abs(baseAngle - Math.PI / 2) < 0.001 ||
        Math.abs(baseAngle + Math.PI / 2) < 0.001;
      const isDiagonal = !isHorizontal && !isVertical;

      // ✅ في الوضع القائم: إذا كان البعد مائلاً، أجبره على 0° أو 90°
      if (isDiagonal && orthogonalMode) {
        // حدد ما إذا كان أقرب للأفقي أم الرأسي بناءً على الزاوية
        const horizDiff = Math.min(
          Math.abs(baseAngle),
          Math.abs(baseAngle - Math.PI),
          Math.abs(baseAngle + Math.PI),
        );
        const vertDiff = Math.min(
          Math.abs(baseAngle - Math.PI / 2),
          Math.abs(baseAngle + Math.PI / 2),
        );

        if (horizDiff <= vertDiff) {
          // اجعله أفقياً
          const fixedCoord = dragTypeRef.current === 'start' ? dim.end.y : dim.start.y;
          const probe: Point = { x: originalPt.x, y: fixedCoord };
          const wallX = findNearestWallX(probe, walls, SNAP);
          if (wallX !== null) return dragTypeRef.current === 'start'
            ? { ...dim, start: { x: wallX, y: fixedCoord } }
            : { ...dim, end: { x: wallX, y: fixedCoord } };
          const axisX = findNearestAxisX(probe, axes, SNAP_TO_AXIS);
          if (axisX !== null) return dragTypeRef.current === 'start'
            ? { ...dim, start: { x: axisX, y: fixedCoord } }
            : { ...dim, end: { x: axisX, y: fixedCoord } };
          return dragTypeRef.current === 'start'
            ? { ...dim, start: { x: originalPt.x, y: fixedCoord } }
            : { ...dim, end: { x: originalPt.x, y: fixedCoord } };
        } else {
          // اجعله رأسياً
          const fixedCoord = dragTypeRef.current === 'start' ? dim.end.x : dim.start.x;
          const probe: Point = { x: fixedCoord, y: originalPt.y };
          const wallY = findNearestWallY(probe, walls, SNAP);
          if (wallY !== null) return dragTypeRef.current === 'start'
            ? { ...dim, start: { x: fixedCoord, y: wallY } }
            : { ...dim, end: { x: fixedCoord, y: wallY } };
          const axisY = findNearestAxisY(probe, axes, SNAP_TO_AXIS);
          if (axisY !== null) return dragTypeRef.current === 'start'
            ? { ...dim, start: { x: fixedCoord, y: axisY } }
            : { ...dim, end: { x: fixedCoord, y: axisY } };
          return dragTypeRef.current === 'start'
            ? { ...dim, start: { x: fixedCoord, y: originalPt.y } }
            : { ...dim, end: { x: fixedCoord, y: originalPt.y } };
        }
      }

      // للبعد المائل في الوضع الحر: Snap على الزوايا والمحاور والنهايات، مع الحفاظ على الزاوية
      if (isDiagonal) {
        const dirX = Math.cos(baseAngle);
        const dirY = Math.sin(baseAngle);

        const fixedPt = dragTypeRef.current === 'start' ? dim.end : dim.start;
        const movingPt = originalPt;

        const SNAP_TOL_DIAG = 0.3;
        let snappedPoint: Point | null = null;
        let bestDist = SNAP_TOL_DIAG;

        for (const w of walls) {
          const rect = wallRectangle(w);
          for (const c of rect.corners) {
            const d = distance(movingPt, c);
            if (d < bestDist) {
              bestDist = d;
              snappedPoint = { x: c.x, y: c.y };
            }
          }
        }

        for (const axis of axes) {
          if (axis.type === 'vertical') {
            const axX = axis.position + axis.offset;
            const d = Math.abs(movingPt.x - axX);
            if (d < bestDist) {
              bestDist = d;
              snappedPoint = { x: axX, y: movingPt.y };
            }
          } else {
            const axY = axis.position - axis.offset;
            const d = Math.abs(movingPt.y - axY);
            if (d < bestDist) {
              bestDist = d;
              snappedPoint = { x: movingPt.x, y: axY };
            }
          }
        }

        for (const other of dimensions) {
          if (other.id === dim.id) continue;
          const dStart = distance(movingPt, other.start);
          if (dStart < bestDist) {
            bestDist = dStart;
            snappedPoint = { x: other.start.x, y: other.start.y };
          }
          const dEnd = distance(movingPt, other.end);
          if (dEnd < bestDist) {
            bestDist = dEnd;
            snappedPoint = { x: other.end.x, y: other.end.y };
          }
        }

        if (snappedPoint) {
          return dragTypeRef.current === 'start'
            ? { ...dim, start: snappedPoint }
            : { ...dim, end: snappedPoint };
        }

        const t = (movingPt.x - fixedPt.x) * dirX + (movingPt.y - fixedPt.y) * dirY;
        const projected: Point = {
          x: fixedPt.x + dirX * t,
          y: fixedPt.y + dirY * t,
        };

        return dragTypeRef.current === 'start'
          ? { ...dim, start: projected }
          : { ...dim, end: projected };
      }

      if (dragTypeRef.current === 'start') {
        const fixedCoord = isHorizontal ? dim.end.y : dim.end.x;

        if (isHorizontal) {
          const probe: Point = { x: originalPt.x, y: fixedCoord };
          const wallX = findNearestWallX(probe, walls, SNAP);
          if (wallX !== null) return { ...dim, start: { x: wallX, y: fixedCoord } };
          const axisX = findNearestAxisX(probe, axes, SNAP_TO_AXIS);
          if (axisX !== null) return { ...dim, start: { x: axisX, y: fixedCoord } };
          return { ...dim, start: { x: originalPt.x, y: fixedCoord } };
        } else {
          const probe: Point = { x: fixedCoord, y: originalPt.y };
          const wallY = findNearestWallY(probe, walls, SNAP);
          if (wallY !== null) return { ...dim, start: { x: fixedCoord, y: wallY } };
          const axisY = findNearestAxisY(probe, axes, SNAP_TO_AXIS);
          if (axisY !== null) return { ...dim, start: { x: fixedCoord, y: axisY } };
          return { ...dim, start: { x: fixedCoord, y: originalPt.y } };
        }
      }

      if (dragTypeRef.current === 'end') {
        const fixedCoord = isHorizontal ? dim.start.y : dim.start.x;

        if (isHorizontal) {
          const probe: Point = { x: originalPt.x, y: fixedCoord };
          const wallX = findNearestWallX(probe, walls, SNAP);
          if (wallX !== null) return { ...dim, end: { x: wallX, y: fixedCoord } };
          const axisX = findNearestAxisX(probe, axes, SNAP_TO_AXIS);
          if (axisX !== null) return { ...dim, end: { x: axisX, y: fixedCoord } };
          return { ...dim, end: { x: originalPt.x, y: fixedCoord } };
        } else {
          const probe: Point = { x: fixedCoord, y: originalPt.y };
          const wallY = findNearestWallY(probe, walls, SNAP);
          if (wallY !== null) return { ...dim, end: { x: fixedCoord, y: wallY } };
          const axisY = findNearestAxisY(probe, axes, SNAP_TO_AXIS);
          if (axisY !== null) return { ...dim, end: { x: fixedCoord, y: axisY } };
          return { ...dim, end: { x: fixedCoord, y: originalPt.y } };
        }
      }

      return dim;
    }));
  }, [dimensions, selectedDimId, onChange, walls, axes, orthogonalMode]);

  const deleteSelected = useCallback(() => {
    if (!selectedDimId) return;
    onChange(dimensions.filter(d => d.id !== selectedDimId));
    deselect();
  }, [dimensions, selectedDimId, onChange, deselect]);

  return { selectedDimId, hitTest, select, deselect, moveEdit, deleteSelected };
}
