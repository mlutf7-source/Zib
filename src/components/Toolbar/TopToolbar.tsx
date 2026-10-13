import React, { useState } from 'react';
import { DrawToolbar } from './DrawToolbar';
import { LayersPanel } from './LayersPanel';
import type { LayersState } from './LayersPanel';
import type { AppMode, DrawingType, Axis } from '../../core/types';
import { AxisDialog } from '../Axis/AxisDialog';

interface Props {
  mode: AppMode;
  drawingType: DrawingType;
  onStartDrawing: (type: DrawingType) => void;
  onUndo: () => void;
  onRedo: () => void;
  historyLength: number;
  futureLength: number;
  onAddAllDimensions: () => void;
  onModeChange: (mode: AppMode) => void;
  layers: LayersState;
  onToggleLayer: (layer: keyof LayersState) => void;
  onToggleAllLayers: () => void;
  allUnlocked: boolean;
  dimensionFontSize: number;
  onDimensionFontSizeChange: (size: number) => void;
  onAddNorthArrow: () => void;
  onAddAxes: (axes: Axis[]) => void;
  onAddAxesFromWalls: () => void;
  onDeleteAllAxes: () => void;
  axes: Axis[];
  showGrid: boolean;
  onToggleGrid: () => void;
  onDeleteAllDimensions: () => void;
globalTextSize: number;
onGlobalTextSizeChange: (v: number) => void;
globalFontFamily: string;
onGlobalFontFamilyChange: (v: string) => void;
axisBubbleSize: number;
onAxisBubbleSizeChange: (v: number) => void;
  onOpenMultiStairDialog: () => void;
  onSetDoorType: (type: 'regular' | 'main' | 'shop') => void;
  onSetColumnShape: (shape: 'rect' | 'circle') => void;
 // ✅ الخطوط الجديدة
   onStartCurvedWall: () => void;
   onStartDrawingBoundary: () => void;
     onStartDrawingHelperLine: () => void;
         onBuildFenceOnBoundaries: () => void;
               onDeleteAllHelperLines: () => void;
                     // ✅ الأركان المقوسة
                           onStartRoundCornerMode: () => void;
                                
                                       }

const btnBase: React.CSSProperties = {
  padding: '6px 4px',
  borderRadius: 6,
  border: '1px solid #ccc',
  background: '#fff',
  cursor: 'pointer',
  fontSize: 11,
  whiteSpace: 'nowrap',
  textAlign: 'center',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  minWidth: 0,
};

