import { useState, useCallback, useRef } from 'react';
import type { Point, Wall, Axis } from '../core/types';
import type { Dimension } from '../core/dimensionTypes';
import { findSnapToFace } from '../core/snapToFace';
import { distance } from '../core/geometry';
import { v4 as uuidv4 } from 'uuid';

const SNAP = 0.15;
const SNAP_TO_AXIS = 0.3;

interface DimState {
  active: boolean;
  start: Point | null;
  end: Point | null;
  wallId: string | null;
  faceSide: 1 | -1 | null;
}

function snapPointToAxis(pt: Point, axes: Axis[], tolerance: number): Point {
  for (const axis of axes) {
    if (axis.type === 'vertical') {
      const axisX = axis.position + axis.offset;
      if (Math.abs(pt.x - axisX) < tolerance) {
        return { x: axisX, y: pt.y };
      }
    } else {
      const axisY = axis.position - axis.offset;
      if (Math.abs(pt.y - axisY) < tolerance) {
        return { x: pt.x, y: axisY };
      }
    }
  }
  return pt;
}

export function useDimensionMode(
  walls: Wall[],
  axes: Axis[],
  onAdd: (d: Dimension) => void,
  orthogonalMode: boolean = false,
) {
  const [d, setD] = useState<DimState>({ active: false, start: null, end: null, wallId: null, faceSide: null });
  const ref = useRef(d);
  ref.current = d;

  const begin = useCallback((pt: Point) => {
    const snapFace = findSnapToFace(pt, walls, undefined, SNAP);
    const startSnapped = snapFace ? snapFace.point : snapPointToAxis(pt, axes, SNAP_TO_AXIS);
    setD({ active: true, start: startSnapped, end: startSnapped, wallId: null, faceSide: null });
  }, [walls, axes]);

  const move = useCallback((pt: Point) => {
    setD(prev => {
      if (!prev.active || !prev.start) return prev;
      const startPt = prev.start;

      const angle = Math.atan2(pt.y - startPt.y, pt.x - startPt.x);
      const len = Math.hypot(pt.x - startPt.x, pt.y - startPt.y);

      // ✅ في الوضع القائم: snap إلى 0°/90°/180°/-90° فقط
      // في الوضع الحر: snap إلى 0°/45°/90°/135°/180° كما كان
      const SNAP_ANGLE_TOL = orthogonalMode ? Math.PI / 4 : Math.PI / 24;
      const targets = orthogonalMode
        ? [0, Math.PI / 2, Math.PI, -Math.PI / 2]
        : [
            0,
            Math.PI / 4,
            Math.PI / 2,
            (3 * Math.PI) / 4,
            Math.PI,
            -(3 * Math.PI) / 4,
            -Math.PI / 2,
            -Math.PI / 4,
          ];

      let snappedAngle = angle;
      let bestDiff = SNAP_ANGLE_TOL;
      for (const t of targets) {
        let diff = Math.abs(angle - t);
        if (diff > Math.PI) diff = 2 * Math.PI - diff;
        if (diff < bestDiff) {
          bestDiff = diff;
          snappedAngle = t;
        }
      }

      let end: Point = {
        x: startPt.x + Math.cos(snappedAngle) * len,
        y: startPt.y + Math.sin(snappedAngle) * len,
      };

      end = snapPointToAxis(end, axes, SNAP_TO_AXIS);
      return { ...prev, end };
    });
  }, [axes, orthogonalMode]);

  const finish = useCallback(() => {
    const cur = ref.current;
    if (!cur.active || !cur.start || !cur.end) { reset(); return; }
    if (distance(cur.start, cur.end) < 0.1) { reset(); return; }

    let start = cur.start;
    let end = cur.end;

    const snapStartFace = findSnapToFace(start, walls, undefined, SNAP);
    if (snapStartFace) start = snapStartFace.point;
    else start = snapPointToAxis(start, axes, SNAP_TO_AXIS);

    const snapEndFace = findSnapToFace(end, walls, undefined, SNAP);
    if (snapEndFace) end = snapEndFace.point;
    else end = snapPointToAxis(end, axes, SNAP_TO_AXIS);

    onAdd({
      id: uuidv4(),
      start: { ...start },
      end: { ...end },
      offset: 0.5,
    });
    reset();
  }, [onAdd, walls, axes]);

  const reset = useCallback(() => setD({ active: false, start: null, end: null, wallId: null, faceSide: null }), []);

  return {
    isActive: d.active,
    tempStart: d.start,
    tempEnd: d.end,
    begin,
    move,
    finish,
    cancel: reset,
  };
}
