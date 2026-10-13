import { useState, useCallback, useRef, useEffect } from 'react';
import type { Wall, AppMode, DrawingType, Point, Column, Window, Door, TextElement, Stair, NorthArrow, ClipFrame, PlanImage, Axis, StairElement, DoorType, ColumnShape, RoundedCorner } from '../core/types';
import type { Dimension } from '../core/dimensionTypes';
import type { RoomRegion, RegionType } from '../core/regionTypes';
import type { LayersState } from '../components/Toolbar/LayersPanel';
import { useElementManager } from './useElementManager';
import { useRegionManager } from './useRegionManager';
import { useTextManager } from './useTextManager';
import { useStairManager } from './useStairManager';
import { useCalculations } from './useCalculations';
import { distance, closestPointOnSegment, segmentIntersection, wallRectangle } from '../core/geometry';
import { DEFAULT_COLUMN, DEFAULT_WINDOW, DEFAULT_DOOR } from '../core/types';
import { FENCE_THICKNESS } from '../core/types';
import { v4 as uuidv4 } from 'uuid';
import { useProjectManager } from './useProjectManager';
import { useStairElementManager } from './useStairElementManager';
import { useStairElementEdit } from './useStairElementEdit';
import { DEFAULT_VIEW3D_SETTINGS, type View3DSettings } from '../components/View3D/view3dTypes';
interface Snapshot {
    walls: Wall[];
      columns: Column[];
        windows: Window[];
          doors: Door[];
            dimensions: Dimension[];
              regions: RoomRegion[];
                texts: TextElement[];
                  stairs: Stair[];
                    northArrows: NorthArrow[];
                      axes: Axis[];
                        stairElements: StairElement[];    // ✅ جديد
                          planImage: PlanImage | null;      // ✅ جديد
                            clipFrame: ClipFrame | null;      // ✅ جديد
                            }function generateDimensionsForWalls(walls: Wall[]): Dimension[] { const dims: Dimension[] = []; walls.forEach((wall) => { const rect = wallRectangle(wall); const face = rect.faces[0]; const breakPoints: Point[] = []; walls.forEach((other) => { if (other.id === wall.id) return; const otherRect = wallRectangle(other); otherRect.faces.forEach((otherFace) => { const intersection = segmentIntersection(face.start, face.end, otherFace.start, otherFace.end); if (intersection) { breakPoints.push(intersection); } }); const cpStart = closestPointOnSegment(other.start, face.start, face.end); if (distance(cpStart, other.start) < 0.05) breakPoints.push({ ...other.start }); const cpEnd = closestPointOnSegment(other.end, face.start, face.end); if (distance(cpEnd, other.end) < 0.05) breakPoints.push({ ...other.end }); }); const unique: Point[] = []; breakPoints.forEach((p) => { if (!unique.some((u) => distance(u, p) < 0.01)) unique.push(p); }); const dir = { x: face.end.x - face.start.x, y: face.end.y - face.start.y }; unique.sort((a, b) => { const denominator = dir.x * dir.x + dir.y * dir.y || 1; const ta = ((a.x - face.start.x) * dir.x + (a.y - face.start.y) * dir.y) / denominator; const tb = ((b.x - face.start.x) * dir.x + (b.y - face.start.y) * dir.y) / denominator; return ta - tb; }); const points = [face.start, ...unique, face.end]; for (let i = 0; i < points.length - 1; i++) { const segmentLength = distance(points[i], points[i + 1]); if (segmentLength > 0.4) { const offsetValue = -(wall.thickness * 3); dims.push({ id: uuidv4(), start: { ...points[i] }, end: { ...points[i + 1] }, offset: offsetValue }); } } }); return dims; }
function generateDimensionsForAxes(axes: Axis[]): Dimension[] {
  const dims: Dimension[] = [];
  const vAxes = axes.filter(a => a.type === 'vertical').sort((a, b) => (a.position + a.offset) - (b.position + b.offset));
  const hAxes = axes.filter(a => a.type === 'horizontal').sort((a, b) => (a.position - a.offset) - (b.position - b.offset));
  for (let i = 0; i < vAxes.length - 1; i++) {
    const x1 = vAxes[i].position + vAxes[i].offset;
    const x2 = vAxes[i + 1].position + vAxes[i + 1].offset;
    const yTop = vAxes[i].center - vAxes[i].length / 2 - 0.5;
    dims.push({ id: uuidv4(), start: { x: x1, y: yTop }, end: { x: x2, y: yTop }, offset: 0 });
  }
  for (let i = 0; i < hAxes.length - 1; i++) {
    const y1 = hAxes[i].position - hAxes[i].offset;
    const y2 = hAxes[i + 1].position - hAxes[i + 1].offset;
    const xLeft = hAxes[i].center + hAxes[i].length / 2 + 0.5;
    dims.push({ id: uuidv4(), start: { x: xLeft, y: y1 }, end: { x: xLeft, y: y2 }, offset: 0 });
  }
  return dims;
}
function findNearestWall(walls: Wall[], pt: Point): { wall: Wall; point: Point; distance: number } | null { let nearest: { wall: Wall; point: Point; distance: number } | null = null; for (const wall of walls) { const point = closestPointOnSegment(pt, wall.start, wall.end); const d = distance(pt, point); if (!nearest || d < nearest.distance) nearest = { wall, point, distance: d }; } return nearest; }

// ✅ دالة مركزية لإعادة ترتيب وتسمية المحاور حسب الموضع الفعلي
function reorderAxes(axesList: Axis[]): Axis[] {
  const vAxes = axesList
    .filter(a => a.type === 'vertical')
    .sort((a, b) => (a.position + a.offset) - (b.position + b.offset));
  const hAxes = axesList
    .filter(a => a.type === 'horizontal')
    .sort((a, b) => (a.position - a.offset) - (b.position - b.offset));
  return [
    ...vAxes.map((a, i) => ({ ...a, label: String.fromCharCode(65 + i) })),
    ...hAxes.map((a, i) => ({ ...a, label: String(i + 1) })),
  ];
}