export const TopToolbar: React.FC<Props> = ({
  mode, drawingType, onStartDrawing, onUndo, onRedo,
  historyLength, futureLength, onAddAllDimensions, onModeChange,
  layers, onToggleLayer, onToggleAllLayers, allUnlocked,
  dimensionFontSize, onDimensionFontSizeChange, onAddNorthArrow,
  onAddAxes, onAddAxesFromWalls, onDeleteAllAxes, axes,
  showGrid, onToggleGrid,onDeleteAllDimensions,
globalTextSize, onGlobalTextSizeChange,
globalFontFamily, onGlobalFontFamilyChange,
  axisBubbleSize, onAxisBubbleSizeChange,
    onOpenMultiStairDialog,
    onSetDoorType,
    onSetColumnShape,
      onStartCurvedWall,
      onStartDrawingBoundary,
        onStartDrawingHelperLine,
          onBuildFenceOnBoundaries,
            onDeleteAllHelperLines,
            onStartRoundCornerMode,
            }) => {
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [showAxisDialog, setShowAxisDialog] = useState(false);
  const toggleMenu = (menu: string) => setOpenMenu(prev => (prev === menu ? null : menu));
  const btnStyle = (active: boolean, extra?: React.CSSProperties): React.CSSProperties => ({
    ...btnBase,
    background: active ? '#06f' : '#fff',
    color: active ? '#fff' : '#000',
    ...extra,
  });

  const menuStyle: React.CSSProperties = {
    position: 'absolute',
    top: '100%',
    zIndex: 99999,
    background: '#fff',
    border: '1px solid #ccc',
    borderRadius: 8,
    padding: 6,
    minWidth: 170,
    boxShadow: '0 4px 12px rgba(0,0,0,0.25)',
  };

  const itemStyle: React.CSSProperties = {
    padding: '6px 8px',
    cursor: 'pointer',
    fontSize: 15,
    borderRadius: 4,
  };

  const safeParse = (val: string, fallback: number) => {
    if (val === '' || val === '.' || val === ',') return fallback;
    const num = parseFloat(val.replace(',', '.'));
    return isNaN(num) ? fallback : num;
  };

  return (
    <div
      style={{
        border: '1px solid rgba(192,192,192,0.6)',
        boxShadow: '0 2px 10px rgba(192,192,192,0.25)',
        borderRadius: 12,
        padding: 6,
        background: 'linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)',
        width: '100%',
        boxSizing: 'border-box',
        position: 'relative',
        zIndex: 500,
      }}
    >
      {/* الصف الأول */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6, flexWrap: 'nowrap', width: '100%' }}>
        <div style={{ flex: '0 0 auto' }}>
            <DrawToolbar mode={mode} drawingType={drawingType} onStartDrawing={onStartDrawing} />
              </div>

                {/* ✅ زر رسم خط — مع قائمة منسدلة */}
                  <div style={{ position: 'relative', flex: '0 0 auto' }}>
                      <button
                            onClick={() => toggleMenu('lines')}
                                  style={{
                                          ...btnStyle(
                                                    drawingType === 'land-boundary' ||
                                                              drawingType === 'helper-line',
                                                                        {
                                                                                    background:
                                                                                                  drawingType === 'land-boundary' ||
                                                                                                                drawingType === 'helper-line'
                                                                                                                                ? '#06f'
                                                                                                                                                : '#e8f5e9',
                                                                                                                                                            border: '1px solid #a5d6a7',
                                                                                                                                                                        fontSize: 12,
                                                                                                                                                                                    padding: '8px 10px',
                                                                                                                                                                                              },
                                                                                                                                                                                                      ),
                                                                                                                                                                                                              borderRadius: 8,
                                                                                                                                                                                                                      fontWeight: 700,
                                                                                                                                                                                                                            }}
                                                                                                                                                                                                                                >
                                                                                                                                                                                                                                      📏 رسم خط
                                                                                                                                                                                                                                          </button>
                                                                                                                                                                                                                                              {openMenu === 'lines' && (
                                                                                                                                                                                                                                                    <div style={{ ...menuStyle, right: 0 }}>
                                                                                                                                                                                                                                                            <div onClick={() => { onStartCurvedWall(); setOpenMenu(null); }} style={itemStyle}>
                                                                                                                                                                                                                                                              ↪ رسم جدار منحني
                                                                                                                                                                                                                                                            </div>
                                                                                                                                                                                                                                                            <div
                                                                                                                                                                                                                                                                      onClick={() => {
                                                                                                                                                                                                                                                                                  onStartDrawingBoundary();
                                                                                                                                                                                                                                                                                              setOpenMenu(null);
                                                                                                                                                                                                                                                                                                        }}
                                                                                                                                                                                                                                                                                                                  style={itemStyle}
                                                                                                                                                                                                                                                                                                                          >
                                                                                                                                                                                                                                                                                                                                    🟢 رسم حدود الأرض
                                                                                                                                                                                                                                                                                                                                            </div>
                                                                                                                                                                                                                                                                                                                                                    <div
                                                                                                                                                                                                                                                                                                                                                              onClick={() => {
                                                                                                                                                                                                                                                                                                                                                                          onStartDrawingHelperLine();
                                                                                                                                                                                                                                                                                                                                                                                      setOpenMenu(null);
                                                                                                                                                                                                                                                                                                                                                                                                }}
                                                                                                                                                                                                                                                                                                                                                                                                          style={itemStyle}
                                                                                                                                                                                                                                                                                                                                                                                                                  >
                                                                                                                                                                                                                                                                                                                                                                                                                            🔵 رسم خط مساعد
                                                                                                                                                                                                                                                                                                                                                                                                                                    </div>
                                                                                                                                                                                                                                                                                                                                                                                                                                            <div
                                                                                                                                                                                                                                                                                                                                                                                                                                                      onClick={() => {
                                                                                                                                                                                                                                                                                                                                                                                                                                                                  onBuildFenceOnBoundaries();
                                                                                                                                                                                                                                                                                                                                                                                                                                                                              setOpenMenu(null);
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        }}
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  style={itemStyle}
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          >
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    🧱 رسم سور حدود الأرض
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            </div>
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    <div
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              onClick={() => {
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          if (confirm('حذف جميع الخطوط المساعدة؟')) {
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        onDeleteAllHelperLines();
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    }
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                setOpenMenu(null);
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          }}
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    style={{ ...itemStyle, color: '#dc3545', borderTop: '1px solid #eee', marginTop: 4 }}
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            >
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      🗑️ حذف جميع الخطوط المساعدة
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              </div>
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    </div>
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        )}
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          </div>

                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            <div style={{ flex: '1 1 auto' }} />
        <button
          onClick={onUndo}
          disabled={historyLength === 0}
          style={{
            ...btnStyle(false, {
              opacity: historyLength === 0 ? 0.4 : 1,
              fontSize: 16,
              padding: '8px 12px',
              background: historyLength === 0 ? '#f0f0f0' : '#e6f0ff',
              border: '1px solid #b0c4de',
            }),
            flex: '0 0 auto',
            borderRadius: 8,
          }}
        >↩️</button>
        <button
          onClick={onRedo}
          disabled={futureLength === 0}
          style={{
            ...btnStyle(false, {
              opacity: futureLength === 0 ? 0.4 : 1,
              fontSize: 16,
              padding: '8px 12px',
              background: futureLength === 0 ? '#f0f0f0' : '#e6f0ff',
              border: '1px solid #b0c4de',
            }),
            flex: '0 0 auto',
            borderRadius: 8,
          }}
        >↪️</button>
      </div>

      {/* الصف الثاني */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 4, flexWrap: 'nowrap', width: '100%' }}>
        <div style={{ position: 'relative', flex: '1 1 0', minWidth: 0 }}>
          <button onClick={() => toggleMenu('elements')} style={{ ...btnStyle(false, { background: '#f0f8ff', border: '1px solid #c5d9ed' }), width: '100%' }}>➕ عناصر</button>
          {openMenu === 'elements' && (
            <div style={{ ...menuStyle, right: 0 }}>
              <div onClick={() => { onSetColumnShape('rect'); setOpenMenu(null); }} style={itemStyle}>📌 عمود مستطيل</div>
              <div onClick={() => { onSetColumnShape('circle'); setOpenMenu(null); }} style={itemStyle}>⚫ عمود دائري</div>
              
              <div onClick={() => { onModeChange('window'); setOpenMenu(null); }} style={itemStyle}>🪟 نافذة</div>
              <div onClick={() => { onSetDoorType('regular'); setOpenMenu(null); }} style={itemStyle}>🚪 باب عادي</div>
              <div onClick={() => { onSetDoorType('main'); setOpenMenu(null); }} style={itemStyle}>🚪 باب رئيسي</div>
              <div onClick={() => { onSetDoorType('shop'); setOpenMenu(null); }} style={itemStyle}>🏪 باب محل</div>
            </div>
          )}
        </div>

        <div style={{ position: 'relative', flex: '1 1 0', minWidth: 0 }}>
          <button onClick={() => toggleMenu('details')} style={{ ...btnStyle(false, { background: '#f0f8ff', border: '1px solid #c5d9ed' }), width: '100%' }}>📋 تفاصيل</button>
          {openMenu === 'details' && (
            <div style={{ ...menuStyle, right: 0 }}>
              <div onClick={() => { onAddAllDimensions(); setOpenMenu(null); }} style={itemStyle}>📏 إضافة الأبعاد</div>
              <div onClick={() => { onModeChange('dimension'); setOpenMenu(null); }} style={itemStyle}>📐 بعد يدوي</div>
              <div onClick={() => { onModeChange('text'); setOpenMenu(null); }} style={itemStyle}>📝 نص</div>
              <div style={{ padding: '6px 8px', display: 'flex', alignItems: 'center', gap: 6 }}>
<span style={{ fontSize: 14 }}>حجم الابعاد:</span>                <input
                  type="text"
                  inputMode="decimal"
                  dir="ltr"
                  key={`font-size`}
                  defaultValue={String(dimensionFontSize)}
                  onFocus={e => e.target.select()}
                  onKeyDown={e => { if (e.key === 'Enter') (e.target as HTMLInputElement).blur(); }}
                  onBlur={e => {
                    const num = safeParse(e.target.value, 40);
                    onDimensionFontSizeChange(num);
                    e.target.value = String(num);
                  }}
                  style={{ width: 50, padding: '3px', borderRadius: 4, border: '1px solid #ccc', textAlign: 'left' }}
                />
              </div>
              <div onClick={() => { onAddNorthArrow(); setOpenMenu(null); }} style={itemStyle}>🧭 سهم الشمال</div>
              <div style={{ padding: '6px 8px', display: 'flex', alignItems: 'center', gap: 6 }}>
  <span style={{ fontSize: 14 }}>حجم النصوص:</span>
  <input
    type="text"
    inputMode="decimal"
    dir="ltr"
    key={`text-size-${globalTextSize}`}
    defaultValue={String(globalTextSize)}
    onFocus={e => e.target.select()}
    onKeyDown={e => { if (e.key === 'Enter') (e.target as HTMLInputElement).blur(); }}
    onBlur={e => {
      const num = safeParse(e.target.value, globalTextSize);
      if (num > 0) onGlobalTextSizeChange(num);
      e.target.value = String(num);
    }}
    style={{ width: 60, padding: '3px', borderRadius: 4, border: '1px solid #ccc', textAlign: 'left' }}
  />
</div>

<div style={{ padding: '6px 8px', display: 'flex', flexDirection: 'column', gap: 4 }}>
  <span style={{ fontSize: 14 }}>نوع الخط:</span>
  <select
    value={globalFontFamily}
    onChange={e => onGlobalFontFamilyChange(e.target.value)}
    style={{ padding: '4px', borderRadius: 4, border: '1px solid #ccc', fontSize: 13, fontFamily: 'Cairo, sans-serif' }}
  >
    <option value={'"Traditional Arabic", "Noto Naskh Arabic", serif'}>Traditional Arabic</option>
    <option value={'"Cairo", sans-serif'}>Cairo</option>
    <option value={'"Tajawal", sans-serif'}>Tajawal</option>
    <option value={'"Amiri", serif'}>Amiri</option>
    <option value={'"Arial", sans-serif'}>Arial</option>
    <option value={'"Times New Roman", serif'}>Times New Roman</option>
  </select>
</div>
<div
  onClick={() => { onStartRoundCornerMode(); setOpenMenu(null); }}
    style={itemStyle}
    >
      🔘 أركان مقوسة
      </div>
<div onClick={() => { onDeleteAllDimensions(); setOpenMenu(null); }} style={{ ...itemStyle, color: '#dc3545' }}>
  🗑️ حذف جميع الأبعاد
</div>
              {/* ✅ زر إخفاء/إظهار الشبكة */}
              <div onClick={() => { onToggleGrid(); setOpenMenu(null); }} style={itemStyle}>
                {showGrid ? '🔲 إخفاء الشبكة' : '🔳 إظهار الشبكة'}
              </div>
            </div>
          )}
        </div>

        <div style={{ position: 'relative', flex: '1 1 0', minWidth: 0 }}>
          <button onClick={() => toggleMenu('regions')} style={{ ...btnStyle(false, { background: '#fff8e1', border: '1px solid #f0dca0' }), width: '100%' }}>🎨 مناطق</button>
          {openMenu === 'regions' && (
            <div style={{ ...menuStyle, right: 0 }}>
              <div onClick={() => { onModeChange('kitchen'); setOpenMenu(null); }} style={itemStyle}>🍳 مطبخ</div>
              <div onClick={() => { onModeChange('bathroom'); setOpenMenu(null); }} style={itemStyle}>🛁 حمام</div>
              <div onClick={() => { onModeChange('stair'); setOpenMenu(null); }} style={itemStyle}>🪜 سلم سحبتين</div>
<div onClick={() => { onOpenMultiStairDialog(); setOpenMenu(null); }} style={itemStyle}>🪜 سلم متعدد</div>
            </div>
          )}
        </div>

        <div style={{ position: 'relative', flex: '1 1 0', minWidth: 0 }}>
          <button onClick={() => toggleMenu('axes')} style={{ ...btnStyle(false, { background: '#f0fff0', border: '1px solid #b8e0b8' }), width: '100%' }}>📐 المحاور</button>
          {openMenu === 'axes' && (
            <div style={{ ...menuStyle, right: 0 }}>
              <div onClick={() => { setShowAxisDialog(true); setOpenMenu(null); }} style={itemStyle}>📐 المحاور يدوي</div>
              <div onClick={() => { onAddAxesFromWalls(); setOpenMenu(null); }} style={itemStyle}>🔄 المحاور تلقائي</div>
              <div onClick={() => { onDeleteAllAxes(); setOpenMenu(null); }} style={itemStyle}>🗑️ حذف المحاور</div>
              <div style={{ padding: '6px 8px', display: 'flex', alignItems: 'center', gap: 6, borderTop: '1px solid #eee', marginTop: 4 }}>
  <span style={{ fontSize: 14 }}>حجم الفقاعات:</span>
  <input
    type="text"
    inputMode="decimal"
    dir="ltr"
    key={`bubble-size-${axisBubbleSize}`}
    defaultValue={String(axisBubbleSize)}
    onFocus={e => e.target.select()}
    onKeyDown={e => { if (e.key === 'Enter') (e.target as HTMLInputElement).blur(); }}
    onBlur={e => {
      const num = safeParse(e.target.value, axisBubbleSize);
      const clamped = Math.max(5, Math.min(30, num));
      onAxisBubbleSizeChange(clamped);
      e.target.value = String(clamped);
    }}
    style={{ width: 60, padding: '3px', borderRadius: 4, border: '1px solid #ccc', textAlign: 'left' }}
  />
  <span style={{ fontSize: 11, color: '#888' }}>(5-30)</span>
</div>
            </div>
          )}
        </div>

        <div style={{ flex: '1 1 0', minWidth: 0, position: 'relative' }}>
          <LayersPanel layers={layers} onToggleLayer={onToggleLayer} onToggleAll={onToggleAllLayers} allUnlocked={allUnlocked} />
        </div>
      </div>

      {showAxisDialog && (
        <AxisDialog
          onClose={() => setShowAxisDialog(false)}
          onCreateAxes={(a) => { onAddAxes(a); }}
          existingAxes={axes}
        />
      )}
    </div>
  );
};
