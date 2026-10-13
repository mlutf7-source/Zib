import { useState, useCallback, useRef } from 'react';
import type { Point, StairElement, Wall } from '../core/types';
import { distance } from '../core/geometry';
import { getElementCorners, isPointInElement, snapElementToOthers, snapElementToWalls } from '../core/stairElementGeometry';

export type StairElementDragMode = 'move' | 'rotate' | null;

const HANDLE_TOL = 0.4;
const SNAP_TOL = 0.15;
// ✅ أدنى مسافة حركة قبل تفعيل Snap (لمنع القفز عند اللمس)
const SNAP_MIN_MOVE = 0.05;

export function useStairElementEdit() {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const dragModeRef = useRef<StairElementDragMode>(null);
  const dragStartRef = useRef<Point | null>(null);
  const originalRef = useRef<StairElement | null>(null);

  const hitTest = useCallback((pt: Point, el: StairElement): StairElementDragMode => {
      // ✅ 1) إذا كان العنصر محدداً بالفعل → اسمح بمقبض التدوير
        if (selectedId === el.id) {
            const corners = getElementCorners(el);
                const topMid = {
                      x: (corners[0].x + corners[1].x) / 2,
                            y: (corners[0].y + corners[1].y) / 2,
                                };
                                    const dirX = topMid.x - el.position.x;
                                        const dirY = topMid.y - el.position.y;
                                            const dirLen = Math.hypot(dirX, dirY) || 1;
                                                const rotateHandle = {
                                                      x: topMid.x + (dirX / dirLen) * 0.6,
                                                            y: topMid.y + (dirY / dirLen) * 0.6,
                                                                };
                                                                    if (distance(pt, rotateHandle) <= HANDLE_TOL) return 'rotate';
                                                                      }

                                                                        // ✅ 2) التحديد الأولي: فقط إذا كان النقر **داخل** العنصر
                                                                          if (isPointInElement(pt, el)) return 'move';
                                                                            return null;
                                                                            }, [selectedId]);
  

  const select = useCallback((el: StairElement, pt: Point, mode: StairElementDragMode) => {
    setSelectedId(el.id);
    dragModeRef.current = mode;
    dragStartRef.current = pt;
    originalRef.current = { ...el };
  }, []);

  const deselect = useCallback(() => {
    setSelectedId(null);
    dragModeRef.current = null;
    dragStartRef.current = null;
    originalRef.current = null;
  }, []);

  const moveDrag = useCallback(
    (
      pt: Point,
      allElements: StairElement[],
      onUpdate: (id: string, patch: Partial<StairElement>) => void,
      walls?: Wall[]
    ) => {
      const original = originalRef.current;
const startPt = dragStartRef.current;
const mode = dragModeRef.current;
if (!original || !startPt || !mode) return;

// ✅ العنصر المقفل: امنع التحريك والتدوير
if (original.locked) return;

if (mode === 'rotate') {
        const angle = Math.atan2(pt.y - original.position.y, pt.x - original.position.x);
        const snapped = Math.round(angle / (Math.PI / 2)) * (Math.PI / 2);
        onUpdate(original.id, { rotation: snapped });
        return;
      }

      // move
      const dx = pt.x - startPt.x;
      const dy = pt.y - startPt.y;
      let moved: StairElement = {
        ...original,
        position: { x: original.position.x + dx, y: original.position.y + dy },
      };

      // ✅ لا تفعّل Snap إلا بعد حركة كافية
      const movedDist = Math.hypot(dx, dy);
      if (movedDist > SNAP_MIN_MOVE) {
        if (walls && walls.length > 0) {
          moved = snapElementToWalls(moved, walls, SNAP_TOL);
        }
        moved = snapElementToOthers(moved, allElements, SNAP_TOL);
      }

      onUpdate(moved.id, { position: moved.position });
    },
    []
  );

  const endDrag = useCallback(() => {
    dragModeRef.current = null;
    dragStartRef.current = null;
    originalRef.current = null;
  }, []);

  return { selectedId, setSelectedId, hitTest, select, deselect, moveDrag, endDrag };
}
