import React from 'react';
import type { Column, Window, Door, Wall } from '../../core/types';

interface Props {
  selected: { id: string; type: 'column' | 'window' | 'door' } | null;
  columns: Column[];
  windows: Window[];
  doors: Door[];
  walls: Wall[];
  updateColumn: (id: string, patch: Partial<Column>) => void;
  updateWindow: (id: string, patch: Partial<Window>) => void;
  updateDoor: (id: string, patch: Partial<Door>) => void;
}

const inputStyle: React.CSSProperties = {
  width: '70px',
  padding: '6px 8px',
  borderRadius: 6,
  border: '1px solid #ccc',
  fontSize: 14,
  textAlign: 'center',
  direction: 'ltr',
};

const labelStyle: React.CSSProperties = {
  fontWeight: 700,
  fontSize: 13,
  color: '#003366',
};

const buttonStyle: React.CSSProperties = {
  padding: '6px 12px',
  borderRadius: 6,
  border: 'none',
  color: '#fff',
  cursor: 'pointer',
  fontWeight: 700,
  fontSize: 13,
};

// دالة تحويل آمنة (لا تعيد NaN أبداً)
const safeParse = (val: string, fallback: number) => {
  if (val === '' || val === '.' || val === ',') return fallback;
  const num = parseFloat(val.replace(',', '.'));
  return isNaN(num) ? fallback : num;
};