export function useAppState() {
const [walls, setWalls] = useState<Wall[]>([]);
const [mode, setMode] = useState<AppMode>('view');
const [drawingType, setDrawingType] = useState<DrawingType>(null);
// ✅ نوع الباب النشط
const [currentDoorType, setCurrentDoorType] = useState<DoorType>('regular');
// ✅ شكل العمود النشط
const [currentColumnShape, setCurrentColumnShape] = useState<ColumnShape>('rect');
// ✅ وضع الزاوية القائمة (0/90) — مفعّل افتراضياً
const [orthogonalMode, setOrthogonalMode] = useState(true);
// ✅ وضع الأركان المقوسة
const [roundCornerFirstWallId, setRoundCornerFirstWallId] = useState<string | null>(null);
const [roundedCorners, setRoundedCorners] = useState<RoundedCorner[]>([]);
const [selectedRoundedCornerId, setSelectedRoundedCornerId] = useState<string | null>(null);
// ✅ حالة المعاينة للأركان المقوسة
const [pendingRoundedCorner, setPendingRoundedCorner] = useState<{
  wallAId: string;
    wallBId: string;
      radius: number;
      } | null>(null);
const [dimensions, setDimensions] = useState<Dimension[]>([]);
const [dimensionFontSize, setDimensionFontSize] = useState(40);
  const [globalTextSize, setGlobalTextSize] = useState(0.5);
const [globalFontFamily, setGlobalFontFamily] = useState('"Traditional Arabic", "Noto Naskh Arabic", serif');
const [axisBubbleSize, setAxisBubbleSize] = useState(11);
const [axes, setAxes] = useState<Axis[]>([]);
const [layers, setLayers] = useState<LayersState>({ walls: true, landBoundaries: true, helperLines: true, dimensions: true, columns: true, windows: true, doors: true, texts: true, regions: true, stairs: true, northArrow: true, axes: true });
const [planImage, setPlanImage] = useState<PlanImage | null>(null);
const [clipFrame, setClipFrame] = useState<ClipFrame | null>(null);
// ✅ حالات الأدوار
const [activeFloor, setActiveFloor] = useState(0);
const [maxFloor, setMaxFloor] = useState(0);
const [showPreviousFloor, setShowPreviousFloor] = useState(true);
// ✅ ارتفاعات الأدوار (index = رقم الدور)
const [floorHeights, setFloorHeights] = useState<number[]>([3.0]);
// ✅ إعدادات المنظور ثلاثي الأبعاد (عامة + تجاوزات لكل دور في floorOverrides)
const [view3dSettings, setView3dSettings] = useState<View3DSettings>(DEFAULT_VIEW3D_SETTINGS);
// ✅ مرجع لالتقاط الدور النشط عند الإضافة
const addFloorRef = useRef<number>(0);
const [showQuantities, setShowQuantities] = useState(false);
const [activeTab, setActiveTab] = useState<'preliminary' | 'structure' | 'finishes' | 'prices' | 'summary'>('finishes');
const elements = useElementManager(); const regionsManager = useRegionManager(walls); const textManager = useTextManager(); const stairManager = useStairManager(walls); // ✅ مدير عناصر السلم الجديد
const stairElementManager = useStairElementManager();
const stairElementEdit = useStairElementEdit();
// ✅ ضبط floor تلقائياً للعناصر المضافة بدون floor
useEffect(() => {
  const toFix = regionsManager.regions.filter(r => r.floor === undefined);
    if (toFix.length > 0) {
        regionsManager.setRegions(regionsManager.regions.map(r =>
              r.floor === undefined ? { ...r, floor: addFloorRef.current } : r
                  ));
                    }
                    }, [regionsManager.regions]);

                    useEffect(() => {
                      const toFix = textManager.texts.filter(t => t.floor === undefined);
                        if (toFix.length > 0) {
                            textManager.setAllTexts(textManager.texts.map(t =>
                                  t.floor === undefined ? { ...t, floor: addFloorRef.current } : t
                                      ));
                                        }
                                        }, [textManager.texts]);

                                        useEffect(() => {
                                          const toFix = stairManager.stairs.filter(s => s.floor === undefined);
                                            if (toFix.length > 0) {
                                                stairManager.setAllStairs(stairManager.stairs.map(s =>
                                                      s.floor === undefined ? { ...s, floor: addFloorRef.current } : s
                                                          ));
                                                            }
                                                            }, [stairManager.stairs]);

                                                            useEffect(() => {
                                                              const toFix = stairElementManager.stairElements.filter(el => el.floor === undefined);
                                                                if (toFix.length > 0) {
                                                                    stairElementManager.setAllElements(stairElementManager.stairElements.map(el =>
                                                                          el.floor === undefined ? { ...el, floor: addFloorRef.current } : el
                                                                              ));
                                                                                }
                                                                                }, [stairElementManager.stairElements]);
                                                                                // ✅ مزامنة تلقائية لـ maxFloor مع أعلى دور موجود فعلياً (فقط زيادة — لا نقصان)
                                                                                useEffect(() => {
                                                                                  let computed = 0;
                                                                                    const check = (f?: number) => { const v = f ?? 0; if (v > computed) computed = v; };
                                                                                      walls.forEach(w => check(w.floor));
                                                                                        elements.columns.forEach(c => check(c.floor));
                                                                                          elements.windows.forEach(w => check(w.floor));
                                                                                            elements.doors.forEach(d => check(d.floor));
                                                                                              textManager.texts.forEach(t => check(t.floor));
                                                                                                stairManager.stairs.forEach(s => check(s.floor));
                                                                                                  stairElementManager.stairElements.forEach(el => check(el.floor));
                                                                                                    axes.forEach(a => check(a.floor));
                                                                                                      if (computed > maxFloor) {
                                                                                                          setMaxFloor(computed);
                                                                                                            }
                                                                                                            }, [
                                                                                                              walls,
                                                                                                                elements.columns,
                                                                                                                  elements.windows,
                                                                                                                    elements.doors,
                                                                                                                      textManager.texts,
                                                                                                                        stairManager.stairs,
                                                                                                                          stairElementManager.stairElements,
                                                                                                                            axes,
                                                                                                                              maxFloor,
                                                                                                                              ]);

// ✅ حالة نافذة إعدادات السلم
const [showStairDialog, setShowStairDialog] = useState(false);
const [stairDialogConfig, setStairDialogConfig] = useState<{
  mode: 'insert-step' | 'insert-landing' | null;
  config: any;
}>({ mode: null, config: null }); const results = useCalculations(walls, elements.columns, elements.windows, elements.doors, 3);
const projectManager = useProjectManager(); useEffect(() => { projectManager.init(); }, []);
const INITIAL_VIEW = { zoom: 0.75, offsetX: 0, offsetY: 0 }; const [view, setView] = useState(INITIAL_VIEW);
const [isDirty, setIsDirty] = useState(false); const [currentProjectName, setCurrentProjectName] = useState<string>(''); const savedSnapshotRef = useRef<string>('');
const [history, setHistory] = useState<Snapshot[]>([]); const [future, setFuture] = useState<Snapshot[]>([]);
const currentSnapshotRef = useRef<Snapshot>({ walls, columns: elements.columns, windows: elements.windows, doors: elements.doors, dimensions, regions: regionsManager.regions, texts: textManager.texts, stairs: stairManager.stairs, northArrows: elements.northArrows, axes, stairElements: stairElementManager.stairElements, planImage: null, clipFrame: null });
const isRestoringRef = useRef(false);
const isEmptyState = useCallback((snap: Snapshot) => { return snap.walls.length === 0 && snap.columns.length === 0 && snap.windows.length === 0 && snap.doors.length === 0 && snap.texts.length === 0 && snap.regions.length === 0 && snap.stairs.length === 0 && snap.northArrows.length === 0 && snap.dimensions.length === 0; }, []);
useEffect(() => {
    if (isRestoringRef.current) return;
      const snap: Snapshot = {
          walls,
              columns: elements.columns,
                  windows: elements.windows,
                      doors: elements.doors,
                          dimensions,
                              regions: regionsManager.regions,
                                  texts: textManager.texts,
                                      stairs: stairManager.stairs,
                                          northArrows: elements.northArrows,
                                              axes,
                                                  stairElements: stairElementManager.stairElements,
                                                      planImage,
                                                          clipFrame,
                                                            };
                                                              const prev = currentSnapshotRef.current;
                                                                if (JSON.stringify(snap) !== JSON.stringify(prev)) {
                                                                    setHistory(h => [...h, prev]);
                                                                        setFuture([]);
                                                                            currentSnapshotRef.current = snap;
                                                                              }
                                                                                const currentSnap = JSON.stringify(snap);
                                                                                  if (isEmptyState(snap) || currentSnap === savedSnapshotRef.current) {
                                                                                      setIsDirty(false);
                                                                                        } else {
                                                                                            setIsDirty(true);
                                                                                              }
                                                                                              }, [walls, dimensions, elements.columns, elements.windows, elements.doors, regionsManager.regions, textManager.texts, stairManager.stairs, elements.northArrows, axes, stairElementManager.stairElements, planImage, clipFrame, isEmptyState]);
const applySnapshot = useCallback((snap: Snapshot) => {
    isRestoringRef.current = true;
      setWalls(snap.walls);
        setDimensions(snap.dimensions);
          elements.setAllElements(snap.columns, snap.windows, snap.doors, snap.northArrows);
            regionsManager.setRegions(snap.regions);
              textManager.setAllTexts(snap.texts);
                stairManager.setAllStairs(snap.stairs);
                  setAxes(snap.axes || []);

                    // ✅ استعادة العناصر الجديدة
                      if (snap.stairElements) {
                          stairElementManager.setAllElements (snap.stairElements);
                            }
                              setPlanImage(snap.planImage ?? null);
                                setClipFrame(snap.clipFrame ?? null);

                                  currentSnapshotRef.current = snap;
                                    requestAnimationFrame(() => { isRestoringRef.current = false; });
                                    }, [elements, regionsManager, textManager, stairManager, stairElementManager]);

  const handleUndo = useCallback(() => { setHistory(prevHistory => { if (prevHistory.length === 0) return prevHistory; const previous = prevHistory[prevHistory.length - 1]; const current = currentSnapshotRef.current; setFuture(prevFuture => [current, ...prevFuture]); applySnapshot(previous); return prevHistory.slice(0, -1); }); }, [applySnapshot]);
const handleRedo = useCallback(() => { setFuture(prevFuture => { if (prevFuture.length === 0) return prevFuture; const next = prevFuture[0]; const current = currentSnapshotRef.current; setHistory(prevHistory => [...prevHistory, current]); applySnapshot(next); return prevFuture.slice(1); }); }, [applySnapshot]);
const commit = useCallback(() => { setHistory(h => [...h, currentSnapshotRef.current]); setFuture([]); }, []);
const handleWallsChange = useCallback((input: Wall[] | ((prev: Wall[]) => Wall[])) => {
    commit();
      setWalls(prev => {
          // ✅ احسب جدران الدور الحالي الجديدة (ندعم الدالة والمصفوفة)
              let currentFloorNew: Wall[];
                  if (typeof input === 'function') {
                        // useWallEditor يُرسل دالة → طبّقها على جدران الدور الحالي فقط
                              const currentFloorPrev = prev.filter(w => (w.floor ?? 0) === activeFloor);
                                    currentFloorNew = input(currentFloorPrev);
                                        } else {
                                              // useDrawing يُرسل مصفوفة مباشرة
                                                    currentFloorNew = input;
                                                        }

                                                            // ✅ احتفظ بجدران الأدوار الأخرى (بما فيها الحدود والخطوط)
                                                                const otherFloorsWalls = prev.filter(w => (w.floor ?? 0) !== activeFloor);

                                                                    // ✅ أضف floor للجدران الجديدة
                                                                        const withFloor = currentFloorNew.map(w => ({ ...w, floor: activeFloor }));

                                                                            return [...otherFloorsWalls, ...withFloor];
                                                                              });
                                                                              }, [commit, activeFloor]);



                        
const handleDimensionsChange = useCallback((newDims: Dimension[]) => {
    commit();
      setDimensions(prev => {
          const otherFloors = prev.filter(d => (d.floor ?? 0) !== activeFloor);
              const updatedCurrent = newDims.map(d => ({ ...d, floor: activeFloor }));
                  return [...otherFloors, ...updatedCurrent];
                    });
                    }, [commit, activeFloor]);
                    
                    const handleAddDimension = useCallback((dim: Dimension) => {
                      commit();
                        setDimensions(prev => [...prev, { ...dim, floor: activeFloor }]);
                        }, [commit, activeFloor]);const handleAddAllDimensions = useCallback(() => {
    // ✅ فقط جدران ومحاور الدور النشط
      const activeWalls = walls.filter(w => (w.floor ?? 0) === activeFloor);
        const activeAxes = axes.filter(a => (a.floor ?? 0) === activeFloor);

          const wallDims = generateDimensionsForWalls(activeWalls);
            const axisDims = generateDimensionsForAxes(activeAxes);

              commit();
                setDimensions(prev => [
                    ...prev,
                        ...wallDims.map(d => ({ ...d, floor: activeFloor })),
                            ...axisDims.map(d => ({ ...d, floor: activeFloor })),
                              ]);
                              }, [walls, axes, commit, activeFloor]);

  // ✅ تغيير حجم جميع النصوص
const handleApplyGlobalTextSize = useCallback((size: number) => {
  setGlobalTextSize(size);
  commit();
  const updated = textManager.texts.map(t => ({ ...t, fontSize: size }));
  textManager.setAllTexts(updated);
}, [commit, textManager]);

// ✅ تغيير نوع خط جميع النصوص
const handleApplyGlobalFontFamily = useCallback((fontFamily: string) => {
  setGlobalFontFamily(fontFamily);
  commit();
  const updated = textManager.texts.map(t => ({ ...t, fontFamily }));
  textManager.setAllTexts(updated);
}, [commit, textManager]);

// ✅ حذف جميع الأبعاد
const handleDeleteAllDimensions = useCallback(() => {
    const currentFloorDims = dimensions.filter(d => (d.floor ?? 0) === activeFloor);
      if (currentFloorDims.length === 0) {
          alert('لا توجد أبعاد لحذفها في هذا الدور');
              return;
                }
                  const confirmed = confirm(`هل تريد حذف جميع أبعاد هذا الدور (${currentFloorDims.length} بعد)؟`);
                    if (!confirmed) return;
                      commit();
                        setDimensions(prev => prev.filter(d => (d.floor ?? 0) !== activeFloor));
                        }, [dimensions, commit, activeFloor]);
                        const handleSetColumnShape = useCallback((shape: ColumnShape) => {
                            setCurrentColumnShape(shape);
                              setMode('column');
                              }, []);
                        
const handlePlaceColumn = useCallback((pt: Point) => {
    commit();
      let snapped = { ...pt };
        const vAxis = axes.find(a => a.type === 'vertical' && Math.abs(pt.x - (a.position + a.offset)) < 0.4);
          if (vAxis) snapped.x = vAxis.position + vAxis.offset;
            const hAxis = axes.find(a => a.type === 'horizontal' && Math.abs(pt.y - (a.position - a.offset)) < 0.4);
              if (hAxis) snapped.y = hAxis.position - hAxis.offset;

                // ✅ العمود الدائري: width = length = القطر
                  const isCircle = currentColumnShape === 'circle';
                    const dim = isCircle ? 0.4 : DEFAULT_COLUMN.width;
                      const dimL = isCircle ? 0.4 : DEFAULT_COLUMN.length;

                        elements.addColumn({
                            position: snapped,
                                width: dim,
                                    length: dimL,
                                        floor: activeFloor,
                                            columnShape: currentColumnShape,
                                              });
                                              }, [elements, commit, axes, activeFloor, currentColumnShape]);


                const handlePlaceWindow = useCallback((pt: Point) => {
                  // ✅ فقط جدران الدور النشط
                    const activeWalls = walls.filter(w => (w.floor ?? 0) === activeFloor);
                      const nearest = findNearestWall(activeWalls, pt);
                        if (!nearest) return;
                          const bestWall = nearest.wall;
                            const len = distance(bestWall.start, bestWall.end);
                              if (len <= 0) return;
                                const pos = distance(bestWall.start, nearest.point);
                                  const center = {
                                      x: bestWall.start.x + ((pos + DEFAULT_WINDOW.width / 2) / len) * (bestWall.end.x - bestWall.start.x),
                                          y: bestWall.start.y + ((pos + DEFAULT_WINDOW.width / 2) / len) * (bestWall.end.y - bestWall.start.y)
                                            };
                                              commit();
                                                elements.addWindow({
                                                    wallId: bestWall.id,
                                                        position: pos,
                                                            width: DEFAULT_WINDOW.width,
                                                                height: DEFAULT_WINDOW.height,
                                                                    center,
                                                                        floor: activeFloor,
                                                                          });
                                                                          }, [walls, elements, commit, activeFloor]);
                                                                          const handleSetDoorType = useCallback((type: DoorType) => {
                                                                              setCurrentDoorType(type);
                                                                                setMode('door');
                                                                                }, []);
                                                                          

                                                                          const handlePlaceDoor = useCallback((pt: Point) => {
                                                                            // ✅ فقط جدران الدور النشط
                                                                              const activeWalls = walls.filter(w => (w.floor ?? 0) === activeFloor);
                                                                                const nearest = findNearestWall(activeWalls, pt);
                                                                                  if (!nearest) return;
                                                                                    const bestWall = nearest.wall;
                                                                                      const len = distance(bestWall.start, bestWall.end);
                                                                                        if (len <= 0) return;
                                                                                          const pos = distance(bestWall.start, nearest.point);
                                                                                            const center = {
                                                                                                x: bestWall.start.x + ((pos + DEFAULT_DOOR.width / 2) / len) * (bestWall.end.x - bestWall.start.x),
                                                                                                    y: bestWall.start.y + ((pos + DEFAULT_DOOR.width / 2) / len) * (bestWall.end.y - bestWall.start.y)
                                                                                                      };
                                                                                                        const wallAngle = Math.atan2(bestWall.end.y - bestWall.start.y, bestWall.end.x - bestWall.start.x);
                                                                                                          commit();
                                                                                                            elements.addDoor({
                                                                                                                wallId: bestWall.id,
                                                                                                                    position: pos,
                                                                                                                        width: DEFAULT_DOOR.width,
                                                                                                                            height: DEFAULT_DOOR.height,
                                                                                                                                center,
                                                                                                                                    rotation: wallAngle,
                                                                                                                                        floor: activeFloor,
                                                                                                                                        doorType: currentDoorType,
                                                                                                                                          });
                                                                                                                                          }, [walls, elements, commit, activeFloor, currentDoorType]);

                                                                                                                                          const handlePlaceRegion = useCallback((pt: Point, type: RegionType) => {
                                                                                                                                            commit();
                                                                                                                                              addFloorRef.current = activeFloor;   // ✅ التقاط الدور
                                                                                                                                                regionsManager.addRegion(pt, type);
                                                                                                                                                  setMode('view');
                                                                                                                                                  }, [regionsManager, commit, activeFloor]);

                                                                                                                                                  const handleDeleteRegion = useCallback((id: string) => { commit(); regionsManager.removeRegion(id); }, [regionsManager, commit]);


const handleAddText = useCallback((position: Point, text: string) => {
    commit();
      addFloorRef.current = activeFloor;
        textManager.addText(position, text);
          setMode('view');
          }, [textManager, commit, activeFloor]);
          const handleUpdateText = useCallback((id: string, patch: Partial<TextElement>) => { commit(); textManager.updateText(id, patch); }, [textManager, commit]);
const handleDeleteText = useCallback((id: string) => { commit(); textManager.removeText(id); }, [textManager, commit]);
const handleCopyText = useCallback((text: TextElement) => {
  commit();
  textManager.addText(
    { x: text.position.x + 1, y: text.position.y + 1 },
    text.text,
    {
      fontSize: text.fontSize,
      color: text.color,
      rotation: text.rotation,
      fontFamily: text.fontFamily,
    }
  );
}, [textManager, commit]);
const handleUpdateColumn = useCallback((id: string, patch: Partial<Column>) => { commit(); elements.updateColumn(id, patch); }, [elements, commit]);
const handleUpdateWindow = useCallback((id: string, patch: Partial<Window>) => { commit(); elements.updateWindow(id, patch); }, [elements, commit]);
const handleUpdateDoor = useCallback((id: string, patch: Partial<Door>) => { commit(); elements.updateDoor(id, patch); }, [elements, commit]);
const handleDeleteColumn = useCallback((id: string) => { commit(); elements.removeColumn(id); }, [elements, commit]);
const handleDeleteWindow = useCallback((id: string) => { commit(); elements.removeWindow(id); }, [elements, commit]);
const handleDeleteDoor = useCallback((id: string) => { commit(); elements.removeDoor(id); }, [elements, commit]);
const handleAddStairAtPoint = useCallback((pt: Point) => {
    commit();
      addFloorRef.current = activeFloor;
        stairManager.addStairAtPoint(pt);
          setMode('view');
          }, [stairManager, commit, activeFloor]);
          const handleUpdateStair = useCallback((id: string, patch: Partial<Stair>) => { commit(); stairManager.updateStair(id, patch); }, [stairManager, commit]);
const handleDeleteStair = useCallback((id: string) => { commit(); stairManager.removeStair(id); }, [stairManager, commit]);
const handleAddNorthArrow = useCallback(() => { commit(); elements.addNorthArrow({ x: 0, y: 0 }); }, [elements, commit]);
const handleUpdateNorthArrow = useCallback((id: string, patch: Partial<NorthArrow>) => { commit(); elements.updateNorthArrow(id, patch); }, [elements, commit]);
const handleSetClipFrame = useCallback((frame: ClipFrame | null) => { setClipFrame(frame); }, []);
// ✅ تبديل وضع الزاوية القائمة
const handleToggleOrthogonal = useCallback(() => {
  setOrthogonalMode(prev => !prev);
  }, []);
const handleCancelTool = useCallback(() => { setMode('view'); setDrawingType(null); }, []);
const toolsActive = mode === 'drawing' || mode === 'dimension' || mode === 'column' || mode === 'window' || mode === 'door' || mode === 'kitchen' || mode === 'bathroom' || mode === 'text' || mode === 'stair';
const toggleLayer = useCallback((layer: keyof LayersState) => { setLayers(prev => ({ ...prev, [layer]: !prev[layer] })); }, []);
const allUnlocked = Object.values(layers).every(v => v);
const toggleAllLayers = useCallback(() => { setLayers(prev => { const newValue = !Object.values(prev).every(v => v); return { walls: newValue, landBoundaries: newValue, helperLines: newValue, dimensions: newValue, columns: newValue, windows: newValue, doors: newValue, texts: newValue, regions: newValue, stairs: newValue, northArrow: newValue, axes: newValue }; }); }, []);
const setAllLayersLocked = useCallback((locked: boolean) => { setLayers({ walls: !locked, landBoundaries: !locked, helperLines: !locked, dimensions: !locked, columns: !locked, windows: !locked, doors: !locked, texts: !locked, regions: !locked, stairs: !locked, northArrow: !locked, axes: !locked }); }, []);
const handleSaveProject = useCallback((name: string) => { const data: any = { walls, columns: elements.columns, windows: elements.windows, doors: elements.doors, texts: textManager.texts, regions: regionsManager.regions, stairs: stairManager.stairs, stairElements: stairElementManager.stairElements, northArrows: elements.northArrows, dimensions, axes, floorHeights, view3dSettings, roundedCorners };
const projectId = projectManager.saveProject(name, data as any); if (projectId) setCurrentProjectName(name); savedSnapshotRef.current = JSON.stringify(data); setIsDirty(false); }, [walls, elements, textManager, regionsManager, stairManager, stairElementManager, dimensions, projectManager, axes, floorHeights, view3dSettings, roundedCorners]);
const handleLoadProject = useCallback((id: string) => {
    const data = projectManager.loadProject(id);
      if (data) {
          const loadedWalls: Wall[] = data.walls || [];
              setWalls(loadedWalls);
                  setDimensions(data.dimensions || []);
                      elements.setAllElements(data.columns || [], data.windows || [], data.doors || [], data.northArrows || []);
                          regionsManager.setRegions(data.regions || []);
                              textManager.setAllTexts(data.texts || []);
                                  stairManager.setAllStairs(data.stairs || []);
                                      // ✅ استعادة عناصر السلم المتعدد (السحبات والبسطات)
                                              stairElementManager.setAllElements((data as any).stairElements || []);
                                                  setAxes((data as any).axes || []);
                                      
                                          // ✅ حساب أعلى دور من البيانات المحمّلة
                                              const allFloors = [
                                                    ...loadedWalls.map((w: Wall) => w.floor ?? 0),
                                                          ...(data.columns || []).map((c: Column) => c.floor ?? 0),
                                                                ...(data.windows || []).map((w: Window) => w.floor ?? 0),
                                                                      ...(data.doors || []).map((d: Door) => d.floor ?? 0),
                                                                          ];
                                                                              const maxFl = allFloors.length > 0 ? Math.max(...allFloors) : 0;
                                                                              setMaxFloor(maxFl);
                                                                              setActiveFloor(0);
                                                                              setShowPreviousFloor(true);

                                                                              // ✅ استعادة ارتفاعات الأدوار
                                                                              const loadedHeights: number[] = (data as any).floorHeights || [];
                                                                              const finalHeights = [...loadedHeights];
                                                                              while (finalHeights.length <= maxFl) finalHeights.push(3.0);
                                                                              setFloorHeights(finalHeights);
                                                            // ✅ استعادة إعدادات 3D (عامة + تجاوزات الأدوار)
                                                            const loaded3D = (data as any).view3dSettings;
                                                            if (loaded3D && typeof loaded3D === 'object') {
                                                              setView3dSettings({ ...DEFAULT_VIEW3D_SETTINGS, ...loaded3D });
                                                              } else {
                                                                setView3dSettings({ ...DEFAULT_VIEW3D_SETTINGS });
                                                                }                              
                                                                                              savedSnapshotRef.current = JSON.stringify(data);
                                                                                                  setIsDirty(false);
                                                                                                      const project = projectManager.projects.find(p => p.id === id);
                                                                                                          if (project) setCurrentProjectName(project.name);
                                                                                                            }
                                                                                                            }, [elements, regionsManager, textManager, stairManager, projectManager]);
                                                                                                            const handleDeleteProject = useCallback((id: string) => { projectManager.deleteProject(id); setCurrentProjectName(''); }, [projectManager]);
const handleNewProject = useCallback(() => { setWalls([]); setDimensions([]); elements.setAllElements([], [], [], []); regionsManager.setRegions([]); textManager.setAllTexts([]); stairManager.setAllStairs([]); setAxes([]); setPlanImage(null); setClipFrame(null); stairElementManager.setAllElements([]); setRoundedCorners([]);
setActiveFloor(0); setMaxFloor(0); setShowPreviousFloor(true); setFloorHeights([3.0]); setView3dSettings({ ...DEFAULT_VIEW3D_SETTINGS }); projectManager.createNewProject();
   savedSnapshotRef.current = ''; setCurrentProjectName(''); setIsDirty(false); }, [elements, regionsManager, textManager, stairManager, projectManager, stairElementManager]);
const handleAddAxes = useCallback((newAxes: Axis[]) => { commit(); setAxes(newAxes); }, [commit]);
// ✅ فتح نافذة إعدادات السلم
  const handleOpenMultiStairDialog = useCallback(() => {
  setShowStairDialog(true);
  setMode('view');
}, []);

const handleCloseStairDialog = useCallback(() => {
  setShowStairDialog(false);
  setStairDialogConfig({ mode: null, config: null });
}, []);
// ✅ إدراج السحبة مباشرة في مركز الشاشة
const handleInsertStepMode = useCallback((config: any) => {
  const centerX = -view.offsetX;
    const centerY = -view.offsetY;
      commit();
        stairElementManager.addElementAtPoint(
              {
                        type: 'step',
                                        width: config.width,
                                                              length: config.length,
                                                                                          treadDepth: config.treadDepth,
                                                                                                                            riserHeight: config.riserHeight,
                                                                                                                                                                    stepCount: config.stepCount,
                                                                                                                                                                                                                  floor: activeFloor,
                                                                                                                                                                                                                                                                      elevation: config.elevation ?? 0,
                                                                                                                                                                                                                                                                                                                        },
                                                                                                                                                                                                                                                                                                                                                                              { x: centerX, y: centerY }
                                                                                                                                                                                                                                                                                                                                                                                                                                      );
                                                          
                                                                }, [view, stairElementManager, commit, activeFloor]);

// ✅ إدراج البسطة مباشرة في مركز الشاشة
const handleInsertLandingMode = useCallback((config: any) => {
  const centerX = -view.offsetX;
    const centerY = -view.offsetY;
      commit();
        stairElementManager.addElementAtPoint(
              {
                        type: 'landing',
                                        width: config.width,
                                                              length: config.length,
                                                                                          floor: activeFloor,
                                                                                                                            elevation: config.elevation ?? 0,
                                                                                                                                                            },
                                                                                                                                                                                                { x: centerX, y: centerY }
                                                                                                                                                                                                                                      );
        
                                              }, [view, stairElementManager, commit, activeFloor]);

// ✅ عند النقر على الشاشة في وضع الإدراج
const handlePlaceStairElement = useCallback((pt: Point) => {
    const { mode: insertMode, config } = stairDialogConfig;
      if (!insertMode || !config) return;

        commit();
          if (insertMode === 'insert-step') {
              stairElementManager.addElementAtPoint(
                      {
                                    type: 'step',
                                                          width: config.width,
                                                                                        length: config.length,
                                                                                                                              treadDepth: config.treadDepth,
                                                                                                                                                                            riserHeight: config.riserHeight,
                                                                                                                                                                                                                                  stepCount: config.stepCount,
                                                                                                                                                                                                                                                                                                floor: activeFloor,
                                                                                                                                                                                                                                                                                                                                                                    elevation: config.elevation ?? 0,
                                                                                                                                                                                                                                                                                                                                                                                                                                        },
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  pt
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                );
              
                                                                                              } else if (insertMode === 'insert-landing') {
                                                                                                  stairElementManager.addElementAtPoint(
                                                                                                          {
                                                                                                                        type: 'landing',
                                                                                                                                              width: config.width,
                                                                                                                                                                            length: config.length,
                                                                                                                                                                                                                  floor: activeFloor,
                                                                                                                                                                                                                                                              elevation: config.elevation ?? 0,
                                                                                                                                                                                                                                                                                                          },
                                                                                                                                                                                                                                                                                                                                                            pt
                                                                                                                                                                                                                                                                                                                                                                                                                  );
                                                                                                  
                                                                                                                                                          }

                                                                                                                                                            setStairDialogConfig({ mode: null, config: null });
                                                                                                                                                              setMode('view');
                                                                                                                                                              }, [stairDialogConfig, stairElementManager, commit, activeFloor]);

// ✅ نسخ عنصر سلم (سحبة أو بسطة)
const handleCopyStairElement = useCallback((id: string) => {
  const el = stairElementManager.stairElements.find(e => e.id === id);
  if (!el) return;
  commit();
  stairElementManager.addElementAtPoint(
    {
      type: el.type,
      width: el.width,
      length: el.length,
      treadDepth: el.treadDepth,
      riserHeight: el.riserHeight,
      stepCount: el.stepCount,
    },
    { x: el.position.x + 1.5, y: el.position.y + 1.5 }
  );
}, [stairElementManager, commit]);
// ✅ إنشاء محاور تلقائياً مع محاذاة الفقاعات
const handleAddAxesFromWalls = useCallback(() => {
  if (walls.length === 0) {
    alert('لا توجد جدران لإنشاء محاور منها');
    return;
  }

  // ✅ المرحلة 1: إيجاد أطول جدار رأسي وأطول جدار أفقي + مراكزهما
  let longestVerticalWallLength = 0;
  let verticalReferenceCenterY = 0;
  let longestHorizontalWallLength = 0;
  let horizontalReferenceCenterX = 0;

  walls.forEach(wall => {
    const dx = Math.abs(wall.end.x - wall.start.x);
    const dy = Math.abs(wall.end.y - wall.start.y);
    const wallLength = Math.sqrt(dx * dx + dy * dy);
    if (wallLength === 0) return;

    // حساب المركز الحقيقي للجدار (بإزاحة نصف السماكة)
    const dirX = (wall.end.x - wall.start.x) / wallLength;
    const dirY = (wall.end.y - wall.start.y) / wallLength;
    const normalX = -dirY;
    const normalY = dirX;
    const sign = wall.normalSign ?? 1;
    const halfThickness = (wall.thickness / 2) * sign;
    const centerX = (wall.start.x + wall.end.x) / 2 + normalX * halfThickness;
    const centerY = (wall.start.y + wall.end.y) / 2 + normalY * halfThickness;

    if (dx > dy) {
      // جدار أفقي
      if (wallLength > longestHorizontalWallLength) {
        longestHorizontalWallLength = wallLength;
        horizontalReferenceCenterX = centerX;
      }
    } else {
      // جدار رأسي
      if (wallLength > longestVerticalWallLength) {
        longestVerticalWallLength = wallLength;
        verticalReferenceCenterY = centerY;
      }
    }
  });

  // ✅ الطول الموحّد = أطول جدار + 4 متر (2 من كل جانب)
  const unifiedVerticalLength = longestVerticalWallLength + 4;
  const unifiedHorizontalLength = longestHorizontalWallLength + 4;

  // ✅ المرحلة 2: إنشاء المحاور بالأطوال والمراكز الموحّدة
  const newAxes: Axis[] = [];
  const existingVAxes = axes.filter(a => a.type === 'vertical');
  const existingHAxes = axes.filter(a => a.type === 'horizontal');
  let vIdx = existingVAxes.length;
  let hIdx = existingHAxes.length;

  walls.forEach(wall => {
    const dx = Math.abs(wall.end.x - wall.start.x);
    const dy = Math.abs(wall.end.y - wall.start.y);
    const wallLength = Math.sqrt(dx * dx + dy * dy);
    if (wallLength === 0) return;

    // حساب المركز الحقيقي للجدار (بإزاحة نصف السماكة)
    const dirX = (wall.end.x - wall.start.x) / wallLength;
    const dirY = (wall.end.y - wall.start.y) / wallLength;
    const normalX = -dirY;
    const normalY = dirX;
    const sign = wall.normalSign ?? 1;
    const halfThickness = (wall.thickness / 2) * sign;
    const centerX = (wall.start.x + wall.end.x) / 2 + normalX * halfThickness;
    const centerY = (wall.start.y + wall.end.y) / 2 + normalY * halfThickness;

    if (dx > dy) {
      // جدار أفقي → محور أفقي (طول ومركز X موحّد)
      newAxes.push({
        id: uuidv4(),
        type: 'horizontal',
        label: String(hIdx + 1),
        position: centerY,
        center: horizontalReferenceCenterX,
        length: unifiedHorizontalLength,
        offset: 0,
      });
      hIdx++;
    } else {
      // جدار رأسي → محور رأسي (طول ومركز Y موحّد)
      newAxes.push({
        id: uuidv4(),
        type: 'vertical',
        label: String.fromCharCode(65 + vIdx),
        position: centerX,
        center: verticalReferenceCenterY,
        length: unifiedVerticalLength,
        offset: 0,
      });
      vIdx++;
    }
  });

  if (newAxes.length === 0) {
    alert('لم يتم إنشاء أي محاور');
    return;
  }

  commit();
  setAxes(prev => reorderAxes([...prev, ...newAxes]));
  alert(`تم إضافة ${newAxes.length} محور`);
}, [walls, axes, commit]);

const handleDeleteAllAxes = useCallback(() => {
  if (axes.length === 0) {
    alert('لا توجد محاور لحذفها');
    return;
  }
  const confirmed = confirm(`هل تريد حذف جميع المحاور (${axes.length} محور)؟`);
  if (!confirmed) return;
  commit();
  setAxes([]);
}, [axes, commit]);
// ✅ دالة 1: بدء رسم حدود الأرض
const handleStartCurvedWall = useCallback(() => {
  setDrawingType('curved-wall');
  setMode('drawing');
}, []);

const handleStartDrawingBoundary = useCallback(() => {
  setDrawingType('land-boundary');
    setMode('drawing');
    }, []);

    // ✅ دالة 2: بدء رسم خط مساعد
    const handleStartDrawingHelperLine = useCallback(() => {
      setDrawingType('helper-line');
        setMode('drawing');
        }, []);

        // ✅ دالة 3: تحويل كل حدود الأرض إلى سور بسماكة 20 سم
        const handleBuildFenceOnBoundaries = useCallback(() => {
          const boundaries = walls.filter(w => w.kind === 'land-boundary');
            if (boundaries.length === 0) {
                alert('لا توجد خطوط حدود أرض لبناء سور فوقها');
                    return;
                      }
                        const confirmed = confirm(`سيتم بناء سور بسماكة 20 سم فوق ${boundaries.length} خط حدود أرض. متابعة؟`);
                          if (!confirmed) return;

                            commit();
                              setWalls(prev => {
                                  // ✅ حوّل كل خط حدود إلى جدار سور (نفس start/end، سماكة 20 سم)
                                      const converted = prev.map(w => {
                                            if (w.kind !== 'land-boundary') return w;
                                                  
                                            return {
                                                ...w,
                                                  thickness: FENCE_THICKNESS,
                                                    type: 'exterior' as const,
                                                      kind: 'fence' as const,
                                                      };
                                            
                                                                                            });
                                                                                                return converted;
                                                                                                  });
                                                                                                    alert(`تم بناء السور فوق ${boundaries.length} خط`);
                                                                                                    }, [walls, commit]);

                                                                                                    // ✅ دالة 4: حذف جميع الخطوط المساعدة
                                                                                                    const handleDeleteAllHelperLines = useCallback(() => {
                                                                                                      const helpers = walls.filter(w => w.kind === 'helper-line');
                                                                                                        if (helpers.length === 0) {
                                                                                                            alert('لا توجد خطوط مساعدة لحذفها');
                                                                                                                return;
                                                                                                                  }
                                                                                                                    commit();
                                                                                                                      setWalls(prev => prev.filter(w => w.kind !== 'helper-line'));
                                                                                                                      }, [walls, commit]);

// ✅ نسخ محور
const handleCopyAxis = useCallback((id: string) => {
  const original = axes.find(a => a.id === id);
  if (!original) return;
  commit();
  const copy: Axis = {
    ...original,
    id: uuidv4(),
    // نسخة جديدة بإزاحة بسيطة للتمييز
    offset: original.offset + 1,
  };
  setAxes(prev => reorderAxes([...prev, copy]));
}, [axes, commit]);
// ✅ عند التحديث، نعيد الترتيب تلقائياً
const handleUpdateAxis = useCallback((id: string, patch: Partial<Axis>) => {
  commit();
  setAxes(prev => {
    const updated = prev.map(a => a.id === id ? { ...a, ...patch } : a);
    return reorderAxes(updated);
  });
}, [commit]);

// ✅ عند الحذف، نعيد الترتيب تلقائياً
const handleDeleteAxis = useCallback((id: string) => {
  commit();
  setAxes(prev => {
    const filtered = prev.filter(a => a.id !== id);
    return reorderAxes(filtered);
  });
}, [commit]);
// ✅ حذف دور كامل
const handleDeleteFloor = useCallback((floor: number) => {
  if (floor <= 0) {
      alert('لا يمكن حذف الدور الأرضي');
          return;
            }
              const confirmed = confirm(
                  `حذف جميع عناصر الدور رقم ${floor}؟\nسيتم إنزال الأدوار الأعلى تلقائياً.`
                    );
                      if (!confirmed) return;

                        commit();

                          // ✅ حذف + إعادة ترقيم
                            const adjust = <T extends { floor?: number }>(items: T[]): T[] =>
                                items
                                      .filter(item => (item.floor ?? 0) !== floor)
                                            .map(item =>
                                                    (item.floor ?? 0) > floor
                                                              ? { ...item, floor: (item.floor ?? 0) - 1 }
                                                                        : item
                                                                              );

                                                                                setWalls(prev => adjust(prev));
                                                                                  elements.setAllElements(
                                                                                      adjust(elements.columns),
                                                                                          adjust(elements.windows),
                                                                                              adjust(elements.doors),
                                                                                                  elements.northArrows,
                                                                                                    );
                                                                                                      textManager.setAllTexts(adjust(textManager.texts));
                                                                                                        stairManager.setAllStairs(adjust(stairManager.stairs));
                                                                                                          stairElementManager.setAllElements(adjust(stairElementManager.stairElements));
                                                                                                            setAxes(prev => adjust(prev));

                                                                                                              // ✅ تحديث الحالة
                                                                                                                  setMaxFloor(prev => Math.max(0, prev - 1));
                                                                                                                    setActiveFloor(prev => {
                                                                                                                        if (prev === floor) return 0;
                                                                                                                            if (prev > floor) return prev - 1;
                                                                                                                                return prev;
                                                                                                                                  });
                                                                                                                                    // ✅ حذف ارتفاع الدور وإزاحة الأدوار الأعلى
                                                                                                                                      setFloorHeights(prev => {
                                                                                                                                          const next = [...prev];
                                                                                                                                              next.splice(floor, 1);
                                                                                                                                                  if (next.length === 0) next.push(3.0);
                                                                                                                                                      return next;
                                                                                                                                                        });
                                                                                                                                                        // ✅ حذف تجاوزات الدور + إنزال تجاوزات الأدوار الأعلى
                                                                                                                                                        setView3dSettings(prev => {
                                                                                                                                                          const next: Record<number, Partial<View3DSettings>> = {};
                                                                                                                                                            Object.entries(prev.floorOverrides || {}).forEach(([k, v]) => {
                                                                                                                                                                const f = parseInt(k, 10);
                                                                                                                                                                    if (f === floor) return;             // حذف تجاوزات الدور المحذوف
                                                                                                                                                                        next[f > floor ? f - 1 : f] = v;     // إنزال الأدوار الأعلى
                                                                                                                                                                          });
                                                                                                                                                                            return { ...prev, floorOverrides: next };
                                                                                                                                                                            });
                                                                                                                                                        }, [elements, textManager, stairManager, stairElementManager, commit]);
                                                                                                                                // ✅ تعيين ارتفاع دور محدد
                                                                                                                                const handleSetFloorHeight = useCallback((floor: number, height: number) => {
                                                                                                                                  if (height <= 0 || height > 10) return;
                                                                                                                                    setFloorHeights(prev => {
                                                                                                                                        const next = [...prev];
                                                                                                                                            // ✅ ملء الفراغات افتراضياً
                                                                                                                                                while (next.length <= floor) next.push(3.0);
                                                                                                                                                    next[floor] = height;
                                                                                                                                                        return next;
                                                                                                                                                          });
                                                                                                                                                          }, []);
                                                        
    // ✅ تحديث الإعدادات العامة للمنظور 3D
    const handleUpdate3DSettings = useCallback((patch: Partial<View3DSettings>) => {
      setView3dSettings(prev => ({ ...prev, ...patch }));
      }, []);
      // ✅ تحديث تجاوزات دور محدد (يُدمج مع الموجود)
      const handleUpdateFloorOverride = useCallback(
        (floor: number, patch: Partial<View3DSettings>) => {
            setView3dSettings(prev => ({
                  ...prev,
                        floorOverrides: {
                                ...prev.floorOverrides,
                                        [floor]: { ...(prev.floorOverrides?.[floor] || {}), ...patch },
                                              },
                                                  }));
                                                    },
                                                      [],
                                                      );
                                                      // ✅ حذف تجاوزات دور محدد (يعود لوراثة الإعدادات العامة)
                                                      const handleClearFloorOverride = useCallback((floor: number) => {
                                                        setView3dSettings(prev => {
                                                            const next = { ...prev.floorOverrides };
                                                                delete next[floor];
                                                                    return { ...prev, floorOverrides: next };
                                                                      });
                                                                      }, []);                                                                                 // ✅ بدء وضع الأركان المقوسة
                                                                      const handleStartRoundCornerMode = useCallback(() => {
                                                                        setMode('round-corner');
                                                                          setRoundCornerFirstWallId(null);
                                                                          }, []);

                                                                          // ✅ إلغاء الوضع
                                                                          const handleCancelRoundCornerMode = useCallback(() => {
                                                                            setMode('view');
                                                                              setRoundCornerFirstWallId(null);
                                                                              }, []);

                                                                              // ✅ النقر على جدار في وضع الأركان
                                       
const handleRoundCornerWallClick = useCallback((wallId: string): boolean => {
    if (mode !== 'round-corner') return false;
      if (!roundCornerFirstWallId) {
          setRoundCornerFirstWallId(wallId);
              return true;
                }
                  if (roundCornerFirstWallId === wallId) {
                      setRoundCornerFirstWallId(null);
                          return true;
                            }
                              const wallA = walls.find(w => w.id === roundCornerFirstWallId);
                                const wallB = walls.find(w => w.id === wallId);
                                  if (!wallA || !wallB) {
                                      setRoundCornerFirstWallId(null);
                                          return true;
                                            }
                                              // ✅ فحص تقاطع الجدارين أو تقاسم نقطة نهاية
                                              let P = segmentIntersection(wallA.start, wallA.end, wallB.start, wallB.end);
                                                if (!P) {
                                                    // قد يتشاركان نقطة نهاية بالضبط (أو تقريباً) دون أن يقطعا بعضهما
                                                    const TOL = 0.05;
                                                      const shared =
                                                          Math.hypot(wallA.start.x - wallB.start.x, wallA.start.y - wallB.start.y) < TOL ||
                                                              Math.hypot(wallA.start.x - wallB.end.x, wallA.start.y - wallB.end.y) < TOL ||
                                                                  Math.hypot(wallA.end.x - wallB.start.x, wallA.end.y - wallB.start.y) < TOL ||
                                                                      Math.hypot(wallA.end.x - wallB.end.x, wallA.end.y - wallB.end.y) < TOL;
                                                        if (shared) {
                                                            P = Math.hypot(wallA.start.x - wallB.start.x, wallA.start.y - wallB.start.y) < TOL ? wallA.start
                                                              : Math.hypot(wallA.start.x - wallB.end.x, wallA.start.y - wallB.end.y) < TOL ? wallA.start
                                                                : wallA.end;
                                                            } else {
                                                              alert('الجداران لا يتقاطعان في ركن');
                                                                  setRoundCornerFirstWallId(null);
                                                                      return true;
                                                                        }
                                                                          }
                                                                            const EPS = 0.30;
                                                                              const nearA =
                                                                                  Math.hypot(P.x - wallA.start.x, P.y - wallA.start.y) < EPS ||
                                                                                      Math.hypot(P.x - wallA.end.x, P.y - wallA.end.y) < EPS;
                                                                                        const nearB =
                                                                                            Math.hypot(P.x - wallB.start.x, P.y - wallB.start.y) < EPS ||
                                                                                                Math.hypot(P.x - wallB.end.x, P.y - wallB.end.y) < EPS;
                                                                if (!nearA || !nearB) {
                                                                      alert('يجب أن يكون الجداران متصلين عند الركن');
                                                                          setRoundCornerFirstWallId(null);
                                                                              return true;
                                                                                }
                                                                                  // ✅ تفعيل المعاينة الحية (بدل window.prompt)
const defaultRadius = Math.min(wallA.thickness, wallB.thickness) / 2;                                                                                      setPendingRoundedCorner({
                                                                                          wallAId: wallA.id,
                                                                                              wallBId: wallB.id,
                                                                                                  radius: defaultRadius,
                                                                                                    });
                                                                                                      setRoundCornerFirstWallId(null);
                                                                                                        return true;
                                                                                                        }, [mode, roundCornerFirstWallId, walls]);
                                                                                       
                                                                                                                            // ✅ حذف ركن مقوس
                                                                                                                            const handleRemoveRoundedCorner = useCallback((id: string) => {
                                                                                                                              commit();
                                                                                                                                setRoundedCorners(prev => prev.filter(rc => rc.id !== id));
                                                                                                                                setSelectedRoundedCornerId(null);
                                                                                                                                }, [commit]);
                                                                // ✅ تحديث قطر ركن مقوس موجود (بدون commit — للمتابعة الحية)
                                                                const handleUpdateRoundedCorner = useCallback((id: string, radius: number) => {
                                                                  setRoundedCorners(prev => prev.map(rc => rc.id === id ? { ...rc, radius } : rc));
                                                                }, []);
                                                                // ✅ تأكيد تعديل القطر (يدخل في undo)
                                                                const handleCommitRoundedCorner = useCallback(() => {
                                                                  commit();
                                                                }, [commit]);
                                                                // ✅ تحديد/إلغاء تحديد ركن مقوس
                                                                const handleSelectRoundedCorner = useCallback((id: string | null) => {
                                                                  setSelectedRoundedCornerId(id);
                                                                }, []);
                                                                                                                                // ✅ تحديث القطر أثناء المعاينة (Slider)
                                                                                                                                const handleUpdatePendingRadius = useCallback((radius: number) => {
                                                                                                                                  setPendingRoundedCorner(prev => prev ? { ...prev, radius } : null);
                                                                                                                                  }, []);

                                                                                                                                  // ✅ تأكيد القوس المعاين وإضافته نهائياً
                                                                                                                                  const handleConfirmPendingRoundedCorner = useCallback((radius: number) => {
                                                                                                                                    if (!pendingRoundedCorner) return;
                                                                                                                                      commit();
                                                                                                                                        setRoundedCorners(prev => [
                                                                                                                                            ...prev,
                                                                                                                                                {
                                                                                                                                                      id: uuidv4(),
                                                                                                                                                            wallAId: pendingRoundedCorner.wallAId,
                                                                                                                                                                  wallBId: pendingRoundedCorner.wallBId,
                                                                                                                                                                        radius,
                                                                                                                                                                            },
                                                                                                                                                                              ]);
                                                                                                                                                                                setPendingRoundedCorner(null);
                                                                                                                                                                                  setMode('view');
                                                                                                                                                                                  }, [pendingRoundedCorner, commit]);

                                                                                                                                                                                  // ✅ إلغاء القوس المعاين
                                                                                                                                                                                  const handleCancelPendingRoundedCorner = useCallback(() => {
                                                                                                                                                                                    setPendingRoundedCorner(null);
                                                                                                                                                                                      setMode('view');
                                                                                                                                                                                      }, []);


// ✅ دالة: تعيين الدور النشط
const handleSetActiveFloor = useCallback((floor: number) => {
  if (floor < 0 || floor > maxFloor) return;
    setActiveFloor(floor);
    }, [maxFloor]);

    // ✅ دالة: إضافة دور فارغ جديد
    const handleAddFloor = useCallback(() => {
        commit();
          const newFloor = maxFloor + 1;
            setMaxFloor(newFloor);
              setActiveFloor(newFloor);
                setFloorHeights(prev => {
                    const next = [...prev];
                        while (next.length <= newFloor) next.push(3.0);
                            return next;
                              });
                              }, [maxFloor, commit]);
    

            // ✅ دالة: إظهار/إخفاء الدور السابق
            const handleTogglePreviousFloor = useCallback(() => {
              setShowPreviousFloor(prev => !prev);
              }, []);

              // ✅ دالة: نسخ الدور الحالي لعدد من الأدوار
              const handleCopyFloor = useCallback(() => {
                const countStr = window.prompt('كم عدد الأدوار التي تريد نسخها للأعلى؟ (1-20)', '1');
                  if (countStr === null) return;
                    const count = parseInt(countStr, 10);
                      if (isNaN(count) || count < 1 || count > 20) {
                          alert('أدخل رقماً بين 1 و 20');
                              return;
                                }

                                  commit();

                                    const startFloor = maxFloor + 1;

                                      const newWalls: Wall[] = [];
                                        const newColumns: Column[] = [];
                                          const newWindows: Window[] = [];
                                            const newDoors: Door[] = [];
                                              const newTexts: TextElement[] = [];
                                                const newStairs: Stair[] = [];
                                                  const newStairElements: StairElement[] = [];
                                                  const newAxes: Axis[] = [];
                                                  const newDimensions: Dimension[] = [];

                                                    for (let i = 0; i < count; i++) {
                                                        const targetFloor = startFloor + i;

                                                            // ✅ خريطة لربط الجدران القديمة بالجديدة
                                                                const wallIdMap = new Map<string, string>();

                                                                    // ✅ نسخ الجدران (بتجاهل حدود الأرض والخطوط المساعدة)
                                                                        walls
                                                                              .filter(w => (w.floor ?? 0) === activeFloor)
                                                                                    .filter(w => w.kind !== 'land-boundary' && w.kind !== 'helper-line')
                                                                                          .forEach(w => {
                                                                                                  const newId = uuidv4();
                                                                                                          wallIdMap.set(w.id, newId);
                                                                                                                  newWalls.push({ ...w, id: newId, floor: targetFloor });
                                                                                                                        });

                                                                                                                            // ✅ نسخ النوافذ (مع ربط بـ wallId الجديد)
                                                                                                                                elements.windows
                                                                                                                                      .filter(win => (win.floor ?? 0) === activeFloor)
                                                                                                                                            .forEach(win => {
                                                                                                                                                    const newWallId = wallIdMap.get(win.wallId);
                                                                                                                                                            if (newWallId) {
                                                                                                                                                                      newWindows.push({ ...win, id: uuidv4(), wallId: newWallId, floor: targetFloor });
                                                                                                                                                                              }
                                                                                                                                                                                    });

                                                                                                                                                                                        // ✅ نسخ الأبواب (مع ربط بـ wallId الجديد)
                                                                                                                                                                                            elements.doors
                                                                                                                                                                                                  .filter(door => (door.floor ?? 0) === activeFloor)
                                                                                                                                                                                                        .forEach(door => {
                                                                                                                                                                                                                const newWallId = wallIdMap.get(door.wallId);
                                                                                                                                                                                                                        if (newWallId) {
                                                                                                                                                                                                                                  newDoors.push({ ...door, id: uuidv4(), wallId: newWallId, floor: targetFloor });
                                                                                                                                                                                                                                          }
                                                                                                                                                                                                                                                });

                                                                                                                                                                                                                                                    // ✅ نسخ الأعمدة
                                                                                                                                                                                                                                                        elements.columns
                                                                                                                                                                                                                                                              .filter(c => (c.floor ?? 0) === activeFloor)
                                                                                                                                                                                                                                                                    .forEach(c => newColumns.push({ ...c, id: uuidv4(), floor: targetFloor }));

                                                                                                                                                                                                                                                                        // ✅ نسخ النصوص
                                                                                                                                                                                                                                                                            textManager.texts
                                                                                                                                                                                                                                                                                  .filter(t => (t.floor ?? 0) === activeFloor)
                                                                                                                                                                                                                                                                                        .forEach(t => newTexts.push({ ...t, id: uuidv4(), floor: targetFloor }));

                                                                                                                                                                                                                                                                                            // ✅ نسخ السلالم القديمة
                                                                                                                                                                                                                                                                                                stairManager.stairs
                                                                                                                                                                                                                                                                                                      .filter(s => (s.floor ?? 0) === activeFloor)
                                                                                                                                                                                                                                                                                                            .forEach(s => newStairs.push({ ...s, id: uuidv4(), floor: targetFloor }));

                                                                                                                                                                                                                                                                                                                // ✅ نسخ عناصر السلم المتعدد
                                                                                                                                                                                                                                                                                                                    stairElementManager.stairElements
                                                                                                                                                                                                                                                                                                                          .filter(el => (el.floor ?? 0) === activeFloor)
                                                                                                                                                                                                                                                                                                                                .forEach(el => newStairElements.push({ ...el, id: uuidv4(), floor: targetFloor }));
                                                         // ✅ نسخ المحاور
                                                        axes
                                                          .filter(a => (a.floor ?? 0) === activeFloor)
                                                            .forEach(a => newAxes.push({ ...a, id: uuidv4(), floor: targetFloor }));                                                                                                                  // ✅ نسخ الأبعاد
                                                          dimensions
                                                            .filter(d => (d.floor ?? 0) === activeFloor)
                                                              .forEach(d => newDimensions.push({ ...d, id: uuidv4(), floor: targetFloor }));                                                                                                                                                       }

                                                                                                                                                                                                                                                                                                                                                                                            // ✅ تطبيق التغييرات
                                                                                                                                                                                                                                                                                                                                      setWalls(prev => [...prev, ...newWalls]);
                                                                                                                                                                                                                                                                                                                                        elements.setAllElements(
                                                                                                                                                                                                                                                                                                                                            [...elements.columns, ...newColumns],
                                                                                                                                                                                                                                                                                                                                                [...elements.windows, ...newWindows],
                                                                                                                                                                                                                                                                                                                                                    [...elements.doors, ...newDoors],
                                                                                                                                                                                                                                                                                                                                                        elements.northArrows,
                                                                                                                                                                                                                                                                                                                                                          );
                                                                                                                                                                                                                                                                                                                                                            textManager.setAllTexts([...textManager.texts, ...newTexts]);
                                                                                                                                                                                                                                                                                                                                                              stairManager.setAllStairs([...stairManager.stairs, ...newStairs]);
                                                                                                                                                                                                                                                                                                                                                                stairElementManager.setAllElements([...stairElementManager.stairElements, ...newStairElements]);
                                                      setAxes(prev => reorderAxes([...prev, ...newAxes]));                                                                                                                                                          setDimensions(prev => [...prev, ...newDimensions]);                                                                                                                                                

  setMaxFloor(startFloor + count - 1);
    setActiveFloor(startFloor);

      // ✅ نسخ ارتفاع الدور لكل دور جديد
        setFloorHeights(prev => {
            const next = [...prev];
                while (next.length <= activeFloor) next.push(3.0);
                    const srcHeight = next[activeFloor] ?? 3.0;
                        for (let i = 0; i < count; i++) {
                              next.push(srcHeight);
                                  }
                                      return next;
                                        });
                                        }, [
                                          activeFloor, maxFloor, walls, axes,
                                            dimensions,
                                              elements, textManager, stairManager, stairElementManager,
                                                commit,
                                                ]);
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  

return { walls, setWalls, mode, setMode, drawingType, setDrawingType, dimensions, setDimensions, dimensionFontSize, setDimensionFontSize, layers, toggleLayer, toggleAllLayers, allUnlocked, setAllLayersLocked, showQuantities, setShowQuantities, activeTab, setActiveTab, elements, regionsManager, textManager, stairManager, results, history, future, handleUndo, handleRedo, handleWallsChange, handleDimensionsChange, handleAddDimension, handleAddAllDimensions, handlePlaceColumn, handlePlaceWindow, handlePlaceDoor, handlePlaceRegion, handleDeleteRegion, handleAddText, handleUpdateText, handleDeleteText, handleCopyText, handleUpdateColumn, handleUpdateWindow, handleUpdateDoor, handleDeleteColumn, handleDeleteWindow, handleDeleteDoor, handleAddStairAtPoint, handleUpdateStair, handleDeleteStair, handleAddNorthArrow, handleUpdateNorthArrow, handleCancelTool, toolsActive, projectManager, handleSaveProject, handleLoadProject, handleDeleteProject, handleNewProject, isDirty, currentProjectName, clipFrame, setClipFrame: handleSetClipFrame, view, setView, planImage, setPlanImage, axes, setAxes, handleAddAxes, handleUpdateAxis, handleDeleteAxis, handleAddAxesFromWalls, handleDeleteAllAxes, globalTextSize, setGlobalTextSize,
globalFontFamily, setGlobalFontFamily,
axisBubbleSize, setAxisBubbleSize,
handleApplyGlobalTextSize,
handleApplyGlobalFontFamily,
handleDeleteAllDimensions, handleCopyAxis, // ✅ النظام الجديد للسلم
stairElementManager,
stairElementEdit,
showStairDialog,
stairDialogConfig,
handleOpenMultiStairDialog,
handleCloseStairDialog,        // ✅ مضاف
handleInsertStepMode,
handleInsertLandingMode,
handleSetDoorType,
handleSetColumnShape,
handlePlaceStairElement,
handleCopyStairElement,
// ✅ الخطوط الجديدة
handleStartCurvedWall,
handleStartDrawingBoundary,
handleStartDrawingHelperLine,
handleBuildFenceOnBoundaries,
handleDeleteAllHelperLines,
// ✅ الأدوار
activeFloor,
maxFloor,
showPreviousFloor,
handleSetActiveFloor,
handleAddFloor,
handleCopyFloor,
handleDeleteFloor,
handleTogglePreviousFloor,
// ✅ الأركان المقوسة
roundCornerFirstWallId,
roundedCorners,
setRoundedCorners,
handleRemoveRoundedCorner,
handleUpdateRoundedCorner,
handleCommitRoundedCorner,
handleSelectRoundedCorner,
selectedRoundedCornerId,
handleStartRoundCornerMode,
handleCancelRoundCornerMode,
handleRoundCornerWallClick,
// ✅ معاينة الأركان المقوسة
pendingRoundedCorner,
handleUpdatePendingRadius,
handleConfirmPendingRoundedCorner,
handleCancelPendingRoundedCorner,
// ✅ وضع الزاوية القائمة
orthogonalMode,
handleToggleOrthogonal,
// ✅ ارتفاع الدور
floorHeights,
handleSetFloorHeight,
// ✅ إعدادات 3D
view3dSettings,
handleUpdate3DSettings,
handleUpdateFloorOverride,
handleClearFloorOverride };
}
