import { useState, useCallback, useRef } from 'react';
import type { Point, Wall, EditType, LockOptions, Axis } from '../core/types';
import { distance, getAngle, snapAngle, closestPointOnSegment, normalize } from '../core/geometry';
import { findSnapToFace } from '../core/snapToFace';
import { getCurvedWallGeometry } from '../core/curvedWallGeometry';
import { SNAP_THRESHOLD } from '../core/types';
import { v4 as uuidv4 } from 'uuid';

const HANDLE = 0.2;

function sub(a: Point, b: Point): Point { return { x: a.x - b.x, y: a.y - b.y }; }
function cloneWall(w: Wall): Wall { return { ...w, start: { ...w.start }, end: { ...w.end } }; }

interface EditState { selectedId: string | null; editType: EditType; }
type SetWalls = React.Dispatch<React.SetStateAction<Wall[]>>;

export function useWallEditor(
    walls: Wall[],
      setWalls: SetWalls,
        axes: Axis[] = [],
          orthogonalMode: boolean = false,
          ) {
 const [state, setState] = useState<EditState>({ selectedId: null, editType: 'none' });
  const dragStartRef = useRef<Point | null>(null);
  const originalRef = useRef<Wall | null>(null);

  const hitTest = useCallback((pt: Point, wall: Wall): EditType => {
    const dStart = distance(pt, wall.start);
    const dEnd = distance(pt, wall.end);
    if (dStart <= HANDLE) return 'extendStart';
    if (dEnd <= HANDLE) return 'extendEnd';
    if (wall.curveRadius) {
      const geometry = getCurvedWallGeometry(wall);
      if (geometry) {
        let nearest = Infinity;
        const span = geometry.anticlockwise
          ? geometry.startAngle - geometry.endAngle
          : geometry.endAngle - geometry.startAngle;
        for (let i = 0; i <= 48; i++) {
          const angle = geometry.startAngle + (geometry.anticlockwise ? -1 : 1) * span * (i / 48);
          const sample = { x: geometry.center.x + Math.cos(angle) * geometry.radius, y: geometry.center.y + Math.sin(angle) * geometry.radius };
          nearest = Math.min(nearest, distance(pt, sample));
        }
        return nearest <= wall.thickness / 2 + HANDLE ? 'move' : 'none';
      }
    }
    const cp = closestPointOnSegment(pt, wall.start, wall.end);
    return distance(pt, cp) <= wall.thickness / 2 + HANDLE ? 'move' : 'none';
  }, []);

  const select = useCallback((id: string, type: EditType, pt: Point) => {
    const wall = walls.find(w => w.id === id);
    if (!wall) return;
    dragStartRef.current = pt;
    originalRef.current = cloneWall(wall);
    setState({ selectedId: id, editType: type });
  }, [walls]);

  const deselect = useCallback(() => {
    dragStartRef.current = null;
    originalRef.current = null;
    setState({ selectedId: null, editType: 'none' });
  }, []);

  const moveEdit = useCallback((pt: Point) => {
    const original = originalRef.current;
    const start = dragStartRef.current;
    if (!original || !start || state.selectedId === null || state.editType === 'none') return;
    const dx = pt.x - start.x;
    const dy = pt.y - start.y;
    const { selectedId, editType } = state;
    const lockDirection = original.lockDirection;
    const lockLength = original.lockLength;

    setWalls(prevWalls => prevWalls.map(wall => {
      if (wall.id !== selectedId) return wall;

      if (editType === 'move') {
        if (original.lockMove) return wall;
        let newStart: Point = { x: original.start.x + dx, y: original.start.y + dy };
        let newEnd: Point = { x: original.end.x + dx, y: original.end.y + dy };

        const ss = findSnapToFace(newStart, prevWalls, selectedId, SNAP_THRESHOLD);
        const se = findSnapToFace(newEnd, prevWalls, selectedId, SNAP_THRESHOLD);

        if (lockDirection || lockLength) {
          const originalLength = distance(original.start, original.end);
          const originalAngle = getAngle(original.start, original.end);
          if (ss) {
            newStart = ss.point;
            newEnd = { x: newStart.x + Math.cos(originalAngle) * originalLength, y: newStart.y + Math.sin(originalAngle) * originalLength };
          } else if (se) {
            newEnd = se.point;
            newStart = { x: newEnd.x - Math.cos(originalAngle) * originalLength, y: newEnd.y - Math.sin(originalAngle) * originalLength };
          }
        } else {
          if (ss) newStart = ss.point;
          if (se) newEnd = se.point;

          if (!ss && !se && axes.length > 0) {
            const dx2 = Math.abs(newEnd.x - newStart.x);
            const dy2 = Math.abs(newEnd.y - newStart.y);
            const halfThick = wall.thickness / 2;
            if (dx2 > dy2) {
              const nearAxis = axes.find(a => a.type === 'horizontal' && Math.abs(newStart.y - (a.position - a.offset + halfThick)) < 0.5);
              if (nearAxis) {
                const adjustedY = nearAxis.position - nearAxis.offset - halfThick;
                newStart = { ...newStart, y: adjustedY };
                newEnd = { ...newEnd, y: adjustedY };
              }
            } else {
              const nearAxis = axes.find(a => a.type === 'vertical' && Math.abs(newStart.x - (a.position + a.offset - halfThick)) < 0.5);
              if (nearAxis) {
                const adjustedX = nearAxis.position + nearAxis.offset + halfThick;
                newStart = { ...newStart, x: adjustedX };
                newEnd = { ...newEnd, x: adjustedX };
              }
            }
          }
        }
        return { ...wall, start: newStart, end: newEnd };
      }

      if (editType === 'extendStart') {
        let ns: Point = { x: original.start.x + dx, y: original.start.y + dy };
        const tol = orthogonalMode ? Math.PI / 4 : 0.1;
        if (lockDirection) {
          const ang = snapAngle(getAngle(original.start, original.end), tol);
            const horizontal = Math.abs(ang) < 0.001 || Math.abs(ang - Math.PI) < 0.001;
              ns = horizontal ? { x: ns.x, y: original.start.y } : { x: original.start.x, y: ns.y };
              } else {
                const ang = snapAngle(getAngle(ns, original.end), tol);
                  const horizontal = Math.abs(ang) < 0.001 || Math.abs(ang - Math.PI) < 0.001;
                    const vertical = Math.abs(ang - Math.PI / 2) < 0.001 || Math.abs(ang - (3 * Math.PI) / 2) < 0.001;
                      if (horizontal) ns = { x: ns.x, y: original.end.y };
                        else if (vertical) ns = { x: original.end.x, y: ns.y };
                        }
        if (lockLength) {
          const dir = normalize(sub(original.end, ns));
          const len = distance(original.start, original.end);
          ns = { x: original.end.x - dir.x * len, y: original.end.y - dir.y * len };
        }
        const snap = findSnapToFace(ns, prevWalls, selectedId, SNAP_THRESHOLD);
        if (snap) ns = snap.point;
        return { ...wall, start: ns };
      }

      if (editType === 'extendEnd') {
        let ne: Point = { x: original.end.x + dx, y: original.end.y + dy };
        const tol = orthogonalMode ? Math.PI / 4 : 0.1;
        if (lockDirection) {
          const ang = snapAngle(getAngle(original.start, original.end), tol);
            const horizontal = Math.abs(ang) < 0.001 || Math.abs(ang - Math.PI) < 0.001;
              ne = horizontal ? { x: ne.x, y: original.end.y } : { x: original.end.x, y: ne.y };
              } else {
                const ang = snapAngle(getAngle(original.start, ne), tol);
                  const horizontal = Math.abs(ang) < 0.001 || Math.abs(ang - Math.PI) < 0.001;
                    const vertical = Math.abs(ang - Math.PI / 2) < 0.001 || Math.abs(ang - (3 * Math.PI) / 2) < 0.001;
                      if (horizontal) ne = { x: ne.x, y: original.start.y };
                        else if (vertical) ne = { x: original.start.x, y: ne.y };
                        }
        if (lockLength) {
          const dir = normalize(sub(ne, original.start));
          const len = distance(original.start, original.end);
          ne = { x: original.start.x + dir.x * len, y: original.start.y + dir.y * len };
        }
        const snap = findSnapToFace(ne, prevWalls, selectedId, SNAP_THRESHOLD);
        if (snap) ne = snap.point;
        return { ...wall, end: ne };
      }

      return wall;
    }));
  }, [state, setWalls, axes, orthogonalMode]);

  const endEdit = useCallback(() => {
    dragStartRef.current = null;
    originalRef.current = null;
  }, []);

  const deleteSelected = useCallback(() => {
    if (!state.selectedId) return;
    setWalls(prev => prev.filter(w => w.id !== state.selectedId));
    deselect();
  }, [state.selectedId, setWalls, deselect]);

  const copySelected = useCallback(() => {
    const wall = walls.find(w => w.id === state.selectedId);
    if (!wall) return;
    const copy: Wall = { ...wall, id: uuidv4(), start: { x: wall.start.x + 1, y: wall.start.y + 1 }, end: { x: wall.end.x + 1, y: wall.end.y + 1 } };
    setWalls(prev => [...prev, copy]);
  }, [walls, state.selectedId, setWalls]);

  const changeLength = useCallback((len: number) => {
    if (!state.selectedId) return;
    setWalls(prev => prev.map(w => {
      if (w.id !== state.selectedId) return w;
      const dir = normalize(sub(w.end, w.start));
      return { ...w, end: { x: w.start.x + dir.x * len, y: w.start.y + dir.y * len } };
    }));
  }, [state.selectedId, setWalls]);

  const changeRadius = useCallback((radius: number) => {
    if (!state.selectedId) return;
    setWalls(prev => prev.map(w => w.id === state.selectedId && w.curveRadius ? { ...w, curveRadius: Math.max(radius, distance(w.start, w.end) / 2 + 0.01) } : w));
  }, [state.selectedId, setWalls]);

  const changeThickness = useCallback((t: number) => {
    if (!state.selectedId) return;
    setWalls(prev => prev.map(w => w.id === state.selectedId ? { ...w, thickness: t } : w));
  }, [state.selectedId, setWalls]);

  const toggleLockDirection = useCallback(() => {
    if (!state.selectedId) return;
    setWalls(prev => prev.map(w => w.id === state.selectedId ? { ...w, lockDirection: !w.lockDirection } : w));
  }, [state.selectedId, setWalls]);

  const toggleLockLength = useCallback(() => {
    if (!state.selectedId) return;
    setWalls(prev => prev.map(w => w.id === state.selectedId ? { ...w, lockLength: !w.lockLength } : w));
  }, [state.selectedId, setWalls]);

  const toggleLockMove = useCallback(() => {
    if (!state.selectedId) return;
    setWalls(prev => prev.map(w => w.id === state.selectedId ? { ...w, lockMove: !w.lockMove } : w));
  }, [state.selectedId, setWalls]);

  const selectedWall = walls.find(w => w.id === state.selectedId) ?? null;

  const lockOptions: LockOptions = {
    direction: selectedWall?.lockDirection ?? false,
    length: selectedWall?.lockLength ?? false,
    move: selectedWall?.lockMove ?? true,
  };

  return {
    selectedWallId: state.selectedId,
    editType: state.editType,
    isEditing: state.selectedId !== null,
    lockOptions,
    selectedWall,
    hitTest,
    select,
    deselect,
    moveEdit,
    endEdit,
    deleteSelected,
    copySelected,
    changeLength,
    changeRadius,
    changeThickness,
    toggleLockDirection,
    toggleLockLength,
    toggleLockMove,
  };
          }