export const ElementProperties: React.FC<Props> = ({ selected, columns, windows, doors, walls, updateColumn, updateWindow, updateDoor }) => {
  if (!selected) return null;

  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => e.target.select();
  
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') (e.target as HTMLInputElement).blur();
  };

  // دالة مساعدة للحفظ عند مغادرة الحقل أو الضغط على Enter
  const commitEdit = (e: React.FocusEvent<HTMLInputElement>, fallback: number, update: (n: number) => void) => {
    const val = e.target.value;
    const num = safeParse(val, fallback);
    update(num);
    // إعادة تعيين القيمة للحقل لعرض الرقم الصحيح إذا كان المدخل غير صالح
    e.target.value = String(num);
  };

  if (selected.type === 'column') {
      const col = columns.find(c => c.id === selected.id);
        if (!col) return null;

          // ✅ العمود الدائري: قطر فقط
            if (col.columnShape === 'circle') {
                return (
                      <div style={{ display: 'flex', gap: '12px', alignItems: 'center', padding: '8px 12px', background: '#f8f8f8', borderRadius: 8, margin: 8, flexWrap: 'wrap' }}>
                              <span style={{ fontWeight: 700, color: '#003366' }}>⚫</span>
                                      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                                                <span style={labelStyle}>القطر (م):</span>
                                                          <input
                                                                      type="text"
                                                                                  inputMode="decimal"
                                                                                              dir="ltr"
                                                                                                          key={`${col.id}-d`}
                                                                                                                      defaultValue={String(col.width)}
                                                                                                                                  style={inputStyle}
                                                                                                                                              onFocus={handleFocus}
                                                                                                                                                          onKeyDown={handleKeyDown}
                                                                                                                                                                      onBlur={(e) => commitEdit(e, col.width, (n) => {
                                                                                                                                                                                    if (n > 0) updateColumn(col.id, { width: n, length: n });
                                                                                                                                                                                                })}
                                                                                                                                                                                                          />
                                                                                                                                                                                                                  </div>
                                                                                                                                                                                                                        </div>
                                                                                                                                                                                                                            );
                                                                                                                                                                                                                              }

                                                                                                                                                                                                                                return (
  
      <div style={{ display: 'flex', gap: '12px', alignItems: 'center', padding: '8px 12px', background: '#f8f8f8', borderRadius: 8, margin: 8, flexWrap: 'wrap' }}>
        <span style={{ fontWeight: 700, color: '#003366' }}>📌</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <span style={labelStyle}>العرض (م):</span>
          <input 
            type="text" 
            inputMode="decimal" 
            dir="ltr" 
            key={`${col.id}-w`} 
            defaultValue={String(col.width)} 
            style={inputStyle} 
            onFocus={handleFocus} 
            onKeyDown={handleKeyDown} 
            onBlur={(e) => commitEdit(e, col.width, (n) => updateColumn(col.id, { width: n }))} 
          />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <span style={labelStyle}>الطول (م):</span>
          <input 
            type="text" 
            inputMode="decimal" 
            dir="ltr" 
            key={`${col.id}-l`} 
            defaultValue={String(col.length)} 
            style={inputStyle} 
            onFocus={handleFocus} 
            onKeyDown={handleKeyDown} 
            onBlur={(e) => commitEdit(e, col.length, (n) => updateColumn(col.id, { length: n }))} 
          />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <span style={labelStyle}>الدوران (°):</span>
          <input 
            type="text" 
            inputMode="decimal" 
            dir="ltr" 
            key={`${col.id}-r`} 
            defaultValue={String((col.rotation || 0) * 180 / Math.PI)} 
            style={inputStyle} 
            onFocus={handleFocus} 
            onKeyDown={handleKeyDown} 
            onBlur={(e) => commitEdit(e, (col.rotation || 0) * 180 / Math.PI, (n) => updateColumn(col.id, { rotation: (n * Math.PI) / 180 }))} 
          />
        </div>
      </div>
    );
  }

  if (selected.type === 'window') {
    const win = windows.find(w => w.id === selected.id);
    if (!win) return null;
    return (
      <div style={{ display: 'flex', gap: '12px', alignItems: 'center', padding: '8px 12px', background: '#f8f8f8', borderRadius: 8, margin: 8, flexWrap: 'wrap' }}>
        <span style={{ fontWeight: 700, color: '#003366' }}>🪟</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <span style={labelStyle}>العرض (م):</span>
          <input 
            type="text" 
            inputMode="decimal" 
            dir="ltr" 
            key={`${win.id}-w`} 
            defaultValue={String(win.width)} 
            style={inputStyle} 
            onFocus={handleFocus} 
            onKeyDown={handleKeyDown} 
            onBlur={(e) => commitEdit(e, win.width, (n) => updateWindow(win.id, { width: n }))} 
          />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <span style={labelStyle}>الارتفاع (م):</span>
          <input 
            type="text" 
            inputMode="decimal" 
            dir="ltr" 
            key={`${win.id}-h`} 
            defaultValue={String(win.height)} 
            style={inputStyle} 
            onFocus={handleFocus} 
            onKeyDown={handleKeyDown} 
            onBlur={(e) => commitEdit(e, win.height, (n) => updateWindow(win.id, { height: n }))} 
          />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <span style={labelStyle}>السماكة (م):</span>
          <input 
            type="text" 
            inputMode="decimal" 
            dir="ltr" 
            key={`${win.id}-t`} 
            defaultValue={String(win.thickness)} 
            style={inputStyle} 
            onFocus={handleFocus} 
            onKeyDown={handleKeyDown} 
            onBlur={(e) => commitEdit(e, win.thickness, (n) => updateWindow(win.id, { thickness: n }))} 
          />
        </div>
      </div>
    );
  }

  if (selected.type === 'door') {
    const door = doors.find(d => d.id === selected.id);
    if (!door) return null;
    return (
      <div style={{ display: 'flex', gap: '12px', alignItems: 'center', padding: '8px 12px', background: '#f8f8f8', borderRadius: 8, margin: 8, flexWrap: 'wrap' }}>
        <span style={{ fontWeight: 700, color: '#003366' }}>🚪</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <span style={labelStyle}>العرض (م):</span>
          <input 
            type="text" 
            inputMode="decimal" 
            dir="ltr" 
            key={`${door.id}-w`} 
            defaultValue={String(door.width)} 
            style={inputStyle} 
            onFocus={handleFocus} 
            onKeyDown={handleKeyDown} 
            onBlur={(e) => commitEdit(e, door.width, (n) => updateDoor(door.id, { width: n }))} 
          />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <span style={labelStyle}>الارتفاع (م):</span>
          <input 
            type="text" 
            inputMode="decimal" 
            dir="ltr" 
            key={`${door.id}-h`} 
            defaultValue={String(door.height)} 
            style={inputStyle} 
            onFocus={handleFocus} 
            onKeyDown={handleKeyDown} 
            onBlur={(e) => commitEdit(e, door.height, (n) => updateDoor(door.id, { height: n }))} 
          />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <span style={labelStyle}>السماكة (م):</span>
          <input 
            type="text" 
            inputMode="decimal" 
            dir="ltr" 
            key={`${door.id}-t`} 
            defaultValue={String(door.thickness)} 
            style={inputStyle} 
            onFocus={handleFocus} 
            onKeyDown={handleKeyDown} 
            onBlur={(e) => commitEdit(e, door.thickness, (n) => updateDoor(door.id, { thickness: n }))} 
          />
        </div>
        <button onClick={() => updateDoor(door.id, { swing: door.swing === 1 ? -1 : 1 })} style={{ ...buttonStyle, background: '#06f' }}>
          🔄 انعكاس
        </button>
      </div>
    );
  }

  return null;
};
