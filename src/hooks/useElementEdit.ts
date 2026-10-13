import { useState, useCallback, useRef } from 'react';
import type { Point, Column, Window, Door, Wall, Axis } from '../core/types';
import { distance, closestPointOnSegment, getAngle, snapAngle, wallRectangle } from '../core/geometry';

export type ElementType = 'column' | 'window' | 'door';
export type DragMode = 'move' | 'rotate' | 'flip' | null;

interface SelectedElement { id: string; type: ElementType; }

const HANDLE = 0.6;
const SNAP = 0.3;
// ✅ رفع الحد الأدنى للحركة (15 سم) لمنع القفز عند النقر
const MIN_MOVE_FOR_DRAG = 0.15;

function getColumnCenter(col: Column): Point { return col.center || col.position; }
function getWindowCenter(win: Window, wall: Wall): Point {
  if (win.center) return win.center;
  const len = distance(wall.start, wall.end);
  return { x: wall.start.x + ((win.position + win.width / 2) / len) * (wall.end.x - wall.start.x), y: wall.start.y + ((win.position + win.width / 2) / len) * (wall.end.y - wall.start.y) };
}
function getDoorCenter(door: Door, wall: Wall): Point {
  if (door.center) return door.center;
  const len = distance(wall.start, wall.end);
  return { x: wall.start.x + ((door.position + door.width / 2) / len) * (wall.end.x - wall.start.x), y: wall.start.y + ((door.position + door.width / 2) / len) * (wall.end.y - wall.start.y) };
}

function getColumnCorners(col: Column): Point[] {
  const center = getColumnCenter(col);
  const colAngle = col.rotation || 0;
  const cos = Math.cos(colAngle);
  const sin = Math.sin(colAngle);
  const halfW = col.width / 2;
  const halfL = col.length / 2;
  const local = [{ x: -halfW, y: -halfL }, { x: halfW, y: -halfL }, { x: halfW, y: halfL }, { x: -halfW, y: halfL }];
  return local.map(c => ({ x: center.x + c.x * cos - c.y * sin, y: center.y + c.x * sin + c.y * cos }));
}

function isPointInPolygon(pt: Point, polygon: Point[]): boolean {
  let inside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const xi = polygon[i].x, yi = polygon[i].y;
    const xj = polygon[j].x, yj = polygon[j].y;
    const intersect = ((yi > pt.y) !== (yj > pt.y)) && (pt.x < (xj - xi) * (pt.y - yi) / (yj - yi) + xi);
    if (intersect) inside = !inside;
  }
  return inside;
}

function getWindowDoorCorners(el: Window | Door, wall: Wall): Point[] {
  const len = distance(wall.start, wall.end);
  if (len === 0) return [];
  const wallAngle = getAngle(wall.start, wall.end);
  const normal = { x: -Math.sin(wallAngle), y: Math.cos(wallAngle) };
  const halfThick = wall.thickness / 2;
  const center = el.center || getWindowCenter(el as Window, wall);
  const startX = center.x - Math.cos(wallAngle) * el.width / 2;
  const startY = center.y - Math.sin(wallAngle) * el.width / 2;
  const endX = center.x + Math.cos(wallAngle) * el.width / 2;
  const endY = center.y + Math.sin(wallAngle) * el.width / 2;
  return [
    { x: startX + normal.x * halfThick, y: startY + normal.y * halfThick },
    { x: endX + normal.x * halfThick, y: endY + normal.y * halfThick },
    { x: endX - normal.x * halfThick, y: endY - normal.y * halfThick },
    { x: startX - normal.x * halfThick, y: startY - normal.y * halfThick },
  ];
}

function getDoorHandles(door: Door, wall: Wall) {
  const center = door.center || getDoorCenter(door, wall);
  const wallAngle = getAngle(wall.start, wall.end);
  const normal = { x: -Math.sin(wallAngle), y: Math.cos(wallAngle) };
  const side = door.side ?? 1;
  const frameNormal = { x: normal.x * side, y: normal.y * side };
  const rotation = door.rotation || 0;
  const rotateLocal = { x: 0, y: -(door.thickness / 2 + 0.3) };
  const cosRot = Math.cos(rotation);
  const sinRot = Math.sin(rotation);
  const rotateHandle = { x: center.x + rotateLocal.x * cosRot - rotateLocal.y * sinRot, y: center.y + rotateLocal.x * sinRot + rotateLocal.y * cosRot };
  const flipHandle = { x: center.x + frameNormal.x * (door.width / 2 + 0.35) * (door.swing || 1), y: center.y + frameNormal.y * (door.width / 2 + 0.35) * (door.swing || 1) };
  return { center, rotateHandle, flipHandle };
}

