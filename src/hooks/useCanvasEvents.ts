import { useRef, useCallback } from 'react';
import type { Wall, AppMode, DrawingType, TextElement, Stair, NorthArrow, Point, PlanImage, Axis, StairElement, RoundedCorner } from '../core/types';
import type { Dimension } from '../core/dimensionTypes';
import type { RoomRegion, RegionType } from '../core/regionTypes';
import type { LayersState } from '../components/Toolbar/LayersPanel';
import { screenToWorld, PX_PER_METER } from '../core/geometry';
import { useCanvasSetup } from './useCanvasSetup';
import { getElementCorners, isPointInElement } from '../core/stairElementGeometry';
import { hitTestRoundedCorner } from '../components/Canvas/canvasRenderer/computeCorner';

type SetupReturn = ReturnType<typeof useCanvasSetup>;

interface EventsProps {
  walls: Wall[]; mode: AppMode; drawingType: DrawingType; onModeChange: (m: AppMode) => void;
  dimensions: Dimension[]; layers: LayersState; texts: TextElement[]; regions: RoomRegion[]; stairs: Stair[]; northArrows: NorthArrow[];
  frozen: boolean; onAddStairAtPoint: (pt: Point) => void; onUpdateStair: (id: string, patch: Partial<Stair>) => void;
  onPlaceColumn: (pt: Point) => void; onPlaceWindow: (pt: Point) => void; onPlaceDoor: (pt: Point) => void; onPlaceRegion: (pt: Point, type: RegionType) => void;
  onAddText: (position: Point, text: string) => void; setup: SetupReturn;
  planImage?: PlanImage | null; onPlanImageChange?: (img: PlanImage) => void; onImageSelect?: (id: string | null) => void;
  axes: Axis[];stairElements: StairElement[];
stairElementEdit: {
  selectedId: string | null;
  setSelectedId: (id: string | null) => void;
  hitTest: (pt: Point, el: any) => 'move' | 'rotate' | null;
  select: (el: any, pt: Point, mode: any) => void;
  deselect: () => void;
  moveDrag: (pt: Point, all: any[], onUpdate: any, walls?: any[]) => void;   // ✅ أضفنا walls?
  endDrag: () => void;
};
  onUpdateStairElement: (id: string, patch: Partial<StairElement>) => void;
      onRoundCornerWallClick?: (wallId: string) => void;
        roundCornerFirstWallId?: string | null;
          selectedRoundedCornerId?: string | null;
          onSelectRoundedCorner?: (id: string | null) => void;
            roundedCorners?: RoundedCorner[];
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
function isPointNearStair(pt: Point, stair: Stair): boolean { return isPointInPolygon(pt, stair.polygon); }

export function useCanvasEvents({
  walls, mode, drawingType, onModeChange, dimensions, layers, texts, regions, stairs, northArrows, frozen,
  onAddStairAtPoint, onUpdateStair, onPlaceColumn, onPlaceWindow, onPlaceDoor, onPlaceRegion, onAddText, setup,
  planImage, onPlanImageChange, onImageSelect, axes,
    stairElements, stairElementEdit, onUpdateStairElement,   // ✅ مضاف
        onRoundCornerWallClick,
          roundCornerFirstWallId,
            selectedRoundedCornerId,
              onSelectRoundedCorner,
                roundedCorners: roundedCornersProp,
          }: EventsProps) {
  const { containerRef, view, setZoom, pan, setView, drawing, edit, dimensionMode, dimensionEdit, elementEdit, textEdit, stairEdit, northArrowEdit, clipFrameEdit, axisEdit, setSelectedRegionId, setSelectedStairId } = setup;  const pointersRef = useRef<Map<number, { x: number; y: number }>>(new Map());
  const pinchRef = useRef<{ dist: number; zoom: number; cx: number; cy: number } | null>(null);
  const downPointRef = useRef<{ world: { x: number; y: number }; type: string } | null>(null);
  const stairDragCandidateRef = useRef<{ pt: Point; stair: Stair } | null>(null);

  const getPoint = useCallback((e: React.PointerEvent) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return null;
    const clientX = e.clientX - rect.left, clientY = e.clientY - rect.top;
    return { clientX, clientY, world: screenToWorld(clientX, clientY, rect.width, rect.height, view.zoom, view.offsetX, view.offsetY) };
  }, [view, containerRef]);

