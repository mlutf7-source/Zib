// WindowForm.tsx
import React, { useState } from 'react';
import type { Wall } from '../../core/types';

interface Props {
  walls: Wall[];
  onAdd: (data: { wallId: string; position: number; width: number; height: number }) => void;
}

const inputStyle: React.CSSProperties = {
  width: '65px', padding: '6px', borderRadius: 4, border: '1px solid #ccc', fontSize: 13, textAlign: 'left', direction: 'ltr'
};

export const WindowForm: React.FC<Props> = ({ walls, onAdd }) => {
  const [wallId, setWallId] = useState(walls[0]?.id ?? '');
  const [pos, setPos] = useState('0');
  const [w, setW] = useState('1.2');
  const [h, setH] = useState('1.5');

  // ✅ السماح بكتابة أي شيء (أرقام، نقطة، فاصلة) بحرية تامة
  const handleChange = (setter: React.Dispatch<React.SetStateAction<string>>) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setter(e.target.value);
  };

  // ✅ تنظيف القيمة وتحويلها لرقم فقط عند الضغط على "إضافة"
  const handleAdd = () => {
    onAdd({
      wallId,
      position: parseFloat(pos.replace(',', '.')) || 0,
      width: parseFloat(w.replace(',', '.')) || 1.2,
      height: parseFloat(h.replace(',', '.')) || 1.5
    });
  };

  return (
    <div style={{ padding: 10, background: '#fafafa', borderRadius: 8, margin: 4 }}>
      <strong>🪟 نافذة جديدة</strong>
      <div style={{ display: 'flex', gap: 6, marginTop: 6, flexWrap: 'wrap', alignItems: 'center' }}>
        <select value={wallId} onChange={e => setWallId(e.target.value)} style={{ padding: 6, borderRadius: 4 }}>
          {walls.map(w => <option key={w.id} value={w.id}>جدار {w.type === 'exterior' ? 'خارجي' : 'داخلي'}</option>)}
        </select>
        <span>موقع:</span><input type="text" inputMode="decimal" dir="ltr" value={pos} onChange={handleChange(setPos)} style={inputStyle} />
        <span>عرض:</span><input type="text" inputMode="decimal" dir="ltr" value={w} onChange={handleChange(setW)} style={inputStyle} />
        <span>ارتفاع:</span><input type="text" inputMode="decimal" dir="ltr" value={h} onChange={handleChange(setH)} style={inputStyle} />
        <button onClick={handleAdd} style={{ padding: '6px 12px', background: '#06f', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer' }}>إضافة</button>
      </div>
    </div>
  );
};