export function useElementEdit(
  columns: Column[],
  windows: Window[],
  doors: Door[],
  walls: Wall[],
  updateColumn: (id: string, patch: Partial<Column>) => void,
  updateWindow: (id: string, patch: Partial<Window>) => void,
  updateDoor: (id: string, patch: Partial<Door>) => void,
  axes: Axis[] = [],
) {
  const [selected, setSelected] = useState<SelectedElement | null>(null);
  const dragModeRef = useRef<DragMode>(null);
  const dragStartRef = useRef<Point | null>(null);
  const dragStartOriginalRef = useRef<Point | null>(null);
  // ✅ قفل الحركة: لا يتحرك العنصر حتى يتحرك الإصبع مسافة كافية
  const dragActivatedRef = useRef<boolean>(false);

  const getRotateHandlePosition = useCallback((col: Column): Point => {
    const center = getColumnCenter(col);
    const colAngle = col.rotation || 0;
    const l = col.length;
    return { x: center.x + Math.sin(colAngle) * (l / 2 + 0.3), y: center.y - Math.cos(colAngle) * (l / 2 + 0.3) };
  }, []);

const isPointInsideColumn = useCallback((pt: Point, col: Column): boolean => {
    // ✅ العمود الدائري: فحص المسافة من المركز
      if (col.columnShape === 'circle') {
          const center = getColumnCenter(col);
              const radius = col.width / 2;
                  return distance(pt, center) <= radius;
                    }
                      // ✅ العمود المستطيل: فحص داخل المضلع
                        return isPointInPolygon(pt, getColumnCorners(col));
                        }, []);

  const hitTestColumn = useCallback((pt: Point, col: Column): boolean => {
    if (isPointInsideColumn(pt, col)) return true;
    return distance(pt, getRotateHandlePosition(col)) <= HANDLE;
  }, [getRotateHandlePosition, isPointInsideColumn]);

  // ✅ فحص نقطة داخل مضلع + هامش تسامح حول الحواف
  const hitTestPolygonWithTolerance = useCallback(
    (pt: Point, polygon: Point[], tol: number = 0.10): boolean => {
        if (isPointInPolygon(pt, polygon)) return true;
            for (let i = 0; i < polygon.length; i++) {
                  const a = polygon[i];
                        const b = polygon[(i + 1) % polygon.length];
                              const cp = closestPointOnSegment(pt, a, b);
                                    if (distance(pt, cp) <= tol) return true;
                                        }
                                            return false;
                                              },
                                                [],
                                                );

                                                const hitTestWindow = useCallback((pt: Point, win: Window): boolean => {
                                                  const wall = walls.find(w => w.id === win.wallId);
                                                    if (!wall) return false;
                                                      const corners = getWindowDoorCorners(win, wall);
                                                        // ✅ تسامح 10 سم حول النافذة
                                                          return hitTestPolygonWithTolerance(pt, corners, 0.10);
                                                          }, [walls, hitTestPolygonWithTolerance]);

                                                          // ✅ إطار الباب فقط (بدون المقابض) — يُستخدم عند عدم تحديد الباب
                                                          const hitTestDoorFrame = useCallback((pt: Point, door: Door): boolean => {
                                                            const wall = walls.find(w => w.id === door.wallId);
                                                              if (!wall) return false;
                                                                const corners = getWindowDoorCorners(door, wall);
                                                                  // ✅ تسامح 10 سم حول إطار الباب
                                                                    return hitTestPolygonWithTolerance(pt, corners, 0.10);
                                                                    }, [walls, hitTestPolygonWithTolerance]);

                                                                    // ✅ مقابض الباب (تُفحَص فقط عندما يكون الباب محدداً)
                                                                    const hitTestDoorHandle = useCallback((pt: Point, door: Door): 'rotate' | 'flip' | null => {
                                                                      const wall = walls.find(w => w.id === door.wallId);
                                                                        if (!wall) return null;
                                                                          const { rotateHandle, flipHandle } = getDoorHandles(door, wall);
                                                                            if (distance(pt, rotateHandle) <= HANDLE) return 'rotate';
                                                                              if (distance(pt, flipHandle) <= HANDLE) return 'flip';
                                                                                return null;
                                                                                }, [walls]);
                                                  

  const hitTest = useCallback((pt: Point): { id: string; type: ElementType } | null => {
      // ✅ 1) إذا كان هناك عنصر محدد، افحص مقابضه أولاً (فقط نفس العنصر)
        if (selected) {
            if (selected.type === 'door') {
                  const door = doors.find(d => d.id === selected.id);
                        if (door && hitTestDoorHandle(pt, door)) {
                                return { id: door.id, type: 'door' };
                                      }
                                          }
                                              if (selected.type === 'column') {
                                                    const col = columns.find(c => c.id === selected.id);
                                                          if (col && distance(pt, getRotateHandlePosition(col)) <= HANDLE) {
                                                                  return { id: col.id, type: 'column' };
                                                                        }
                                                                            }
                                                                              }

                                                                                // ✅ 2) الفحص العادي — إطار الباب فقط (بدون المقابض)
                                                                                  for (const win of windows) if (hitTestWindow(pt, win)) return { id: win.id, type: 'window' };
                                                                                    for (const door of doors) if (hitTestDoorFrame(pt, door)) return { id: door.id, type: 'door' };
                                                                                      for (const col of columns) if (hitTestColumn(pt, col)) return { id: col.id, type: 'column' };
                                                                                        return null;
                                                                                        }, [selected, columns, windows, doors, hitTestColumn, hitTestWindow, hitTestDoorFrame, hitTestDoorHandle, getRotateHandlePosition]);
  

  const detectMode = useCallback((pt: Point, id: string, type: ElementType): DragMode => {
    if (type === 'column') {
      const col = columns.find(c => c.id === id);
      if (!col) return 'move';
      if (isPointInsideColumn(pt, col)) return 'move';
      if (distance(pt, getRotateHandlePosition(col)) <= HANDLE) return 'rotate';
      return 'move';
    }
    if (type === 'door') {
      const door = doors.find(d => d.id === id);
      if (!door) return 'move';
      const wall = walls.find(w => w.id === door.wallId);
      if (!wall) return 'move';
      if (isPointInPolygon(pt, getWindowDoorCorners(door, wall))) return 'move';
      const { rotateHandle, flipHandle } = getDoorHandles(door, wall);
      if (distance(pt, rotateHandle) <= HANDLE) return 'rotate';
      if (distance(pt, flipHandle) <= HANDLE) return 'flip';
      return 'move';
    }
    return 'move';
  }, [columns, doors, walls, getRotateHandlePosition, isPointInsideColumn]);

  const snapCornersToWalls = useCallback((corners: Point[]): { offsetX: number; offsetY: number } => {
    let bestOffsetX = 0;
    let bestOffsetY = 0;
    let bestDist = SNAP;
    for (const corner of corners) {
      for (const wall of walls) {
        const rect = wallRectangle(wall);
        for (const face of rect.faces) {
          const cp = closestPointOnSegment(corner, face.start, face.end);
          const d = distance(corner, cp);
          if (d < bestDist) {
            bestDist = d;
            bestOffsetX = cp.x - corner.x;
            bestOffsetY = cp.y - corner.y;
          }
        }
      }
    }
    return { offsetX: bestOffsetX, offsetY: bestOffsetY };
  }, [walls]);

  const select = useCallback((id: string, type: ElementType, pt: Point, mode: DragMode = 'move') => {
    setSelected({ id, type });
    dragStartRef.current = pt;
    dragStartOriginalRef.current = pt;
    dragModeRef.current = mode;
    // ✅ إعادة تعيين قفل الحركة
    dragActivatedRef.current = false;
  }, []);

  const deselect = useCallback(() => {
    setSelected(null);
    dragModeRef.current = null;
    dragStartRef.current = null;
    dragStartOriginalRef.current = null;
    dragActivatedRef.current = false;
  }, []);

  const moveDrag = useCallback((pt: Point) => {
    if (!selected || !dragModeRef.current || !dragStartRef.current || !dragStartOriginalRef.current) return;

    // ✅ حساب المسافة الإجمالية من نقطة البداية
    const totalDx = pt.x - dragStartOriginalRef.current.x;
    const totalDy = pt.y - dragStartOriginalRef.current.y;
    const totalDistance = Math.hypot(totalDx, totalDy);

    // ✅ إذا لم يتحرك الإصبع مسافة كافية، لا تفعل شيئاً
    if (!dragActivatedRef.current) {
      if (totalDistance < MIN_MOVE_FOR_DRAG) {
        return;
      }
      // ✅ تفعيل الحركة بمجرد تجاوز الحد
      dragActivatedRef.current = true;
      dragStartRef.current = pt;
      return;
    }

    const dx = pt.x - dragStartRef.current.x;
    const dy = pt.y - dragStartRef.current.y;
    dragStartRef.current = pt;

    if (selected.type === 'column') {
      const col = columns.find(c => c.id === selected.id);
      if (!col) return;
      if (dragModeRef.current === 'move') {
        const center = getColumnCenter(col);
        const rawPos = { x: center.x + dx, y: center.y + dy };
        const movedCorners = getColumnCorners({ ...col, position: rawPos, center: rawPos });
        const snap = snapCornersToWalls(movedCorners);

        let finalX = rawPos.x + snap.offsetX;
        let finalY = rawPos.y + snap.offsetY;

        if (snap.offsetX === 0 && snap.offsetY === 0 && axes.length > 0) {
          const vAxis = axes.find(a => a.type === 'vertical' && Math.abs(rawPos.x - (a.position + a.offset)) < 0.5);
          if (vAxis) finalX = vAxis.position + vAxis.offset;
          const hAxis = axes.find(a => a.type === 'horizontal' && Math.abs(rawPos.y - (a.position - a.offset)) < 0.5);
          if (hAxis) finalY = hAxis.position - hAxis.offset;
        }

        updateColumn(selected.id, { position: { x: finalX, y: finalY }, center: { x: finalX, y: finalY } });
      } else if (dragModeRef.current === 'rotate') {
        const center = getColumnCenter(col);
        let newAngle = getAngle(center, pt) + Math.PI / 2;
        newAngle = snapAngle(newAngle, 0.15);
        updateColumn(selected.id, { rotation: newAngle });
      }
    } else if (selected.type === 'window') {
      const win = windows.find(w => w.id === selected.id);
      if (!win) return;
      const wall = walls.find(w => w.id === win.wallId);
      if (!wall) return;
      const center = getWindowCenter(win, wall);
      const rawCenter = { x: center.x + dx, y: center.y + dy };
      const tempWin = { ...win, center: rawCenter };
      const corners = getWindowDoorCorners(tempWin, wall);
      const snap = snapCornersToWalls(corners);
      const snappedCenter = { x: rawCenter.x + snap.offsetX, y: rawCenter.y + snap.offsetY };
      updateWindow(selected.id, { center: snappedCenter });
    } else if (selected.type === 'door') {
      const door = doors.find(d => d.id === selected.id);
      if (!door) return;
      const wall = walls.find(w => w.id === door.wallId);
      if (!wall) return;
      if (dragModeRef.current === 'flip') {
        updateDoor(door.id, { swing: door.swing === 1 ? -1 : 1 });
        dragModeRef.current = null;
        return;
      }
      if (dragModeRef.current === 'rotate') {
        const center = getDoorCenter(door, wall);
        let newAngle = getAngle(center, pt);
        newAngle = snapAngle(newAngle, 0.15);
        updateDoor(selected.id, { rotation: newAngle });
        return;
      }
      const center = getDoorCenter(door, wall);
      const rawCenter = { x: center.x + dx, y: center.y + dy };
      const tempDoor = { ...door, center: rawCenter };
      const corners = getWindowDoorCorners(tempDoor, wall);
      const snap = snapCornersToWalls(corners);
      const snappedCenter = { x: rawCenter.x + snap.offsetX, y: rawCenter.y + snap.offsetY };
      updateDoor(selected.id, { center: snappedCenter });
    }
  }, [selected, columns, windows, doors, walls, updateColumn, updateWindow, updateDoor, snapCornersToWalls, axes]);

  const endDrag = useCallback(() => {
    dragModeRef.current = null;
    dragStartRef.current = null;
    dragStartOriginalRef.current = null;
    dragActivatedRef.current = false;
  }, []);

  return { selected, hitTest, detectMode, select, deselect, moveDrag, endDrag };
                          }