  const zoomAtPoint = useCallback((cx: number, cy: number, factor: number) => {
    const rect = containerRef.current?.getBoundingClientRect(); if (!rect) return;
    const scale = PX_PER_METER * view.zoom;
    const wx = (cx - rect.width / 2) / scale - view.offsetX;
    const wy = (cy - rect.height / 2) / scale - view.offsetY;
    const nz = Math.min(3, Math.max(0.05, view.zoom * factor));
    const ns = PX_PER_METER * nz;
    setView({ zoom: nz, offsetX: (cx - rect.width / 2) / ns - wx, offsetY: (cy - rect.height / 2) / ns - wy });
  }, [view, setView, containerRef]);

  const onPointerDown = useCallback((e: React.PointerEvent) => {
    const rect = containerRef.current?.getBoundingClientRect(); if (!rect) return;
    const cx = e.clientX - rect.left, cy = e.clientY - rect.top;
    pointersRef.current.set(e.pointerId, { x: cx, y: cy });
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    if (pointersRef.current.size === 2 && mode !== 'drawing' && mode !== 'dimension') {
      const pts = Array.from(pointersRef.current.values());
      pinchRef.current = { dist: Math.hypot(pts[1].x - pts[0].x, pts[1].y - pts[0].y), zoom: view.zoom, cx: (pts[0].x + pts[1].x) / 2, cy: (pts[0].y + pts[1].y) / 2 };
      downPointRef.current = null; return;
    }
        const pt = getPoint(e); if (!pt) return;
// ✅ حماية من null
if (!edit || !elementEdit || !textEdit || !dimensionEdit || !northArrowEdit || !clipFrameEdit || !axisEdit || !drawing || !dimensionMode) {
  return;
  }
        // ✅ وضع الأركان المقوسة — النقر على جدار يختاره
        
if (mode === 'round-corner') {
    const normalWalls = walls.filter(w => w.kind === undefined || w.kind === 'wall');
      const hitWall = normalWalls.find(w => edit.hitTest(pt.world, w) !== 'none');
        if (hitWall && onRoundCornerWallClick) {
            onRoundCornerWallClick(hitWall.id);
              }
                downPointRef.current = null;
                  return;
                  }

                

                              if (planImage && mode === 'view') {
  // ✅ فحص النقر على الصورة (مع الأخذ في الاعتبار الدوران)
  const rotation = planImage.rotation || 0;
  const cx = planImage.x + planImage.width / 2;
  const cy = planImage.y + planImage.height / 2;
  // تحويل نقطة النقر إلى إحداثيات الصورة المحلية (عكس الدوران)
  const dx = pt.world.x - cx;
  const dy = pt.world.y - cy;
  const cos = Math.cos(-rotation);
  const sin = Math.sin(-rotation);
  const localX = dx * cos - dy * sin + planImage.width / 2;
  const localY = dx * sin + dy * cos + planImage.height / 2;
  const isInside = localX >= 0 && localX <= planImage.width && localY >= 0 && localY <= planImage.height;

  if (isInside) {
    if (onImageSelect) onImageSelect(planImage.id || 'image-1');
    // ✅ إذا كانت الصورة غير مقفلة، اسمح بالسحب
    if (!planImage.locked && onPlanImageChange) {
      downPointRef.current = { world: pt.world, type: 'dragImage' };
    }
    return;
  } else {
    // ✅ إذا نقر خارج الصورة، إلغاء التحديد
    if (planImage.isSelected && onPlanImageChange) {
      onPlanImageChange({ ...planImage, isSelected: false });
    }
  }
}
    if (setup.clipFrame && clipFrameEdit.hitTest(pt.world, setup.clipFrame)) {
      const dragMode = clipFrameEdit.detectMode(pt.world, setup.clipFrame);
      clipFrameEdit.select(setup.clipFrame.id, pt.world, dragMode);
      downPointRef.current = { world: pt.world, type: 'clipFrameEdit' }; return;
    }

    if (mode === 'stair') { onAddStairAtPoint(pt.world); downPointRef.current = null; return; }
    if (mode === 'text') { const text = window.prompt('أدخل النص:'); if (text && text.trim()) onAddText(pt.world, text.trim()); downPointRef.current = null; return; }
    if (mode === 'kitchen' || mode === 'bathroom') { onPlaceRegion(pt.world, mode === 'kitchen' ? 'kitchen' : 'bathroom'); downPointRef.current = null; return; }
    if (mode === 'column') { if (layers.columns) onPlaceColumn(pt.world); downPointRef.current = null; return; }
    if (mode === 'window') { if (layers.windows) onPlaceWindow(pt.world); downPointRef.current = null; return; }
    if (mode === 'door') { if (layers.doors) onPlaceDoor(pt.world); downPointRef.current = null; return; }
// ✅ فحص الطبقة المناسبة حسب نوع الرسم
if (mode === 'drawing') {
  const layerKey: keyof LayersState =
      drawingType === 'land-boundary' ? 'landBoundaries'
          : drawingType === 'helper-line' ? 'helperLines'
              : 'walls';
                if (layers[layerKey]) drawing.begin(pt.world, drawingType);
                  downPointRef.current = null;
                    return;
                    }
                        if (mode === 'dimension') { if (layers.dimensions) { dimensionMode.begin(pt.world); downPointRef.current = { world: pt.world, type: 'dimension' }; } return; }

    if (northArrows.length > 0 && layers.northArrow) { const hitArrow = northArrows.find(a => northArrowEdit.hitTest(pt.world, a)); if (hitArrow) { const dragMode = northArrowEdit.detectMode(pt.world, hitArrow); northArrowEdit.select(hitArrow.id, pt.world, dragMode); downPointRef.current = { world: pt.world, type: 'northArrowEdit' }; return; } }
    if (layers.texts) { const hitText = texts.find(t => textEdit.hitTest(pt.world, t)); if (hitText) { const dragMode = textEdit.detectMode(pt.world, hitText); textEdit.select(hitText.id, pt.world, dragMode); downPointRef.current = { world: pt.world, type: 'textEdit' }; return; } }
    if (regions.length > 0 && layers.regions) { const hitRegion = regions.find(r => isPointInPolygon(pt.world, r.polygon)); if (hitRegion) { setSelectedRegionId(hitRegion.id); downPointRef.current = { world: pt.world, type: 'regionEdit' }; return; } else { setSelectedRegionId(null); } }
    if (stairs.length > 0 && layers.stairs) { const hitStair = stairs.find(s => isPointNearStair(pt.world, s)); if (hitStair) { setSelectedStairId(hitStair.id); stairDragCandidateRef.current = { pt: pt.world, stair: hitStair }; downPointRef.current = { world: pt.world, type: 'stairCandidate' }; return; } else { setSelectedStairId(null); } }
    const elementHit = elementEdit.hitTest(pt.world);
    if (elementHit) { const layerKey = elementHit.type === 'column' ? 'columns' : elementHit.type === 'window' ? 'windows' : 'doors'; if (layers[layerKey]) { const dragMode = elementEdit.detectMode(pt.world, elementHit.id, elementHit.type); elementEdit.select(elementHit.id, elementHit.type, pt.world, dragMode); downPointRef.current = { world: pt.world, type: 'elementEdit' }; return; } }
    if (layers.dimensions) { if (dimensionEdit.selectedDimId) { const selectedDim = dimensions.find(d => d.id === dimensionEdit.selectedDimId); if (selectedDim) { const hit = dimensionEdit.hitTest(pt.world, selectedDim); if (hit !== null) { dimensionEdit.select(selectedDim.id, hit, pt.world); downPointRef.current = { world: pt.world, type: 'dimensionEdit' }; return; } } } if (dimensions.length > 0) { const hitDim = dimensions.map(dim => ({ dim, type: dimensionEdit.hitTest(pt.world, dim) })).find(h => h.type !== null); if (hitDim && hitDim.type) { dimensionEdit.select(hitDim.dim.id, hitDim.type, pt.world); downPointRef.current = { world: pt.world, type: 'dimensionEdit' }; return; } } }
// ✅ فحص الطبقة المناسبة لكل نوع جدار
const isWallSelectable = (w: Wall): boolean => {
  const kind = w.kind;
    if (kind === 'land-boundary') return layers.landBoundaries;
      if (kind === 'helper-line') return layers.helperLines;
        return layers.walls;
        };
        
        // ✅ الجدار المحدد حالياً — فحص نوعه قبل قبول التحديد
        if (edit.selectedWallId) {
          const selectedWall = walls.find(w => w.id === edit.selectedWallId);
            if (selectedWall && isWallSelectable(selectedWall)) {
                const hit = edit.hitTest(pt.world, selectedWall);
                    if (hit !== 'none') {
                          edit.select(selectedWall.id, hit, pt.world);
                                downPointRef.current = { world: pt.world, type: 'edit' };
                                      onModeChange('edit');
                                            return;
                                                }
                                                  }
                                                  }
                                                  
                                                  // ✅ البحث في الجدران القابلة للتحديد فقط
                                                  const selectableWalls = walls.filter(isWallSelectable);
                                                  const hitWall = selectableWalls.map(w => ({ w, t: edit.hitTest(pt.world, w) })).find(h => h.t !== 'none');
                                                  if (hitWall) {
                                                    edit.select(hitWall.w.id, hitWall.t, pt.world);
                                                      downPointRef.current = { world: pt.world, type: 'edit' };
                                                        onModeChange('edit');
                                                          return;
                                                          }
                                                          // ✅ النقر على عناصر السلم الجديدة
if (layers.stairs && stairElements.length > 0 && stairElementEdit && typeof stairElementEdit.hitTest === 'function') {
    for (const el of stairElements) {
        const hitMode = stairElementEdit.hitTest(pt.world, el);
            if (hitMode && typeof stairElementEdit.select === 'function') {
                  stairElementEdit.select(el, pt.world, hitMode);
                        downPointRef.current = { world: pt.world, type: 'stairElementEdit' };
                              return;
                                  }
                                    }
                                    }

    // ✅ فحص المحاور في النهاية (بعد كل العناصر الأخرى)
    // نقبل التحديد في view و edit معاً — حتى لا تُعطَّل بعد النقر على جدار
    if ((mode === 'view' || mode === 'edit') && layers.axes) {
      const hitAxis = axes.find(a => axisEdit.hitTest(pt.world, a));
      if (hitAxis) {
        const dragMode = axisEdit.detectMode(pt.world, hitAxis);
        axisEdit.select(hitAxis.id, pt.world, dragMode);
        downPointRef.current = { world: pt.world, type: 'axisEdit' }; return;
      }
    }

    // ✅ فحص الأركان المقوسة — التحديد بالنقر
    if ((mode === 'view' || mode === 'edit') && roundedCornersProp && roundedCornersProp.length > 0) {
      const normalWalls = walls.filter(w => w.kind === undefined || w.kind === 'wall');
      for (const rc of roundedCornersProp) {
        const a = normalWalls.find(w => w.id === rc.wallAId);
        const b = normalWalls.find(w => w.id === rc.wallBId);
        if (a && b) {
          const rect2 = containerRef.current?.getBoundingClientRect();
            const toScreen2 = (p: Point): Point => {
              const scale = PX_PER_METER * view.zoom;
              if (!rect2) return { x: 0, y: 0 };
              return { x: (p.x + view.offsetX) * scale + rect2.width / 2, y: (p.y + view.offsetY) * scale + rect2.height / 2 };
            };
            if (hitTestRoundedCorner(pt.world, a, b, rc.radius, view.zoom, 1, toScreen2)) {
            if (onSelectRoundedCorner) onSelectRoundedCorner(rc.id);
            downPointRef.current = null;
            return;
          }
        }
      }
      // النقر خارج أي ركن مقوس → إلغاء التحديد
      if (selectedRoundedCornerId && onSelectRoundedCorner) {
        onSelectRoundedCorner(null);
      }
    }

    downPointRef.current = { world: pt.world, type: 'pan' };
    }, [mode, drawingType, walls, dimensions, layers, texts, regions, stairs, northArrows, axes, getPoint, drawing, edit, dimensionMode, dimensionEdit, elementEdit, textEdit, northArrowEdit, clipFrameEdit, axisEdit, onModeChange, view, onAddStairAtPoint, onUpdateStair, onPlaceColumn, onPlaceWindow, onPlaceDoor, onPlaceRegion, onAddText, containerRef, setSelectedRegionId, setSelectedStairId, setup, planImage, onPlanImageChange, onImageSelect,stairElements, stairElementEdit, onUpdateStairElement, onRoundCornerWallClick,
      roundCornerFirstWallId,
      selectedRoundedCornerId, onSelectRoundedCorner, roundedCornersProp
     ]);

