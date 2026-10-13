import React, { useState } from 'react';
import type { Axis } from '../../core/types';
import { v4 as uuidv4 } from 'uuid';

interface Props { onClose: () => void; onCreateAxes: (axes: Axis[]) => void; existingAxes: Axis[]; }

const inputStyle: React.CSSProperties = { width: '100%', padding: '6px', borderRadius: 6, border: '1px solid #ccc', fontSize: 14, textAlign: 'center', direction: 'ltr' };

// ✅ دالة تقريب الأرقام لمنع الأعداد العشرية اللانهائية
const formatNum = (n: number): string => {
  if (!isFinite(n)) return '0';
  const rounded = Math.round(n * 100) / 100;
  return String(rounded);
};

export const AxisDialog: React.FC<Props> = ({ onClose, onCreateAxes, existingAxes }) => {
  const vAxes = existingAxes.filter(a => a.type === 'vertical').sort((a, b) => a.position - b.position);
  const hAxes = existingAxes.filter(a => a.type === 'horizontal').sort((a, b) => a.position - b.position);

  const [vLen, setVLen] = useState(vAxes.length > 0 ? formatNum(vAxes[0].length) : '10');
  const [hLen, setHLen] = useState(hAxes.length > 0 ? formatNum(hAxes[0].length) : '10');

  const [vSpacings, setVSpacings] = useState<string[]>(() => {
    if (vAxes.length < 2) return ['3', '3'];
    const sp: string[] = [];
    for (let i = 1; i < vAxes.length; i++) sp.push(formatNum(Math.abs(vAxes[i].position - vAxes[i - 1].position)));
    return sp;
  });

  const [hSpacings, setHSpacings] = useState<string[]>(() => {
    if (hAxes.length < 2) return ['3', '3'];
    const sp: string[] = [];
    for (let i = 1; i < hAxes.length; i++) sp.push(formatNum(Math.abs(hAxes[i].position - hAxes[i - 1].position)));
    return sp;
  });

  const safeParse = (v: string, fb = 0) => { if (v === '' || v === '.' || v === ',') return fb; const n = parseFloat(v.replace(',', '.')); return isNaN(n) ? fb : n; };

  const handleCreate = () => {
    const vl = safeParse(vLen, 10); const hl = safeParse(hLen, 10);
    const vSp = vSpacings.map(s => safeParse(s, 0)).filter(x => x > 0);
    const hSp = hSpacings.map(s => safeParse(s, 0)).filter(x => x > 0);
    const vPos: number[] = [0]; vSp.forEach(s => vPos.push(vPos[vPos.length - 1] + s));
    const hPos: number[] = [0]; hSp.forEach(s => hPos.push(hPos[hPos.length - 1] + s));
    const vc = vPos.reduce((a, b) => a + b, 0) / vPos.length;
    const hc = hPos.reduce((a, b) => a + b, 0) / hPos.length;
    const newAxes: Axis[] = [];
    vPos.forEach((p, i) => newAxes.push({ id: uuidv4(), type: 'vertical', label: String.fromCharCode(65 + i), position: p - vc, center: 0, length: vl, offset: 0 }));
    hPos.forEach((p, i) => newAxes.push({ id: uuidv4(), type: 'horizontal', label: String(i + 1), position: p - hc, center: 0, length: hl, offset: 0 }));
    onCreateAxes(newAxes); onClose();
  };

  const renderColumn = (title: string, len: string, setLen: (s: string) => void, spacings: string[], setSpacings: (s: string[]) => void, type: 'vertical' | 'horizontal') => (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6, minWidth: 240 }}>
      <h4 style={{ margin: 0, color: '#003366' }}>{title}</h4>
      <label style={{ fontSize: 12, fontWeight: 700 }}>طول المحاور (متر):</label>
      <input
        type="text" inputMode="decimal" dir="ltr" value={len}
        onChange={e => setLen(e.target.value)}
        onFocus={(e) => e.target.select()}
        style={inputStyle}
      />
      <label style={{ fontSize: 12, fontWeight: 700, marginTop: 8 }}>المسافات بين المحاور:</label>
      {spacings.map((s, i) => {
        const l1 = type === 'vertical' ? String.fromCharCode(65 + i) : String(i + 1);
        const l2 = type === 'vertical' ? String.fromCharCode(65 + i + 1) : String(i + 2);
        return (
          <div key={i} style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
            <span style={{ fontSize: 12, minWidth: 60 }}>{l1} — {l2}:</span>
            <input
              type="text" inputMode="decimal" dir="ltr" value={s}
              onChange={e => { const c = [...spacings]; c[i] = e.target.value; setSpacings(c); }}
              onFocus={(e) => e.target.select()}
              style={inputStyle}
            />
            <button tabIndex={-1} onClick={() => setSpacings(spacings.filter((_, j) => j !== i))} style={{ padding: '4px 8px', borderRadius: 4, border: 'none', background: '#dc3545', color: '#fff', cursor: 'pointer' }}>✕</button>
          </div>
        );
      })}
      <button tabIndex={-1} onClick={() => setSpacings([...spacings, '3'])} style={{ padding: '6px', borderRadius: 4, border: '1px dashed #06f', background: '#f0f8ff', cursor: 'pointer', fontSize: 13 }}>+ إضافة مسافة</button>
    </div>
  );

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 99999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 10 }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{ background: '#fff', borderRadius: 12, padding: 16, width: '100%', maxWidth: 640, maxHeight: '90vh', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 12 }}>
        <h3 style={{ margin: 0, color: '#003366' }}>📐 المحاور</h3>
        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
          {renderColumn('المحاور الرأسية', vLen, setVLen, vSpacings, setVSpacings, 'vertical')}
          {renderColumn('المحاور الأفقية', hLen, setHLen, hSpacings, setHSpacings, 'horizontal')}
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={handleCreate} style={{ flex: 1, padding: '12px', borderRadius: 8, border: 'none', background: '#00509e', color: '#fff', fontWeight: 700, cursor: 'pointer', fontSize: 15 }}>🖊️ توقيع المحاور على الشبكة</button>
          <button onClick={onClose} style={{ padding: '12px 16px', borderRadius: 8, border: '1px solid #ccc', background: '#f0f0f0', cursor: 'pointer', fontSize: 15 }}>✖ إلغاء</button>
        </div>
      </div>
    </div>
  );
};
