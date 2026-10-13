import React, { useState, useEffect } from 'react';
import { CanvasLayers } from './CanvasLayers';
import { CanvasSidebars } from './CanvasSidebars';
import { CanvasZoomControls } from './CanvasZoomControls';
import { WallProperties } from '../Properties/WallProperties';
import { ElementProperties } from '../Properties/ElementProperties';
import { StairProperties } from '../Properties/StairProperties';
import { AxisProperties } from '../Properties/AxisProperties';
import { useCanvasSetup } from '../../hooks/useCanvasSetup';
import { useCanvasEvents } from '../../hooks/useCanvasEvents';
import { rebuildStairPolygon } from '../../core/stairGeometry';
import { StairElementProperties } from '../Properties/StairElementProperties';
import { RoundedCornerProperties } from '../Properties/RoundedCornerProperties';
import { CurvedWallDialog } from './CurvedWallDialog';
import type { Wall, AppMode, DrawingType, Column, Window, Door, TextElement, Stair, Point, NorthArrow, ClipFrame, PlanImage, Axis, StairElement, RoundedCorner } from '../../core/types';
import type { Dimension } from '../../core/dimensionTypes';
import type { RoomRegion, RegionType } from '../../core/regionTypes';
import type { LayersState } from '../Toolbar/LayersPanel';
import { DrawingLoupe } from './DrawingLoupe';
import { closestPointOnSegment } from '../../core/geometry';

interface Props {
  walls: Wall[];
  onWallsChange: (walls: Wall[]) => void;
  mode: AppMode;
  drawingType: DrawingType;
  onModeChange: (m: AppMode) => void;
  onCancelTool: () => void;
  dimensions: Dimension[];
  onAddDimension: (d: Dimension) => void;
  onDimensionsChange: (dims: Dimension[]) => void;
  dimensionFontSize: number;
  layers: LayersState;
  columns: Column[];
  windows: Window[];
  doors: Door[];
  texts: TextElement[];
  regions: RoomRegion[];
  stairs: Stair[];
  northArrows: NorthArrow[];
  updateNorthArrow: (id: string, patch: Partial<NorthArrow>) => void;
  frozen: boolean;
  onAddStairAtPoint: (pt: Point) => void;
  onUpdateStair: (id: string, patch: Partial<Stair>) => void;
  onDeleteStair: (id: string) => void;
  onPlaceColumn: (pt: Point) => void;
  onPlaceWindow: (pt: Point) => void;
  onPlaceDoor: (pt: Point) => void;
  onPlaceRegion: (pt: Point, type: RegionType) => void;
  onDeleteRegion: (id: string) => void;
  updateColumn: (id: string, patch: Partial<Column>) => void;
  updateWindow: (id: string, patch: Partial<Window>) => void;
  updateDoor: (id: string, patch: Partial<Door>) => void;
  onDeleteColumn: (id: string) => void;
  onDeleteWindow: (id: string) => void;
  onDeleteDoor: (id: string) => void;
  onAddText: (position: Point, text: string) => void;
  onUpdateText: (id: string, patch: Partial<TextElement>) => void;
  onDeleteText: (id: string) => void;
  onCopyText: (text: TextElement) => void;
  clipFrame: ClipFrame | null;
  setClipFrame: (frame: ClipFrame | null) => void;
  planImage: PlanImage | null;
  setPlanImage: (img: PlanImage | null) => void;
  axes: Axis[];
  selectedAxisId: string | null;
  onUpdateAxis: (id: string, patch: Partial<Axis>) => void;
  onDeleteAxis: (id: string) => void;
  showGrid: boolean;
  axisBubbleSize: number;
  onCopyAxis: (id: string) => void; 
  stairElements: StairElement[];
selectedStairElementId: string | null;
onUpdateStairElement: (id: string, patch: Partial<StairElement>) => void;
onRotateStairElement: (id: string) => void;
onDeleteStairElement: (id: string) => void;
onCopyStairElement: (id: string) => void;
stairElementEdit: any;
// ✅ الأدوار
activeFloor: number;
maxFloor: number;
showPreviousFloor: boolean;
onSetActiveFloor: (floor: number) => void;
onAddFloor: () => void;
onCopyFloor: () => void;
onDeleteFloor: (floor: number) => void;
onTogglePreviousFloor: () => void;
// ✅ ارتفاع الدور
floorHeights: number[];
onSetFloorHeight: (floor: number, height: number) => void;
orthogonalMode?: boolean;
onToggleOrthogonal?: () => void;
// ✅ الأركان المقوسة
roundCornerFirstWallId?: string | null;
roundedCorners?: RoundedCorner[];
pendingRoundedCorner?: {
  wallAId: string;
    wallBId: string;
      radius: number;
      } | null;
      onRoundCornerWallClick?: (wallId: string) => void;
        selectedRoundedCornerId?: string | null;
          onSelectRoundedCorner?: (id: string | null) => void;
          onUpdateRoundedCorner?: (id: string, radius: number) => void;
          onCommitRoundedCorner?: () => void;
          onDeleteRoundedCorner?: (id: string) => void;
      }

