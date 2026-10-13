import { useState, useEffect, useRef } from 'react';
import { useAppState } from './hooks/useAppState';
import { CanvasContainer } from './components/Canvas/CanvasContainer';
import { TopToolbar } from './components/Toolbar/TopToolbar';
import { QuantitiesPanel } from './components/Calculator/QuantitiesPanel';
import { exportToPDF } from './core/pdfExport';
import { App as CapApp } from '@capacitor/app';
import { Filesystem, Directory, Encoding } from '@capacitor/filesystem';
import { Share } from '@capacitor/share';
import './App.css';
import { StairSettingsDialog } from './components/Stair/StairSettingsDialog';
import { RoundedCornerDialog } from './components/Canvas/RoundedCornerDialog';
import { View3DPanel } from './components/View3D/View3DPanel';
const handleError = (msg: string) => alert(msg);

export default function App() {
  const state = useAppState();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showGrid, setShowGrid] = useState(true);
  const [exitPromptVisible, setExitPromptVisible] = useState(false);
  const [showView3D, setShowView3D] = useState(false);
  const canvasRef = useRef<HTMLDivElement>(null);

  // ✅ حالة نافذة حفظ المشروع المخصصة
  const [savePromptVisible, setSavePromptVisible] = useState(false);
  const [savePromptValue, setSavePromptValue] = useState('');
  const saveResolverRef = useRef<((v: string | null) => void) | null>(null);

  // ✅ إخفاء الشبكة تلقائياً عند تصدير PDF، وإظهارها بعده
  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent<boolean>).detail;
      setShowGrid(detail !== false);
    };
    window.addEventListener('pdf-export-grid', handler);
    return () => window.removeEventListener('pdf-export-grid', handler);
  }, []);