  const onPointerMove = useCallback((e: React.PointerEvent) => {
    const rect = containerRef.current?.getBoundingClientRect(); if (!rect) return;
    const cx = e.clientX - rect.left, cy = e.clientY - rect.top;
    if (pointersRef.current.has(e.pointerId)) pointersRef.current.set(e.pointerId, { x: cx, y: cy });
    if (pointersRef.current.size === 2 && pinchRef.current) {
      const pts = Array.from(pointersRef.current.values());
      const nd = Math.hypot(pts[1].x - pts[0].x, pts[1].y - pts[0].y);
      zoomAtPoint(pinchRef.current.cx, pinchRef.current.cy, (nd / pinchRef.current.dist) * (pinchRef.current.zoom / view.zoom));
      return;
    }
    const pt = getPoint(e); if (!pt) return;

    if (downPointRef.current?.type === 'dragImage' && onPlanImageChange && planImage) {
      const dx = pt.world.x - downPointRef.current.world.x;
      const dy = pt.world.y - downPointRef.current.world.y;
      onPlanImageChange({ ...planImage, x: planImage.x + dx, y: planImage.y + dy });
      downPointRef.current.world = pt.world; return;
    }
    if (downPointRef.current?.type === 'clipFrameEdit') { clipFrameEdit.moveDrag(pt.world); return; }
    if (downPointRef.current?.type === 'axisEdit') { axisEdit.moveDrag(pt.world); return; }
      if (downPointRef.current?.type === 'stairElementEdit') {
stairElementEdit.moveDrag(pt.world, stairElements, onUpdateStairElement, walls);
return;
      }
    if (stairDragCandidateRef.current && downPointRef.current?.type === 'stairCandidate') { const candidate = stairDragCandidateRef.current; const distMoved = Math.hypot(pt.world.x - candidate.pt.x, pt.world.y - candidate.pt.y); if (distMoved > 0.05) { stairEdit.start(candidate.pt, candidate.stair, 'move'); stairDragCandidateRef.current = null; downPointRef.current = { world: pt.world, type: 'stairEdit' }; return; } else { return; } }
    if (mode === 'drawing' && drawing.isDrawing) { drawing.move(pt.world); return; }
    if (mode === 'dimension' && dimensionMode.isActive) { dimensionMode.move(pt.world); return; }
    if (downPointRef.current?.type === 'northArrowEdit') { northArrowEdit.moveDrag(pt.world); return; }
    if (downPointRef.current?.type === 'elementEdit') { elementEdit.moveDrag(pt.world); return; }
    if (downPointRef.current?.type === 'dimensionEdit') { dimensionEdit.moveEdit(pt.world); return; }
    if (downPointRef.current?.type === 'textEdit') { textEdit.moveDrag(pt.world); return; }
    if (downPointRef.current?.type === 'stairEdit' && stairEdit.isDragging()) { const selectedStair = stairs.find(s => s.id === setup.selectedStairId); if (selectedStair) stairEdit.move(pt.world, (updated) => onUpdateStair(selectedStair.id, updated)); return; }
    if (mode === 'edit' && edit.isEditing && downPointRef.current?.type === 'edit') { edit.moveEdit(pt.world); return; }
    if (mode !== 'drawing' && mode !== 'dimension' && e.buttons === 1 && pointersRef.current.size === 1 && downPointRef.current?.type !== 'edit' && downPointRef.current?.type !== 'dimensionEdit' && downPointRef.current?.type !== 'elementEdit' && downPointRef.current?.type !== 'textEdit' && downPointRef.current?.type !== 'regionEdit' && downPointRef.current?.type !== 'stairEdit' && downPointRef.current?.type !== 'northArrowEdit' && downPointRef.current?.type !== 'clipFrameEdit' && downPointRef.current?.type !== 'dragImage' && downPointRef.current?.type !== 'axisEdit') { pan(e.movementX / (PX_PER_METER * view.zoom), e.movementY / (PX_PER_METER * view.zoom)); }
  }, [mode, drawing, dimensionMode, dimensionEdit, elementEdit, textEdit, stairEdit, northArrowEdit, clipFrameEdit, axisEdit, edit, pan, view, getPoint, zoomAtPoint, containerRef, stairs, setup.selectedStairId, onUpdateStair, planImage, onPlanImageChange]);

  const onPointerUp = useCallback((e: React.PointerEvent) => {
    (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
    pointersRef.current.delete(e.pointerId);
    if (pointersRef.current.size < 2) pinchRef.current = null;
    downPointRef.current = null;
    stairDragCandidateRef.current = null;
    if (drawing.isDrawing) drawing.finish();
    if (dimensionMode.isActive) dimensionMode.finish();
    if (edit.isEditing) edit.endEdit();
    elementEdit?.endDrag(); textEdit?.endDrag(); stairEdit?.end(); northArrowEdit?.endDrag(); clipFrameEdit?.endDrag(); axisEdit?.endDrag(); stairElementEdit?.endDrag();
  }, [drawing, dimensionMode, edit, elementEdit, textEdit, stairEdit, northArrowEdit, clipFrameEdit, axisEdit]);

  return { onPointerDown, onPointerMove, onPointerUp, zoomAtPoint };
    }