export const CanvasContainer: React.FC<Props> = (props) => {
    // ✅ فلترة العناصر حسب الدور النشط
      const activeFloor = props.activeFloor ?? 0;

        const filteredColumns = React.useMemo(
            () => props.columns.filter(c => (c.floor ?? 0) === activeFloor),
                [props.columns, activeFloor]
                  );
                    const filteredWindows = React.useMemo(
                        () => props.windows.filter(w => (w.floor ?? 0) === activeFloor),
                            [props.windows, activeFloor]
                              );
                                const filteredDoors = React.useMemo(
                                    () => props.doors.filter(d => (d.floor ?? 0) === activeFloor),
                                        [props.doors, activeFloor]
                                          );
                                            const filteredTexts = React.useMemo(
                                                () => props.texts.filter(t => (t.floor ?? 0) === activeFloor),
                                                    [props.texts, activeFloor]
                                                      );
                                                        const filteredDimensions = React.useMemo(
                                                            () => props.dimensions.filter(d => (d.floor ?? 0) === activeFloor),
                                                                [props.dimensions, activeFloor]
                                                                  );
                                                                    const filteredStairs = React.useMemo(
                                                                        () => props.stairs.filter(s => (s.floor ?? 0) === activeFloor),
                                                                            [props.stairs, activeFloor]
                                                                              );
                                                                                const filteredStairElements = React.useMemo(
                                                                                    () => props.stairElements.filter(el => (el.floor ?? 0) === activeFloor),
                                                                                        [props.stairElements, activeFloor]
                                                                                          );
                                                                                            const filteredAxes = React.useMemo(
                                                                                                () => props.axes.filter(a => (a.floor ?? 0) === activeFloor),
                                                                                                    [props.axes, activeFloor]
                                                                                                      );
                                                      // ✅ فلترة الجدران حسب الدور النشط (كل الأنواع)
                                                      const filteredWalls = React.useMemo(
                                                        () => props.walls.filter(w => (w.floor ?? 0) === activeFloor),
                                                          [props.walls, activeFloor]
                                                          );

                                                                                                        const setup = useCanvasSetup({
                                                                                                            ...props,
                                                                                                            walls: filteredWalls,
                                                                                                                columns: filteredColumns,
                                                                                                                    windows: filteredWindows,
                                                                                                                        doors: filteredDoors,
                                                                                                                            texts: filteredTexts,
                                                                                                                                dimensions: filteredDimensions,
                                                                                                                                    stairs: filteredStairs,
                                                                                                                                        axes: filteredAxes,
                                                                                                                                        orthogonalMode: props.orthogonalMode,
                                                                                                                                            activeFloor,
                                                                                                                                              });
  // ✅ رفع الدقة الداخلية مؤقتاً عند تصدير PDF
const [renderScale, setRenderScale] = useState(1);
  // ✅ حالات حقل القياس الديناميكي
const [isEditingLength, setIsEditingLength] = useState(false);
const [editLengthValue, setEditLengthValue] = useState('');

useEffect(() => {
  const handler = (e: Event) => {
    const detail = (e as CustomEvent<boolean>).detail;
    // عند بدء التصدير (detail=false) → scale = 3، عند الانتهاء → 1
    setRenderScale(detail === false ? 3 : 1);
  };
  window.addEventListener('pdf-export-grid', handler);
  return () => window.removeEventListener('pdf-export-grid', handler);
}, []);

  // ✅ دالة تحديد الصورة عند النقر عليها
  const onImageSelect = React.useCallback((_id: string | null) => {
    if (props.planImage && !props.planImage.isSelected) {
      props.setPlanImage({ ...props.planImage, isSelected: true });
    }
  }, [props]);

  const events = useCanvasEvents({
      ...props,
        walls: filteredWalls,
          columns: filteredColumns,
            windows: filteredWindows,
              doors: filteredDoors,
                texts: filteredTexts,
                  dimensions: filteredDimensions,
                    stairs: filteredStairs,
                      axes: filteredAxes,
                        stairElements: filteredStairElements,
                          setup,
                            planImage: props.planImage,
                              onPlanImageChange: props.setPlanImage,
                                onImageSelect,
                                  onRoundCornerWallClick: props.onRoundCornerWallClick,
                                  roundCornerFirstWallId: props.roundCornerFirstWallId,
                                    selectedRoundedCornerId: props.selectedRoundedCornerId,
                                      onSelectRoundedCorner: props.onSelectRoundedCorner,
                                        roundedCorners: props.roundedCorners,
                                  } as any);
  
  

  const { containerRef, size, view, drawing, edit, elementEdit, textEdit, selectedRegionId, setSelectedRegionId, selectedStairId, setSelectedStairId, showRightSidebar, showLeftSidebar, selectedType, deselectAll, reset } = setup;
  // ✅ كشف قرب نهاية الجدار قيد الرسم/التعديل من جدار آخر → عرض العدسة
  const loupeTarget = React.useMemo(() => {
    const THRESHOLD = 1.0; // متر — المسافة التي تُظهر العدسة عند الاقتراب من جدار آخر

    // --- حالة الرسم ---
    if (drawing.isDrawing && drawing.tempEnd) {
      const t = drawing.tempEnd;
      let best: { pt: Point; dist: number } | null = null;
      for (const w of filteredWalls) {
        if (w.kind && w.kind !== 'wall') continue;
        for (const ep of [w.start, w.end]) {
          const d = Math.hypot(t.x - ep.x, t.y - ep.y);
          if (d < THRESHOLD && (!best || d < best.dist)) {
            best = { pt: ep, dist: d };
          }
        }
        // أيضاً: المسافة من خط الجدار نفسه (وليس فقط الأطراف)
        const cp = closestPointOnSegment(t, w.start, w.end);
        const dLine = Math.hypot(t.x - cp.x, t.y - cp.y);
        if (dLine < THRESHOLD && (!best || dLine < best.dist)) {
          best = { pt: cp, dist: dLine };
        }
      }
      return best;
    }

    // --- حالة تعديل جدار (سحب طرف أو تحريك) ---
    if (edit.isEditing && edit.editType !== 'none' && edit.selectedWall) {
      const sel = edit.selectedWall;
      // النقطة المتحركة هي الطرف الذي يتم سحبه
      const movingPt = edit.editType === 'extendStart' ? sel.start : edit.editType === 'extendEnd' ? sel.end : null;
      if (!movingPt) return null;

      let best: { pt: Point; dist: number } | null = null;
      for (const w of filteredWalls) {
        if (w.kind && w.kind !== 'wall') continue;
        if (w.id === sel.id) continue; // تخطّي الجدار نفسه
        for (const ep of [w.start, w.end]) {
          const d = Math.hypot(movingPt.x - ep.x, movingPt.y - ep.y);
          if (d < THRESHOLD && (!best || d < best.dist)) {
            best = { pt: ep, dist: d };
          }
        }
        const cp = closestPointOnSegment(movingPt, w.start, w.end);
        const dLine = Math.hypot(movingPt.x - cp.x, movingPt.y - cp.y);
        if (dLine < THRESHOLD && (!best || dLine < best.dist)) {
          best = { pt: cp, dist: dLine };
        }
      }
      return best;
    }

    return null;
  }, [drawing.isDrawing, drawing.tempEnd, filteredWalls, edit.isEditing, edit.editType, edit.selectedWall]);
  const loupeWorldPt = drawing.isDrawing
    ? drawing.tempEnd
    : (edit.isEditing && edit.selectedWall
        ? (edit.editType === 'extendStart' ? edit.selectedWall.start : edit.selectedWall.end)
        : null);

  const loupeTempWall: { start: Point; end: Point; thickness?: number } | null =
    drawing.isDrawing && drawing.tempStart && drawing.tempEnd
      ? { start: drawing.tempStart, end: drawing.tempEnd }
      : (edit.isEditing && edit.selectedWall
          ? { start: edit.selectedWall.start, end: edit.selectedWall.end, thickness: edit.selectedWall.thickness }
          : null);

  const toolActive = ['drawing', 'column', 'window', 'door', 'kitchen', 'bathroom', 'text', 'stair', 'dimension'].includes(props.mode);

  const curvedWallChord = (drawing.tempStart && drawing.tempEnd)
    ? Math.hypot(drawing.tempEnd.x - drawing.tempStart.x, drawing.tempEnd.y - drawing.tempStart.y)
    : 0;
  const curvedWallMinRadius = curvedWallChord / 2 + 0.01;

  return (
    <div>
      {drawing.awaitingCurveRadius && (
        <CurvedWallDialog
          initialRadius={drawing.curveRadius}
          minRadius={curvedWallMinRadius}
          onRadiusChange={drawing.updateCurveRadius}
          onConfirm={drawing.confirmCurvedWallRadius}
          onCancel={drawing.cancelCurveRadius}
        />
      )}
      {toolActive && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '4px 8px' }}>
          <button onClick={() => { drawing.cancel(); props.onModeChange('view'); props.onCancelTool(); }} style={{ padding: '8px 14px', borderRadius: 8, border: '2px solid #f44', background: '#f44', color: '#fff', fontWeight: 700, cursor: 'pointer', fontSize: 14, boxShadow: '0 2px 6px rgba(0,0,0,0.2)' }}>✖ إلغاء الأداة</button>
          {drawing.lastWallId && props.mode === 'drawing' && (() => {
  // ✅ حساب الطول الحي (المسافة بين tempStart و tempEnd)
  const liveLength = (drawing.tempStart && drawing.tempEnd)
    ? Math.hypot(drawing.tempEnd.x - drawing.tempStart.x, drawing.tempEnd.y - drawing.tempStart.y)
    : 0;
  const dynamicDisplay = isEditingLength
    ? editLengthValue
    : (liveLength > 0.01 ? liveLength.toFixed(2) : '');

  return (
    <input
      type="text"
      inputMode="decimal"
      dir="ltr"
      placeholder="القياس الديناميكي"
      value={dynamicDisplay}
      onChange={(e) => {
        setIsEditingLength(true);
        setEditLengthValue(e.target.value);
      }}
      onFocus={(e) => {
          const target = e.currentTarget;
            setEditLengthValue(target.value);
              setIsEditingLength(true);
                setTimeout(() => target.select(), 0);
                }}
      
      onBlur={() => {
        setIsEditingLength(false);
        setEditLengthValue('');
      }}
      onKeyDown={(e) => {
        if (e.key === 'Enter') {
          const raw = e.currentTarget.value.replace(',', '.');
          const val = parseFloat(raw);
          if (!isNaN(val) && val > 0.01) {
            const wall = props.walls.find(w => w.id === drawing.lastWallId);
            if (wall) {
              const len = Math.hypot(wall.end.x - wall.start.x, wall.end.y - wall.start.y);
              if (len > 0) {
                const dirX = (wall.end.x - wall.start.x) / len;
                const dirY = (wall.end.y - wall.start.y) / len;
                const newEnd = { x: wall.start.x + dirX * val, y: wall.start.y + dirY * val };
                props.onWallsChange(props.walls.map(w => w.id === wall.id ? { ...w, end: newEnd } : w));
                drawing.updateLastWallEnd(newEnd);
              }
            }
          }
          setIsEditingLength(false);
          setEditLengthValue('');
          e.currentTarget.blur();
        }
      }}
      style={{
        width: '130px',
        padding: '8px',
        borderRadius: 8,
        border: '2px solid #06f',
        fontSize: 14,
        textAlign: 'center',
        direction: 'ltr',
      }}
    />
  );
})()}
        </div>
      )}
      {loupeTarget && loupeWorldPt && loupeTempWall && (
        <div style={{ position: 'absolute', top: 4, left: 8, zIndex: 200, pointerEvents: 'none' }}>
          <DrawingLoupe
            worldPt={loupeWorldPt}
            walls={filteredWalls}
            tempWall={loupeTempWall}
            excludeWallId={edit.selectedWallId}
          />
        </div>
      )}
{!props.frozen && edit.selectedWallId && edit.selectedWall && (<WallProperties wall={edit.selectedWall}
 onChangeLength={edit.changeLength} onChangeRadius={edit.changeRadius} onChangeThickness={edit.changeThickness} />)}  {elementEdit.selected && (<ElementProperties selected={elementEdit.selected} columns={props.columns} windows={props.windows} doors={props.doors} walls={props.walls} updateColumn={props.updateColumn} updateWindow={props.updateWindow} updateDoor={props.updateDoor} />)}
      {selectedStairId && (
        <StairProperties stair={props.stairs.find(s => s.id === selectedStairId) ?? null} onChangeWidth={(w) => { const s = props.stairs.find(s => s.id === selectedStairId); if (s) props.onUpdateStair(selectedStairId, rebuildStairPolygon({ ...s, width: w })); }} onChangeTotalLength={(l) => { const s = props.stairs.find(s => s.id === selectedStairId); if (s) props.onUpdateStair(selectedStairId, rebuildStairPolygon({ ...s, totalLength: l })); }} onChangeLandingLength={(l) => props.onUpdateStair(selectedStairId, { landingLength: l })} onChangeTreadDepth={(d) => props.onUpdateStair(selectedStairId, { treadDepth: d })} onChangeRiserHeight={(h) => props.onUpdateStair(selectedStairId, { riserHeight: h })} onRotate={() => { const s = props.stairs.find(s => s.id === selectedStairId); if (s) { props.onUpdateStair(selectedStairId, rebuildStairPolygon({ ...s, rotation: (s.rotation || 0) + Math.PI / 2 })); } }} />
      )}
      {setup.axisEdit.selectedAxisId && (
        <AxisProperties
          axis={props.axes.find(a => a.id === setup.axisEdit.selectedAxisId) ?? null}
          onChangeLength={(len) => props.onUpdateAxis(setup.axisEdit.selectedAxisId!, { length: len })}
          onChangeOffset={(off) => props.onUpdateAxis(setup.axisEdit.selectedAxisId!, { offset: off })}
        />
      )}
      {props.selectedStairElementId && (
  <StairElementProperties
    element={props.stairElements.find(el => el.id === props.selectedStairElementId) ?? null}
    onUpdate={props.onUpdateStairElement}
    onRotate={props.onRotateStairElement}
    onDelete={props.onDeleteStairElement}
  />
)}
      {props.selectedRoundedCornerId && props.roundedCorners && (() => {
        const rc = props.roundedCorners.find(c => c.id === props.selectedRoundedCornerId);
        if (!rc) return null;
        return (
          <RoundedCornerProperties
            corner={rc}
            walls={props.walls}
            onUpdate={props.onUpdateRoundedCorner!}
            onCommit={props.onCommitRoundedCorner!}
            onDelete={props.onDeleteRoundedCorner!}
            onDeselect={() => props.onSelectRoundedCorner!(null)}
          />
        );
      })()}
      <div style={{ position: 'relative' }}>

        {/* ✅ أزرار التحكم بالصورة المستوردة (تظهر عند التحديد) */}
        {props.planImage?.isSelected && (
          <div
            style={{
              position: 'absolute',
              top: 8,
              left: 8,
              display: 'flex',
              gap: 6,
              zIndex: 200,
            }}
            onPointerDown={e => e.stopPropagation()}
            onPointerUp={e => e.stopPropagation()}
          >
            <button
              onClick={() => {
                const currentRotation = props.planImage!.rotation || 0;
                const newRotation = (currentRotation + Math.PI / 2) % (Math.PI * 2);
                props.setPlanImage({ ...props.planImage!, rotation: newRotation });
              }}
              style={{ padding: '8px 12px', borderRadius: 6, border: '1px solid #f80', background: '#fff', color: '#f80', cursor: 'pointer', fontWeight: 700, fontSize: 14 }}
            >🔄 تدوير 90°</button>
            <button
              onClick={() => {
                if (confirm('حذف الصورة المستوردة؟')) {
                  props.setPlanImage(null);
                }
              }}
              style={{ padding: '8px 12px', borderRadius: 6, border: '1px solid #e44', background: '#e44', color: '#fff', cursor: 'pointer', fontWeight: 700, fontSize: 14 }}
            >🗑️ حذف الصورة</button>
            <button
              onClick={() => {
                props.setPlanImage({ ...props.planImage!, isSelected: false });
              }}
              style={{ padding: '8px 12px', borderRadius: 6, border: '1px solid #555', background: '#555', color: '#fff', cursor: 'pointer', fontWeight: 700, fontSize: 14 }}
            >✖</button>
          </div>
        )}

        <CanvasSidebars
          showRightSidebar={showRightSidebar}
          showLeftSidebar={showLeftSidebar}
          lockOptions={{ direction: edit.lockOptions.direction, length: edit.lockOptions.length, move: edit.lockOptions.move }}
          onToggleLockDirection={edit.toggleLockDirection}
          onToggleLockLength={edit.toggleLockLength}
          onToggleLockMove={edit.toggleLockMove}
          onDeleteWall={edit.deleteSelected}
          onCopyWall={edit.copySelected}
          onDeleteColumn={() => props.onDeleteColumn(elementEdit.selected?.id ?? '')}
          onDeleteWindow={() => props.onDeleteWindow(elementEdit.selected?.id ?? '')}
          onDeleteDoor={() => props.onDeleteDoor(elementEdit.selected?.id ?? '')}
          onDeleteDimension={setup.dimensionEdit.deleteSelected}
          onCopyText={() => { const t = props.texts.find(x => x.id === textEdit.selectedTextId); if (t) props.onCopyText(t); }}
          onDeleteText={() => { if (textEdit.selectedTextId) props.onDeleteText(textEdit.selectedTextId); textEdit.deselect(); }}
          onDeleteRegion={() => { if (selectedRegionId) props.onDeleteRegion(selectedRegionId); setSelectedRegionId(null); }}
          onDeleteStair={() => { if (selectedStairId) props.onDeleteStair(selectedStairId); setSelectedStairId(null); }}
          onDeleteStairElement={() => { if (props.selectedStairElementId) props.onDeleteStairElement(props.selectedStairElementId); props.stairElementEdit.deselect(); }}
