import { useRef, useState, useEffect, useCallback } from 'react';
import type { Wall, AppMode, DrawingType, Column, Window, Door, TextElement, Stair, NorthArrow, Point, ClipFrame, Axis } from '../core/types';
import type { Dimension } from '../core/dimensionTypes';
import type { RoomRegion, RegionType } from '../core/regionTypes';
import type { LayersState } from '../components/Toolbar/LayersPanel';
import { useCanvasState } from './useCanvasState';
import { useDrawing } from './useDrawing';
import { useWallEditor } from './useWallEditor';
import { useDimensionMode } from './useDimensionMode';
import { useDimensionEdit } from './useDimensionEdit';
import { useElementEdit } from './useElementEdit';
import { useTextEdit } from './useTextEdit';
import { useStairEdit } from './useStairEdit';
import { useNorthArrowEdit } from './useNorthArrowEdit';
import { useClipFrameEdit } from './useClipFrameEdit';
import { useAxisEdit } from './useAxisEdit';

interface Props {
  walls: Wall[];
  onWallsChange: (walls: Wall[]) => void;
  mode: AppMode;
  drawingType: DrawingType;
  onModeChange: (m: AppMode) => void;
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
  axes: Axis[];
  selectedAxisId: string | null;
  onUpdateAxis: (id: string, patch: Partial<Axis>) => void;
  onDeleteAxis: (id: string) => void;
  stairElementEdit: {
    selectedId: string | null;
    setSelectedId: (id: string | null) => void;
    hitTest: (pt: Point, el: any) => 'move' | 'rotate' | null;
    select: (el: any, pt: Point, mode: any) => void;
    deselect: () => void;
    moveDrag: (pt: Point, all: any[], onUpdate: any, walls?: any[]) => void;
    endDrag: () => void;
  };
  activeFloor?: number;
  orthogonalMode?: boolean;
}

export function useCanvasSetup({
  walls, onWallsChange, mode, drawingType, onModeChange,
  dimensions, onAddDimension, onDimensionsChange, dimensionFontSize, layers, frozen,
  columns, windows, doors, texts, regions, stairs, northArrows, updateNorthArrow,
  onAddStairAtPoint, onUpdateStair, onDeleteStair,
  onPlaceColumn, onPlaceWindow, onPlaceDoor, onPlaceRegion, onDeleteRegion,
  updateColumn, updateWindow, updateDoor, onDeleteColumn, onDeleteWindow, onDeleteDoor,
  onAddText, onUpdateText, onDeleteText, onCopyText, clipFrame, setClipFrame,
  axes, onUpdateAxis, stairElementEdit,
  activeFloor = 0,
  orthogonalMode = false,
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ w: 800, h: 450 });
  const { view, setZoom, pan, setView, reset } = useCanvasState();

  const drawing = useDrawing(walls, axes, (w) => {
    const isSpecialWall = w.kind === 'land-boundary' || w.kind === 'helper-line';
    const wallWithFloor: Wall = { ...w, floor: isSpecialWall ? 0 : activeFloor };
    const isRealWall = (wa: Wall) => !wa.kind || wa.kind === 'wall';
    const realWalls = walls.filter(isRealWall);
    if (realWalls.length === 1 && isRealWall(w)) {
      const w1 = realWalls[0];
      const d1x = w1.end.x - w1.start.x;
      const d1y = w1.end.y - w1.start.y;
      const d2x = w.end.x - w.start.x;
      const d2y = w.end.y - w.start.y;
      const cross = d1x * d2y - d1y * d2x;
      const correctSign: 1 | -1 = cross < 0 ? -1 : 1;
      const fixedWalls = walls.map(wa => {
        if (wa.id === w1.id) {
          return (wa.normalSign ?? 1) !== correctSign
            ? { ...wa, normalSign: correctSign }
            : wa;
        }
        return wa;
      });
      onWallsChange([...fixedWalls, wallWithFloor]);
    } else {
      onWallsChange([...walls, wallWithFloor]);
    }
  }, orthogonalMode);

  const edit = useWallEditor(walls, onWallsChange as any, axes, orthogonalMode);
  const dimensionMode = useDimensionMode(walls, axes, onAddDimension, orthogonalMode);
  const dimensionEdit = useDimensionEdit(dimensions, walls, axes, onDimensionsChange, orthogonalMode);
  const elementEdit = useElementEdit(columns, windows, doors, walls, updateColumn, updateWindow, updateDoor, axes);
  const textEdit = useTextEdit(texts, onUpdateText, onDeleteText, onAddText);
  const stairEdit = useStairEdit();
  const northArrowEdit = useNorthArrowEdit(northArrows, updateNorthArrow);
  const clipFrameEdit = useClipFrameEdit(clipFrame ? [clipFrame] : [], (id, patch) => { if (clipFrame && clipFrame.id === id) setClipFrame({ ...clipFrame, ...patch }); });
  const axisEdit = useAxisEdit(axes, onUpdateAxis);
  const [selectedRegionId, setSelectedRegionId] = useState<string | null>(null);
  const [selectedStairId, setSelectedStairId] = useState<string | null>(null);

  useEffect(() => {
    const update = () => { if (containerRef.current) setSize({ w: containerRef.current.clientWidth, h: 450 }); };
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  const deselectAll = useCallback(() => {
    edit.deselect(); dimensionEdit.deselect(); elementEdit.deselect(); textEdit.deselect();
    northArrowEdit.deselect(); clipFrameEdit.deselect(); axisEdit.deselect();
    stairElementEdit.deselect();
    setSelectedRegionId(null); setSelectedStairId(null); stairEdit.end();
  }, [edit, dimensionEdit, elementEdit, textEdit, northArrowEdit, clipFrameEdit, axisEdit, stairEdit, stairElementEdit]);

  const selectedType: 'wall' | 'column' | 'window' | 'door' | 'dimension' | 'text' | 'region' | 'stair' | 'stairElement' | 'northArrow' | 'clipFrame' | 'axis' | null =
    stairElementEdit.selectedId ? 'stairElement' :
    edit.selectedWallId ? 'wall' :
    elementEdit.selected ? elementEdit.selected.type :
    dimensionEdit.selectedDimId ? 'dimension' :
    textEdit.selectedTextId ? 'text' :
    selectedRegionId ? 'region' :
    selectedStairId ? 'stair' :
    northArrowEdit.selectedNorthArrowId ? 'northArrow' :
    clipFrameEdit.selectedClipFrameId ? 'clipFrame' :
    axisEdit.selectedAxisId ? 'axis' : null;

  const showRightSidebar = selectedType === 'wall';
  const showLeftSidebar = selectedType !== null;

  return {
    containerRef, size, view, setZoom, pan, setView, reset,
    drawing, edit, dimensionMode, dimensionEdit, elementEdit, textEdit, stairEdit, northArrowEdit, clipFrameEdit,
    axisEdit, axes, clipFrame,
    selectedRegionId, setSelectedRegionId, selectedStairId, setSelectedStairId,
    deselectAll, selectedType, showRightSidebar, showLeftSidebar,
  };
}