const fitViewToWalls = () => {
    // ✅ فقط جدران الدور النشط
      const extWalls = state.walls.filter(w =>
          w.type === 'exterior' && (w.floor ?? 0) === state.activeFloor
            );
  if (!extWalls.length) { state.setView({ zoom: 0.55, offsetX: 0, offsetY: 0 }); return; }
    let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
    extWalls.forEach(w => {
      minX = Math.min(minX, w.start.x, w.end.x);
      maxX = Math.max(maxX, w.start.x, w.end.x);
      minY = Math.min(minY, w.start.y, w.end.y);
      maxY = Math.max(maxY, w.start.y, w.end.y);
    });
    const width = maxX - minX, height = maxY - minY;
    if (width <= 0 || height <= 0) return;
    const container = canvasRef.current;
    if (!container) return;
    const zoom = Math.min(
      container.clientWidth / (width * 100),
      container.clientHeight / (height * 100)
    ) * 0.55;
    state.setView({
      zoom: Math.max(0.35, Math.min(zoom, 1)),
      offsetX: -(minX + maxX) / 2,
      offsetY: -(minY + maxY) / 2,
    });
  };

  const askName = (title: string, initial: string) => window.prompt(title, initial);

  // ✅ نافذة إدخال الاسم المخصصة (بديل prompt)
  const askNameAsync = (title: string, initial: string): Promise<string | null> => {
    return new Promise((resolve) => {
      setSavePromptValue(initial);
      saveResolverRef.current = resolve;
      setSavePromptVisible(true);
    });
  };

  const handleSavePromptConfirm = () => {
    const val = savePromptValue.trim();
    saveResolverRef.current?.(val || null);
    saveResolverRef.current = null;
    setSavePromptVisible(false);
  };

  const handleSavePromptCancel = () => {
    saveResolverRef.current?.(null);
    saveResolverRef.current = null;
    setSavePromptVisible(false);
  };

  // ✅ حفظ المشروع (نفس الاسم = تحديث، اسم جديد = إنشاء جديد)
  const save = async (): Promise<boolean> => {
    const currentName = state.currentProjectName || '';
    const name = await askNameAsync('أدخل اسم المشروع:', currentName || 'مسودة غير محفوظة');
    if (!name?.trim()) return false;
    const projectName = name.trim();

    state.handleSaveProject(projectName);

    const projectData = {
      name: projectName,
      walls: state.walls,
      dimensions: state.dimensions,
      columns: state.elements.columns,
      windows: state.elements.windows,
      doors: state.elements.doors,
      texts: state.textManager.texts,
      regions: state.regionsManager.regions,
      stairs: state.stairManager.stairs,
      stairElements: state.stairElementManager.stairElements,
      northArrows: state.elements.northArrows,
      planImage: state.planImage,
      axes: state.axes,
      floorHeights: state.floorHeights,
      view3dSettings: state.view3dSettings,
    };
    const jsonString = JSON.stringify(projectData);
    const fileName = `${projectName.replace(/\s+/g, '_')}.finalplan.json`;
    try {
      const result = await Filesystem.writeFile({
        path: fileName,
        data: jsonString,
        directory: Directory.Cache,
        encoding: Encoding.UTF8,
      });
      await Share.share({
        title: 'مشروع Finalplan',
        text: 'تم حفظ المشروع ومشاركته',
        url: result.uri,
        dialogTitle: 'حفظ أو مشاركة المشروع',
      });
      return true;
    } catch (e) {
      alert('فشل تجهيز الملف، حاول مرة أخرى.');
      return false;
    }
  };

  // ✅ حفظ عادي (من الشريط الجانبي)
  const handleSaveClick = async () => {
    const saved = await save();
    if (saved) alert('تم الحفظ بنجاح!');
    setIsSidebarOpen(false);
  };

  // ✅ زر الرجوع: إذا كان هناك تعديلات → نافذة تحذير مخصصة
 
  useEffect(() => {
  let listenerHandle: { remove: () => Promise<void> } | null = null;

  const setup = async () => {
    listenerHandle = await CapApp.addListener('backButton', async () => {
      // 1. إغلاق القائمة الجانبية
      if (isSidebarOpen) { setIsSidebarOpen(false); return; }

      // 2. إذا كان هناك تعديلات غير محفوظة → نافذة خروج مخصصة
      if (state.isDirty) {
        setExitPromptVisible(true);
      } else {
        await CapApp.exitApp();
      }
    });
  };
  setup();

  return () => {
    listenerHandle?.remove();
    listenerHandle = null;
  };
}, [isSidebarOpen, state.isDirty]);
  // ✅ زر: حفظ وخروج
  const handleExitWithSave = async () => {
    setExitPromptVisible(false);
    const saved = await save();
    if (saved) {
      setTimeout(async () => { await CapApp.exitApp(); }, 400);
    }
  };

  // ✅ زر: خروج بدون حفظ
  const handleExitWithoutSave = async () => {
    setExitPromptVisible(false);
    await CapApp.exitApp();
  };

  // ✅ زر: إلغاء الخروج
  const handleCancelExit = () => {
    setExitPromptVisible(false);
  };

  const load = (id: string) => {
    if (state.isDirty && !confirm('حفظ قبل التحميل؟')) return;
    if (state.isDirty) {
      const name = askName('أدخل اسم المشروع لحفظ التعديلات:', state.currentProjectName);
      if (name?.trim()) state.handleSaveProject(name.trim());
    }
    state.handleLoadProject(id);
    state.setAllLayersLocked(true);
    setIsSidebarOpen(false);
    setTimeout(() => fitViewToWalls(), 150);
  };

  const del = (id: string) => {
    if (confirm('حذف المشروع؟')) {
      state.handleDeleteProject(id);
      setIsSidebarOpen(false);
    }
  };

  const newProject = () => {
    if (state.isDirty && !confirm('حفظ التعديلات قبل مشروع جديد؟')) return;
    if (state.isDirty) {
      const name = askName('أدخل اسم المشروع لحفظ التعديلات:', state.currentProjectName);
      if (name?.trim()) state.handleSaveProject(name.trim());
    }
    state.handleNewProject();
    setIsSidebarOpen(false);
    setTimeout(() => fitViewToWalls(), 150);
  };

  const toggleClip = () => {
    state.setClipFrame(state.clipFrame ? null : {
      id: 'clip-main',
      x: state.walls[0] ? (state.walls[0].start.x + state.walls[0].end.x) / 2 : 5,
      y: state.walls[0] ? (state.walls[0].start.y + state.walls[0].end.y) / 2 : 5,
      width: 6,
      height: 6 * 1.414,
      rotation: 0,
    });
    setIsSidebarOpen(false);
  };

  const pdf = async () => {
    if (!state.clipFrame) return handleError('يرجى تفعيل الكليشة أولاً');
    const stage = document.querySelector('[data-floor-plan-stage="true"]') as HTMLElement;
    if (!stage) return handleError('تعذر العثور على منطقة الرسم');
    await exportToPDF(stage, state.clipFrame, state.view);
    setIsSidebarOpen(false);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      const dataUrl = reader.result as string;
      const img = new Image();
      img.onload = () => {
        const naturalW = img.naturalWidth;
        const naturalH = img.naturalHeight;
        const ratio = naturalH > 0 ? naturalW / naturalH : 1;
        // ✅ العرض الأساسي = 10 متر، والارتفاع يُحسب حسب النسبة
        const baseWidth = 10;
        const baseHeight = ratio > 0 ? baseWidth / ratio : 10;
        state.setPlanImage({
          id: 'image-1',
          url: dataUrl,
          x: 0,
          y: 0,
          width: baseWidth,
          height: baseHeight,
          opacity: 0.5,
          locked: false,
          isSelected: false,
          rotation: 0,
        });
      };
      img.src = dataUrl;
    };
    reader.readAsDataURL(file);
  };

  // ✅ ضبط مقياس الصورة (تعديل الصورة فقط، بدون تعديل الجدران)
  const handleScaleImage = () => {
    if (!state.planImage) return alert('لا توجد صورة مستوردة!');
    if (state.walls.length === 0) return alert('ارسم جداراً فوق الجدار الموجود في الصورة أولاً!');

    const drawnWall = state.walls[state.walls.length - 1];
    const drawnLengthAuto = Math.hypot(
      drawnWall.end.x - drawnWall.start.x,
      drawnWall.end.y - drawnWall.start.y
    );

    if (drawnLengthAuto <= 0.01) {
      return alert('الجدار المرسوم قصير جداً. ارسم جداراً أطول فوق الجدار الموجود على الصورة.');
    }

    const drawnLengthStr = prompt(
      '1. أدخل طول الجدار المرسوم على الشاشة (متر):\n(القيمة الحالية: ' + drawnLengthAuto.toFixed(2) + ')',
      drawnLengthAuto.toFixed(2)
    );
    if (drawnLengthStr === null) return;
    const drawnValue = parseFloat(drawnLengthStr.replace(',', '.'));
    if (isNaN(drawnValue) || drawnValue <= 0) return alert('قيمة طول الجدار المرسوم غير صالحة');

    const imageLengthStr = prompt(
      '2. أدخل الطول الحقيقي للجدار على الصورة (متر):',
      '3'
    );
    if (imageLengthStr === null) return;
    const imageValue = parseFloat(imageLengthStr.replace(',', '.'));
    if (isNaN(imageValue) || imageValue <= 0) return alert('قيمة الطول الحقيقي غير صالحة');

    const factor = imageValue / drawnValue;

    const anchorX = (drawnWall.start.x + drawnWall.end.x) / 2;
    const anchorY = (drawnWall.start.y + drawnWall.end.y) / 2;

    const newWidth = state.planImage.width * factor;
    const newHeight = state.planImage.height * factor;

    const relX = (anchorX - state.planImage.x) / state.planImage.width;
    const relY = (anchorY - state.planImage.y) / state.planImage.height;

    const newX = anchorX - relX * newWidth;
    const newY = anchorY - relY * newHeight;

    state.setPlanImage({
      ...state.planImage,
      x: newX,
      y: newY,
      width: newWidth,
      height: newHeight,
    });

    alert('تم ضبط مقياس الصورة بنجاح!\nمعامل التحجيم = ' + factor.toFixed(3));
  };

  const handleLockImage = () => {
    if (state.planImage) state.setPlanImage({ ...state.planImage, locked: !state.planImage.locked });
  };
  const handleDeleteImage = () => { state.setPlanImage(null); };

  const importProject = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const data = JSON.parse(reader.result as string);
        state.handleLoadProject(String(data.name || 'مشروع مستورد'));
        state.setWalls(data.walls || []);
        state.setDimensions(data.dimensions || []);
        state.elements.setAllElements(
          data.columns || [],
          data.windows || [],
          data.doors || [],
          data.northArrows || []
        );
        state.textManager.setAllTexts(data.texts || []);
        state.regionsManager.setRegions(data.regions || []);
                state.stairManager.setAllStairs(data.stairs || []);
                // ✅ استعادة عناصر السلم المتعدد
                state.stairElementManager.setAllElements(data.stairElements || []);
                // ✅ استعادة الأركان المقوسة
                state.setRoundedCorners((data as any).roundedCorners || []);
                if (data.planImage) state.setPlanImage(data.planImage);
                if (data.axes) state.setAxes(data.axes);
