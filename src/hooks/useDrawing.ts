import { useState, useCallback, useRef, useEffect } from 'react';
import type { Point, Wall, DrawingType, WallType, Axis, WallKind } from '../core/types';
import { LAND_BOUNDARY_THICKNESS, HELPER_LINE_THICKNESS } from '../core/types';
import { distance, snapAngle, getAngle } from '../core/geometry';
import { findSnapToFace } from '../core/snapToFace';
import { v4 as uuidv4 } from 'uuid';

const SNAP = 0.1;
const SNAP_TO_AXIS = 0.5;

interface DrawState {
  active: boolean;
  type: DrawingType;
  originalStart: Point | null;
  start: Point | null;
  end: Point | null;
  awaitingCurveSide?: boolean;
  curveRadius?: number;
}

function getThickness(type: DrawingType): number {
  switch (type) {
    case 'exterior': return 0.3;
    case 'interior': return 0.2;
    case 'land-boundary': return LAND_BOUNDARY_THICKNESS;
    case 'helper-line': return HELPER_LINE_THICKNESS;
    default: return 0.3;
  }
}

function getWallType(type: DrawingType): WallType {
  return type === 'interior' ? 'interior' : 'exterior';
}

function getKind(type: DrawingType): WallKind | undefined {
  if (type === 'land-boundary') return 'land-boundary';
  if (type === 'helper-line') return 'helper-line';
  return undefined;
}

function findPrevWall(walls: Wall[], currentType: DrawingType): Wall | null {
  const currentKind = getKind(currentType);
  for (let i = walls.length - 1; i >= 0; i--) {
    const w = walls[i];
    const wKind = w.kind;
    if (wKind === currentKind) return w;
  }
  return null;
}

function computeNormalSign(newStart: Point, newEnd: Point, prevWall: Wall | null): 1 | -1 {
  if (!prevWall) return 1;

  const pdx = prevWall.end.x - prevWall.start.x;
  const pdy = prevWall.end.y - prevWall.start.y;
  const plen = Math.hypot(pdx, pdy) || 1;
  const pux = pdx / plen;
  const puy = pdy / plen;
  const pnx = -puy;
  const pny = pux;
  const psign = prevWall.normalSign ?? 1;
  const prevBodyMid: Point = {
    x: (prevWall.start.x + prevWall.end.x) / 2 + pnx * (prevWall.thickness / 2) * psign,
    y: (prevWall.start.y + prevWall.end.y) / 2 + pny * (prevWall.thickness / 2) * psign,
  };

  const ndx = newEnd.x - newStart.x;
  const ndy = newEnd.y - newStart.y;
  const nlen = Math.hypot(ndx, ndy) || 1;
  const nux = ndx / nlen;
  const nuy = ndy / nlen;
  const nnx = -nuy;
  const nny = nux;

  const inx = prevBodyMid.x - newStart.x;
  const iny = prevBodyMid.y - newStart.y;

  const dot = nnx * inx + nny * iny;
  return dot > 0 ? 1 : -1;
}

