import React, { useState } from 'react';
import type { Point } from '../../core/types';

interface Props {
  onAdd: (data: { position: Point; width: number; length: number }) => void;
}

const inputStyle: React.CSSProperties = {
  width: '70px', padding: '6px', borderRadius: 4, border: '1px solid #ccc', fontSize: 13, textAlign: 'left', direction: 'ltr'
};

export const ColumnForm: React.FC<Props> = ({ onAdd }) => {
  const [x, setX] = useState(0);
  const [y, setY] = useState(0);
  const [w, setW] = useState(0.4);
  const [l, setL] = useState(0.4);

  const handleInput = (setter: (n: number) => void) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (/^[0-9]*[.,]?[0-9]*$/.test(val)) {
      setter(Number(val.replace(',', '.')));
    }
  };

  return (
    <div style={{ padding: 10, background: '#fafafa', borderRadius: 8, margin: 4 }}>
      <strong>🏛 عمود جديد</strong>
      <div style={{ display: 'flex', gap: 6, marginTop: 6, flexWrap: 'wrap', alignItems: 'center' }}>
        <span>X:</span><input type="text" inputMode="decimal" dir="ltr" pattern="[0-9]*[.,]?[0-9]*" value={String(x)} onChange={handleInput(setX)} style={inputStyle} />
        <span>Y:</span><input type="text" inputMode="decimal" dir="ltr" pattern="[0-9]*[.,]?[0-9]*" value={String(y)} onChange={handleInput(setY)} style={inputStyle} />
        <span>عرض:</span><input type="text" inputMode="decimal" dir="ltr" pattern="[0-9]*[.,]?[0-9]*" value={String(w)} onChange={handleInput(setW)} style={inputStyle} />
        <span>طول:</span><input type="text" inputMode="decimal" dir="ltr" pattern="[0-9]*[.,]?[0-9]*" value={String(l)} onChange={handleInput(setL)} style={inputStyle} />
        <button
          onClick={() => onAdd({ position: { x, y }, width: w, length: l })}
          style={{ padding: '6px 12px', background: '#06f', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer' }}
        >
          إضافة
        </button>
      </div>
    </div>
  );
};