// ✅ استعادة إعدادات 3D (عامة + تجاوزات الأدوار) إن وُجدت
if (data.view3dSettings && typeof data.view3dSettings === 'object') {
  state.handleUpdate3DSettings(data.view3dSettings);
  }

// ✅ حساب أعلى دور من البيانات المستوردة
const allFloors = [
  ...(data.walls || []).map((w: any) => w.floor ?? 0),
    ...(data.columns || []).map((c: any) => c.floor ?? 0),
      ...(data.windows || []).map((w: any) => w.floor ?? 0),
        ...(data.doors || []).map((d: any) => d.floor ?? 0),
        ];
        const maxFl = allFloors.length > 0 ? Math.max(...allFloors) : 0;
        // ملاحظة: لدينا دوال الأدوار في state، لكن importProject يستدعي مباشرة
        // يمكن استدعاء الدوال لو أردت — حالياً نترك الحالة الافتراضية
        
        alert('تم استيراد المشروع بنجاح!');      } catch {
        alert('ملف غير صالح!');
      }
    };
    reader.readAsText(file);
  };

  const canvas = (
    <CanvasContainer
      walls={state.walls}
      onWallsChange={state.handleWallsChange}
      mode={state.mode}
      drawingType={state.drawingType}
      onModeChange={state.setMode}
      onCancelTool={() => { state.setMode('view'); state.setDrawingType(null); }}
      dimensions={state.dimensions}
      onAddDimension={state.handleAddDimension}
      onDimensionsChange={state.handleDimensionsChange}
      dimensionFontSize={state.dimensionFontSize}
      layers={state.layers}
      columns={state.elements.columns}
      windows={state.elements.windows}
      doors={state.elements.doors}
      texts={state.textManager.texts}
      regions={state.regionsManager.regions}
      stairs={state.stairManager.stairs}
      northArrows={state.elements.northArrows}
      updateNorthArrow={state.handleUpdateNorthArrow}
      frozen={false}
      onAddStairAtPoint={state.handleAddStairAtPoint}
      onUpdateStair={state.handleUpdateStair}
      onDeleteStair={state.handleDeleteStair}
      onPlaceColumn={state.handlePlaceColumn}
      onPlaceWindow={state.handlePlaceWindow}
      onPlaceDoor={state.handlePlaceDoor}
      onPlaceRegion={state.handlePlaceRegion}
      onDeleteRegion={state.handleDeleteRegion}
      updateColumn={state.handleUpdateColumn}
      updateWindow={state.handleUpdateWindow}
      updateDoor={state.handleUpdateDoor}
      onDeleteColumn={state.handleDeleteColumn}
      onDeleteWindow={state.handleDeleteWindow}
      onDeleteDoor={state.handleDeleteDoor}
      onAddText={state.handleAddText}
      onUpdateText={state.handleUpdateText}
      onDeleteText={state.handleDeleteText}
      onCopyText={state.handleCopyText}
      clipFrame={state.clipFrame}
      setClipFrame={state.setClipFrame}
      planImage={state.planImage}
      setPlanImage={state.setPlanImage}
      axes={state.axes}
      selectedAxisId={null}
      onUpdateAxis={state.handleUpdateAxis}
      onDeleteAxis={state.handleDeleteAxis}
      showGrid={showGrid}
      axisBubbleSize={state.axisBubbleSize}
      onCopyAxis={state.handleCopyAxis}
            stairElements={state.stairElementManager.stairElements}
selectedStairElementId={state.stairElementEdit.selectedId}
onUpdateStairElement={state.stairElementManager.updateElement}
onRotateStairElement={state.stairElementManager.rotateElementById}
onDeleteStairElement={state.stairElementManager.removeElement}
onCopyStairElement={state.handleCopyStairElement}
stairElementEdit={state.stairElementEdit}
orthogonalMode={state.orthogonalMode}
onToggleOrthogonal={state.handleToggleOrthogonal}
      // ✅ الأدوار
            activeFloor={state.activeFloor}
                  maxFloor={state.maxFloor}
                        showPreviousFloor={state.showPreviousFloor}
                              onSetActiveFloor={state.handleSetActiveFloor}
                                    onAddFloor={state.handleAddFloor}
    onCopyFloor={state.handleCopyFloor}
        onDeleteFloor={state.handleDeleteFloor}
            onTogglePreviousFloor={state.handleTogglePreviousFloor}
            floorHeights={state.floorHeights}
              onSetFloorHeight={state.handleSetFloorHeight}
                    roundCornerFirstWallId={state.roundCornerFirstWallId}
                        roundedCorners={state.roundedCorners}
                                pendingRoundedCorner={state.pendingRoundedCorner}
                                            onRoundCornerWallClick={state.handleRoundCornerWallClick}
                                              selectedRoundedCornerId={state.selectedRoundedCornerId}
                                                onSelectRoundedCorner={state.handleSelectRoundedCorner}
                                                onUpdateRoundedCorner={state.handleUpdateRoundedCorner}
                                                onCommitRoundedCorner={state.handleCommitRoundedCorner}
                                                onDeleteRoundedCorner={state.handleRemoveRoundedCorner}
                                                            />
                                );                                           

  const quantities = {
    showQuantities: state.showQuantities,
    onToggle: () => state.setShowQuantities(prev => !prev),
    activeTab: state.activeTab,
    onTabChange: state.setActiveTab,
    walls: state.walls,
    columns: state.elements.columns,
    windows: state.elements.windows,
    doors: state.elements.doors,
    regions: state.regionsManager.regions,
    stairs: state.stairManager.stairs,
    results: state.results,
    canShowQuantities: !!state.projectManager.currentProjectId,
  };

  const topbar = (
    <TopToolbar
      mode={state.mode}
      drawingType={state.drawingType}
      onStartDrawing={t => { state.setDrawingType(t); state.setMode('drawing'); }}
      onUndo={state.handleUndo}
      onRedo={state.handleRedo}
      historyLength={state.history.length}
      futureLength={state.future.length}
      onAddAllDimensions={state.handleAddAllDimensions}
      onModeChange={state.setMode}
      layers={state.layers}
      onToggleLayer={state.toggleLayer}
      onToggleAllLayers={state.toggleAllLayers}
      allUnlocked={state.allUnlocked}
      dimensionFontSize={state.dimensionFontSize}
      onDimensionFontSizeChange={state.setDimensionFontSize}
      onAddNorthArrow={state.handleAddNorthArrow}
      onAddAxes={state.handleAddAxes}
      axes={state.axes}
      onAddAxesFromWalls={state.handleAddAxesFromWalls}
      onDeleteAllAxes={state.handleDeleteAllAxes}
      showGrid={showGrid}
      onToggleGrid={() => setShowGrid(prev => !prev)}
      onDeleteAllDimensions={state.handleDeleteAllDimensions}
globalTextSize={state.globalTextSize}
onGlobalTextSizeChange={state.handleApplyGlobalTextSize}
globalFontFamily={state.globalFontFamily}
onGlobalFontFamilyChange={state.handleApplyGlobalFontFamily}
axisBubbleSize={state.axisBubbleSize}
onAxisBubbleSizeChange={state.setAxisBubbleSize}
      onOpenMultiStairDialog={state.handleOpenMultiStairDialog}
      onSetDoorType={state.handleSetDoorType}
      onSetColumnShape={state.handleSetColumnShape}
            // ✅ الخطوط الجديدة
                  onStartCurvedWall={state.handleStartCurvedWall}
                  onStartDrawingBoundary={state.handleStartDrawingBoundary}
                        onStartDrawingHelperLine={state.handleStartDrawingHelperLine}
                              onBuildFenceOnBoundaries={state.handleBuildFenceOnBoundaries}
                                    onDeleteAllHelperLines={state.handleDeleteAllHelperLines}
                                    onStartRoundCornerMode={state.handleStartRoundCornerMode}
    />
  );

  const sidebar = isSidebarOpen && (
    <>
      <div
        onClick={() => setIsSidebarOpen(false)}
        style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.3)', zIndex: 1000 }}
      />
      <div
        onClick={e => e.stopPropagation()}
        style={{
          position: 'fixed',
          top: 0,
          right: 0,
          width: '33vw',
          maxWidth: 400,
          height: '100%',
          background: '#fff',
          boxShadow: '-2px 0 10px rgba(0,0,0,0.1)',
          zIndex: 1001,
          display: 'flex',
          flexDirection: 'column',
          padding: 20,
          gap: 15,
          overflowY: 'auto',
          WebkitOverflowScrolling: 'touch',
        }}
      >
        <h3 style={{ margin: 0, color: '#003366' }}>إدارة المشاريع</h3>
        <button onClick={newProject} style={btnStyles.btn}>➕ مشروع جديد</button>
        <button onClick={handleSaveClick} style={btnStyles.btnPrimary}>💾 حفظ في الهاتف</button>
        <label style={btnStyles.btn}>📂 استيراد من الهاتف
          <input type="file" accept=".json" style={{ display: 'none' }} onChange={importProject} />
        </label>
        <select
          onChange={e => e.target.value && load(e.target.value)}
          style={{ padding: 8, borderRadius: 6, border: '1px solid #ccc' }}
        >
          <option value="">📂 اختر مشروعاً</option>
          {state.projectManager.projects.map(p => (
            <option key={p.id} value={p.id}>{p.name}</option>
          ))}
        </select>
        {state.projectManager.currentProjectId && (
          <button
            onClick={() => del(state.projectManager.currentProjectId!)}
            style={btnStyles.btnDanger}
          >
            🗑️ حذف المشروع المحدد
          </button>
        )}
        <div style={{ borderTop: '1px solid #eee', paddingTop: 10, display: 'flex', flexDirection: 'column', gap: 8 }}>
          <button
            onClick={toggleClip}
            style={{
              padding: 10,
              borderRadius: 6,
              border: '1px solid #f00',
              background: state.clipFrame ? '#f00' : '#fff',
              color: state.clipFrame ? '#fff' : '#f00',
            }}
          >
            {state.clipFrame ? '🗑️ إزالة الكليشة' : '📐 إضافة الكليشة (A3)'}
          </button>
          <button onClick={pdf} style={btnStyles.btn}>📄 PDF المسقط</button>
          <label style={btnStyles.btn}>🖼️ استيراد مخطط
            <input type="file" accept="image/*" style={{ display: 'none' }} onChange={handleImageUpload} />
          </label>
          {state.planImage && (
            <>
              <button onClick={handleScaleImage} style={btnStyles.btn}>📏 ضبط مقياس الرسم</button>
              <button onClick={handleLockImage} style={btnStyles.btn}>
                {state.planImage.locked ? '🔓 فك قفل الصورة' : '🔒 قفل الصورة'}
              </button>
              <button onClick={handleDeleteImage} style={btnStyles.btnDanger}>🗑️ حذف الصورة</button>
            </>
          )}
        </div>
        <button onClick={() => setIsSidebarOpen(false)} style={{ marginTop: 20, ...btnStyles.btn }}>✖ إغلاق</button>
      </div>
    </>
  );

  return (
    <div
      className="app"
      style={{ height: '100dvh', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}
    >
      <header
        className="header"
        style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}
      >
        <h1>🏗 المسقط المعماري التفاعلي</h1>
      
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <button
                onClick={() => setShowView3D(true)}
                    title="المنظور ثلاثي الأبعاد"
                        style={{
                              background: '#0a0',
                                    color: '#fff',
                                          border: 'none',
                                                borderRadius: 6,
                                                      padding: '8px 12px',
                                                            cursor: 'pointer',
                                                                  fontSize: 16,
                                                                        fontWeight: 700,
                                                                            }}
                                                                              >
                                                                                  🏠 3D
                                                                                    </button>
                                                                                      <button
                                                                                          onClick={() => setIsSidebarOpen(true)}
                                                                                              style={{
                                                                                                    background: '#00509e',
                                                                                                          color: '#fff',
                                                                                                                border: 'none',
                                                                                                                      borderRadius: 6,
                                                                                                                            padding: '8px 12px',
                                                                                                                                  cursor: 'pointer',
                                                                                                                                        fontSize: 18,
                                                                                                                                            }}
                                                                                                                                              >
                                                                                                                                                  ☰
                                                                                                                                                    </button>
                                                                                                                                                    </div>
      </header>
      {sidebar}
      <div style={{ flexShrink: 0 }}>{topbar}</div>
      <div ref={canvasRef} style={{ flex: 1, minHeight: 0, position: 'relative', overflow: 'hidden' }}>
        <div style={{ flexShrink: 0 }}>{canvas}</div>
        <QuantitiesPanel {...quantities} display="all" />
      </div>

            {/* ✅ نافذة حفظ المشروع المخصصة */}
      {savePromptVisible && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 9999,
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20,
        }}>
          <div style={{
            background: '#fff', borderRadius: 16, padding: 24, maxWidth: 400, width: '100%',
            boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
          }}>
            <h3 style={{ margin: '0 0 12px 0', color: '#003366', fontSize: 17, textAlign: 'center' }}>
              💾 حفظ المشروع
            </h3>
            <p style={{ margin: '0 0 12px 0', color: '#666', fontSize: 13, textAlign: 'center' }}>
              أدخل اسم المشروع (نفس الاسم = تحديث، اسم جديد = إنشاء جديد)
            </p>
            <input
              type="text"
              value={savePromptValue}
              onChange={e => setSavePromptValue(e.target.value)}
              onFocus={e => e.target.select()}
              autoFocus
              dir="rtl"
              style={{
                width: '100%', padding: 12, borderRadius: 10, border: '2px solid #00509e',
                fontSize: 15, fontFamily: 'Cairo, sans-serif', textAlign: 'right',
                boxSizing: 'border-box', marginBottom: 16,
              }}
              onKeyDown={e => {
                if (e.key === 'Enter') handleSavePromptConfirm();
                if (e.key === 'Escape') handleSavePromptCancel();
              }}
            />
            <div style={{ display: 'flex', gap: 10 }}>
              <button
                onClick={handleSavePromptConfirm}
                style={{
                  flex: 1, padding: '12px', borderRadius: 10, border: 'none',
                  background: '#00509e', color: '#fff', fontWeight: 700,
                  fontSize: 15, cursor: 'pointer',
                }}
              >
                💾 حفظ
              </button>
              <button
                onClick={handleSavePromptCancel}
                style={{
                  flex: 1, padding: '12px', borderRadius: 10,
                  border: '2px solid #ccc', background: '#f0f0f0',
                  color: '#333', fontWeight: 700, fontSize: 15, cursor: 'pointer',
                }}
              >
                ✖ إلغاء
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ✅ نافذة تحذير الخروج المخصصة (3 أزرار) */}
      {exitPromptVisible && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.5)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 20,
          }}
        >
          <div
            style={{
              background: '#fff',
              borderRadius: 16,
              padding: 24,
              maxWidth: 400,
              width: '100%',
              boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
              textAlign: 'center',
            }}
          >
            <div style={{ fontSize: 48, marginBottom: 12 }}>⚠️</div>
            <h3 style={{ margin: '0 0 12px 0', color: '#003366', fontSize: 18 }}>
              لديك تغييرات غير محفوظة
            </h3>
            <p style={{ margin: '0 0 20px 0', color: '#666', fontSize: 14, lineHeight: 1.6 }}>
              هل تريد حفظ التعديلات قبل الخروج من التطبيق؟
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <button
                onClick={handleExitWithSave}
                style={{
                  padding: '12px',
                  borderRadius: 10,
                  border: 'none',
                  background: '#00509e',
                  color: '#fff',
                  fontWeight: 700,
                  fontSize: 15,
                  cursor: 'pointer',
                }}
              >
                💾 حفظ وخروج
              </button>
              <button
                onClick={handleExitWithoutSave}
                style={{
                  padding: '12px',
                  borderRadius: 10,
                  border: 'none',
                  background: '#dc3545',
                  color: '#fff',
                  fontWeight: 700,
                  fontSize: 15,
                  cursor: 'pointer',
                }}
              >
                🚪 خروج بدون حفظ
              </button>
              <button
                onClick={handleCancelExit}
                style={{
                  padding: '12px',
                  borderRadius: 10,
                  border: '2px solid #ccc',
                  background: '#f0f0f0',
                  color: '#333',
                  fontWeight: 700,
                  fontSize: 15,
                  cursor: 'pointer',
                }}
              >
                ✖ إلغاء الخروج
              </button>
            </div>
          </div>
        </div>
      )}
        {/* ✅ نافذة إعدادات السلم المتعدد */}
        {state.showStairDialog && (
          <StairSettingsDialog
              onClose={state.handleCloseStairDialog}
                  onInsertStep={(config) => {
                        state.handleInsertStepMode(config);
                            }}
                                onInsertLanding={(config) => {
                                      state.handleInsertLandingMode(config);
                                          }}
                                            />
                                            )}
                                            {/* ✅ نافذة معاينة الركن المقوس */}
                                            {state.pendingRoundedCorner && (() => {
                                              const wallA = state.walls.find(w => w.id === state.pendingRoundedCorner!.wallAId);
                                                const wallB = state.walls.find(w => w.id === state.pendingRoundedCorner!.wallBId);
                                                  if (!wallA || !wallB) return null;
                                                    const lenA = Math.hypot(wallA.end.x - wallA.start.x, wallA.end.y - wallA.start.y);
                                                      const lenB = Math.hypot(wallB.end.x - wallB.start.x, wallB.end.y - wallB.start.y);
                                                        const maxRadius = Math.min(lenA, lenB) / 2;
                                                          return (
                                                              <RoundedCornerDialog
                                                                    initialRadius={state.pendingRoundedCorner!.radius}
                                                                          maxRadius={maxRadius}
                                                                                onRadiusChange={state.handleUpdatePendingRadius}
                                                                                      onConfirm={state.handleConfirmPendingRoundedCorner}
                                                                                            onCancel={state.handleCancelPendingRoundedCorner}
                                                                                                />
                                                                                                  );
                                                                                                  })()}
                                                  {/* ✅ نافذة المنظور ثلاثي الأبعاد */}
  
                                                        {showView3D && (
                                                            <View3DPanel
                                                                walls={state.walls}
                                                                    windows={state.elements.windows}
                                                                        doors={state.elements.doors}
                                                                            columns={state.elements.columns}
                                                                                stairs={state.stairManager.stairs}
                                                                                    stairElements={state.stairElementManager.stairElements}
                                                                                        floorHeights={state.floorHeights}
                                                                                      maxFloor={state.maxFloor}
                                                                                          settings={state.view3dSettings}
                                                                                              onChange={state.handleUpdate3DSettings}
                                                                                                  onUpdateFloorOverride={state.handleUpdateFloorOverride}
                                                                                                      onClearFloorOverride={state.handleClearFloorOverride}  
                                                                                            onClose={() => setShowView3D(false)}
                                                                                              />
                                                                                              )}
                                                                            
                                                                                                      </div>
                                                                                                        );
                                                                                                        }

const btnStyles = {
  btn: {
    padding: '10px',
    borderRadius: 6,
    border: '1px solid #ccc',
    background: '#f0f0f0',
    cursor: 'pointer',
    fontSize: 14,
    textAlign: 'center' as const,
  },
  btnPrimary: {
    padding: '10px',
    borderRadius: 6,
    border: '1px solid #00509e',
    background: '#00509e',
    color: '#fff',
    cursor: 'pointer',
    fontSize: 14,
  },
  btnDanger: {
    padding: '10px',
    borderRadius: 6,
    border: '1px solid #dc3545',
    background: '#dc3545',
    color: '#fff',
    cursor: 'pointer',
    fontSize: 14,
  },
};