onCopyStairElement={() => { if (props.selectedStairElementId) props.onCopyStairElement(props.selectedStairElementId); }}
          onDeleteAxis={() => { if (setup.axisEdit.selectedAxisId) props.onDeleteAxis(setup.axisEdit.selectedAxisId); setup.axisEdit.deselect(); }}
          onDeselectAll={deselectAll}
          selectedType={selectedType === 'northArrow' || selectedType === 'clipFrame' ? null : selectedType}
          onCopyAxis={() => { if (setup.axisEdit.selectedAxisId) props.onCopyAxis(setup.axisEdit.selectedAxisId); }}
        />
        <div ref={containerRef} data-floor-plan-stage="true" data-zoom={view.zoom} data-offset-x={view.offsetX} data-offset-y={view.offsetY} style={{ width: '100%', height: 450, touchAction: 'none', overflow: 'hidden', position: 'relative', cursor: toolActive ? 'crosshair' : props.mode === 'edit' ? 'move' : 'grab' }} onPointerDown={events.onPointerDown} onPointerMove={events.onPointerMove} onPointerUp={events.onPointerUp} onPointerCancel={events.onPointerUp}>
          <CanvasLayers
            walls={props.walls}
            view={view}
            width={size.w}
            height={size.h}
            selectedWallId={edit.selectedWallId}
            tempStart={drawing.tempStart}
            tempEnd={drawing.tempEnd}
            columns={props.columns}
            windows={props.windows}
            doors={props.doors}
            texts={props.texts}
            regions={props.regions}
            stairs={props.stairs}
            northArrows={props.northArrows}
            selectedNorthArrowId={setup.northArrowEdit.selectedNorthArrowId}
            selectedClipFrameId={setup.clipFrameEdit.selectedClipFrameId}
            selectedStairId={selectedStairId}
            selectedElement={elementEdit.selected}
            selectedTextId={textEdit.selectedTextId}
            dimensions={props.dimensions}
            dimensionFontSize={props.dimensionFontSize}
            selectedDimId={setup.dimensionEdit.selectedDimId}
            clipFrames={props.clipFrame ? [props.clipFrame] : []}
            planImage={props.planImage}
            axes={props.axes}
            selectedAxisId={setup.axisEdit.selectedAxisId}
            showGrid={props.showGrid}
            scale={renderScale}  
            axisBubbleSize={props.axisBubbleSize}
            stairElements={props.stairElements}
            selectedStairElementId={props.selectedStairElementId}
                        activeFloor={props.activeFloor}
                                    showPreviousFloor={props.showPreviousFloor}
                                    mode={props.mode}
                                                                        roundCornerFirstWallId={props.roundCornerFirstWallId}
                                                                          roundedCorners={props.roundedCorners}
                                                                            pendingRoundedCorner={props.pendingRoundedCorner}
                                                                              selectedRoundedCornerId={props.selectedRoundedCornerId}
                                                                            />
<CanvasZoomControls
  onZoomIn={() => events.zoomAtPoint(size.w / 2, size.h / 2, 1.2)}
    onZoomOut={() => events.zoomAtPoint(size.w / 2, size.h / 2, 1 / 1.2)}
      onReset={reset}
        showZoom={!toolActive}
          activeFloor={props.activeFloor}
            maxFloor={props.maxFloor}
              showPreviousFloor={props.showPreviousFloor}
                onSetActiveFloor={props.onSetActiveFloor}
                  onAddFloor={props.onAddFloor}
                    onCopyFloor={props.onCopyFloor}
                      onDeleteFloor={props.onDeleteFloor}
                      onTogglePreviousFloor={props.onTogglePreviousFloor}
                      floorHeights={props.floorHeights}
                      onSetFloorHeight={props.onSetFloorHeight}
                      orthogonalMode={props.orthogonalMode}
                      onToggleOrthogonal={props.onToggleOrthogonal}
                      />
                      
       </div>
      </div>
    </div>
  );
};