export function useDrawing(
  walls: Wall[],
  axes: Axis[],
  onAdd: (w: Wall) => void,
  orthogonalMode: boolean = false,
) {
  const [d, setD] = useState<DrawState>({
    active: false, type: null, originalStart: null, start: null, end: null,
    awaitingCurveSide: false,
  });
  const ref = useRef(d);
  ref.current = d;
  const [lastWallId, setLastWallId] = useState<string | null>(null);

  const reset = useCallback(() => {
    const newState: DrawState = { active: false, type: null, originalStart: null, start: null, end: null, awaitingCurveSide: false };
    ref.current = newState;
    setD(newState);
  }, []);

  const prevWallsLenRef = useRef(walls.length);
  useEffect(() => {
    const cur = ref.current;
    const prevLen = prevWallsLenRef.current;
    prevWallsLenRef.current = walls.length;

    if (cur.active && walls.length < prevLen) {
      if (walls.length === 0) {
        const newState: DrawState = { active: false, type: null, originalStart: null, start: null, end: null, awaitingCurveSide: false };
        ref.current = newState;
        setD(newState);
      } else {
        const lastWall = walls[walls.length - 1];
        const newState: DrawState = {
          active: true,
          type: cur.type,
          originalStart: { ...lastWall.end },
          start: { ...lastWall.end },
          end: { ...lastWall.end },
        };
        ref.current = newState;
        setD(newState);
      }
    }
  }, [walls]);

  const snapToAxis = useCallback((anchor: Point, end: Point): { start: Point; end: Point } => {
    if (axes.length === 0) return { start: anchor, end };
    const dx = Math.abs(end.x - anchor.x);
    const dy = Math.abs(end.y - anchor.y);
    if (dx > dy) {
      const nearAxis = axes.find(a => a.type === 'horizontal' && Math.abs(anchor.y - (a.position - a.offset)) < SNAP_TO_AXIS);
      if (nearAxis) {
        const axisY = nearAxis.position - nearAxis.offset;
        return { start: { ...anchor, y: axisY }, end: { ...end, y: axisY } };
      }
    } else {
      const nearAxis = axes.find(a => a.type === 'vertical' && Math.abs(anchor.x - (a.position + a.offset)) < SNAP_TO_AXIS);
      if (nearAxis) {
        const axisX = nearAxis.position + nearAxis.offset;
        return { start: { ...anchor, x: axisX }, end: { ...end, x: axisX } };
      }
    }
    return { start: anchor, end };
  }, [axes]);

  const begin = useCallback((pt: Point, type: DrawingType) => {
    if (!type) return;
    const cur = ref.current;

    if (cur.active && cur.type === 'curved-wall' && cur.curveRadius) {
      return;
    }

    if (cur.active && cur.start && cur.type && cur.type === type) {
      const newState = { ...cur, end: pt };
      ref.current = newState;
      setD(newState);
      return;
    }

    const wallSnapCandidates = walls.filter(w => !w.kind || w.kind === 'wall');
    const snap = findSnapToFace(pt, wallSnapCandidates, undefined, SNAP);
    const start = snap?.point ?? pt;
    const newState: DrawState = { active: true, type, originalStart: start, start, end: pt };
    ref.current = newState;
    setD(newState);
  }, [walls]);

  const move = useCallback((pt: Point) => {
    const cur = ref.current;
    if (!cur.active || !cur.originalStart || !cur.type) return;

    const anchor = cur.originalStart;
    const angle = getAngle(anchor, pt);

    const tol = orthogonalMode ? Math.PI / 4 : 0.1;
    const snappedAngle = snapAngle(angle, tol);
    const isAngleSnapped = snappedAngle !== angle;
    const isHorizontal =
      Math.abs(snappedAngle) < 0.001 ||
      Math.abs(snappedAngle - Math.PI) < 0.001;

    let end: Point;
    if (isAngleSnapped) {
      end = isHorizontal
        ? { x: pt.x, y: anchor.y }
        : { x: anchor.x, y: pt.y };
    } else {
      end = pt;
    }

    const wallSnapCandidates = walls.filter(w => !w.kind || w.kind === 'wall');
    const faceSnap = findSnapToFace(end, wallSnapCandidates, undefined, SNAP);

    if (faceSnap) {
      if (isAngleSnapped) {
        if (isHorizontal) end = { x: faceSnap.point.x, y: anchor.y };
        else end = { x: anchor.x, y: faceSnap.point.y };
      } else {
        end = faceSnap.point;
      }
    } else {
      const result = snapToAxis(anchor, end);
      end = result.end;
    }

    const newState = { ...cur, start: anchor, end };
    ref.current = newState;
    setD(newState);
  }, [walls, snapToAxis, orthogonalMode]);

  const finishWithLength = useCallback((length: number) => {
    const cur = ref.current;
    if (!cur.active || !cur.start || !cur.end || !cur.type) return;

    const anchor = cur.originalStart ?? cur.start;
    const angle = getAngle(anchor, cur.end);
    const tol = orthogonalMode ? Math.PI / 4 : 0.1;
    const snapped = snapAngle(angle, tol);
    const end: Point = {
      x: anchor.x + Math.cos(snapped) * length,
      y: anchor.y + Math.sin(snapped) * length,
    };

    const prevWall = findPrevWall(walls, cur.type);
    const normalSign = computeNormalSign(anchor, end, prevWall);

    const newWall: Wall = {
      id: uuidv4(),
      start: { ...anchor },
      end,
      thickness: getThickness(cur.type),
      type: getWallType(cur.type),
      normalSign,
      lockDirection: false,
      lockLength: false,
      lockMove: true,
      kind: getKind(cur.type),
    };

    onAdd(newWall);
    setLastWallId(newWall.id);

    const newState: DrawState = {
      active: true, type: cur.type,
      originalStart: { ...end }, start: { ...end }, end: { ...end },
    };
    ref.current = newState;
    setD(newState);
  }, [onAdd, walls, orthogonalMode]);

  const finish = useCallback(() => {
    const cur = ref.current;
    if (!cur.active || !cur.start || !cur.end || !cur.type) { reset(); return; }
    if (cur.type === 'curved-wall') {
      if (distance(cur.start, cur.end) < 0.1) { reset(); return; }
      if (!cur.curveRadius) {
        const chord = distance(cur.start, cur.end);
        const defaultRadius = Math.max(chord, 2);
        const waitingState: DrawState = { ...cur, curveRadius: defaultRadius };
        ref.current = waitingState;
        setD(waitingState);
      }
      return;
    }

    if (distance(cur.start, cur.end) < 0.1) {
      const newState = { ...cur, end: { ...cur.start } };
      ref.current = newState;
      setD(newState);
      return;
    }

    const anchor = cur.originalStart ?? cur.start;

    // ✅ orthogonal snap عند الإنهاء — يطبّق 0/90 على النقطة النهائية
    let finalEnd: Point = { ...cur.end };
    if (orthogonalMode) {
      const angle = getAngle(anchor, cur.end);
      const snapped = snapAngle(angle, Math.PI / 4);
      const isHorizontal =
        Math.abs(snapped) < 0.001 || Math.abs(snapped - Math.PI) < 0.001;
      finalEnd = isHorizontal
        ? { x: cur.end.x, y: anchor.y }
        : { x: anchor.x, y: cur.end.y };
    }

    const prevWall = findPrevWall(walls, cur.type);
    const normalSign = computeNormalSign(anchor, finalEnd, prevWall);

    const newWall: Wall = {
      id: uuidv4(),
      start: { ...anchor },
      end: { ...finalEnd },
      thickness: getThickness(cur.type),
      type: getWallType(cur.type),
      normalSign,
      lockDirection: false,
      lockLength: false,
      lockMove: true,
      kind: getKind(cur.type),
    };

    onAdd(newWall);
    setLastWallId(newWall.id);

    const newState: DrawState = {
      active: true, type: cur.type,
      originalStart: { ...finalEnd }, start: { ...finalEnd }, end: { ...finalEnd },
    };
    ref.current = newState;
    setD(newState);
  }, [onAdd, reset, walls, orthogonalMode]);

  const updateLastWallEnd = useCallback((newEnd: Point) => {
    const cur = ref.current;
    if (!cur.active || !cur.type) return;
    const newState: DrawState = {
      active: true, type: cur.type,
      originalStart: { ...newEnd }, start: { ...newEnd }, end: { ...newEnd },
    };
    ref.current = newState;
    setD(newState);
  }, []);

  const awaitingCurveRadius = d.active && d.type === 'curved-wall' && !!d.curveRadius;

  const updateCurveRadius = useCallback((radius: number) => {
    const cur = ref.current;
    if (!cur.active || cur.type !== 'curved-wall' || !cur.curveRadius) return;
    const chord = cur.start && cur.end ? distance(cur.start, cur.end) : 0;
    const minRadius = chord / 2 + 0.01;
    const clamped = Math.max(minRadius, radius);
    const newState = { ...cur, curveRadius: clamped };
    ref.current = newState;
    setD(newState);
  }, []);

  const confirmCurvedWallRadius = useCallback((side: 1 | -1) => {
    const cur = ref.current;
    if (!cur.active || cur.type !== 'curved-wall' || !cur.curveRadius || !cur.start || !cur.end) { reset(); return; }
    const chord = distance(cur.start, cur.end);
    if (cur.curveRadius <= chord / 2) { reset(); return; }
    const newWall: Wall = {
      id: uuidv4(), start: { ...cur.start }, end: { ...cur.end }, thickness: 0.3,
      curveRadius: cur.curveRadius, curveSide: side,
      type: 'exterior', normalSign: side, lockDirection: false, lockLength: false, lockMove: false,
    };
    onAdd(newWall);
    setLastWallId(newWall.id);
    const newState: DrawState = {
      active: true, type: 'curved-wall' as DrawingType,
      originalStart: { ...cur.end }, start: { ...cur.end }, end: { ...cur.end },
    };
    ref.current = newState;
    setD(newState);
  }, [onAdd, reset]);

  const cancelCurveRadius = useCallback(() => {
    reset();
  }, [reset]);

  return {
    isDrawing: d.active, drawingType: d.type,
    tempStart: d.start, tempEnd: d.end,
    awaitingCurveRadius,
    curveRadius: d.curveRadius ?? 0,
    updateCurveRadius, confirmCurvedWallRadius, cancelCurveRadius,
    lastWallId, begin, move, finish, finishWithLength,
    cancel: reset, updateLastWallEnd,
  };
}
