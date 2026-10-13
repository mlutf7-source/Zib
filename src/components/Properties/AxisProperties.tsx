import React, { useState, useEffect } from 'react';
import type { Axis } from '../../core/types';

interface Props { axis: Axis | null; onChangeLength: (len: number) => void; onChangeOffset: (off: number) => void; }
const inputStyle: React.CSSProperties = { width: '80px', padding: '6px 8px', borderRadius: 6, border: '1px solid #ccc', fontSize: 14, textAlign: 'center', direction: 'ltr' };
const labelStyle: React.CSSProperties = { fontWeight: 700, fontSize: 13, color: '#003366' };

export const AxisProperties: React.FC<Props> = ({ axis, onChangeLength, onChangeOffset }) => {
  const [lenStr, setLenStr] = useState('');
  const [offStr, setOffStr] = useState('');
  useEffect(() => { if (axis) { setLenStr(axis.length.toFixed(2)); setOffStr(axis.offset.toFixed(2)); } }, [axis]);
  if (!axis) return null;
  const commit = (val: string, fallback: number, onChange: (n: number) => void, setter: (s: string) => void) => {
    if (val === '' || val === '.' || val === ',') { setter(String(fallback)); return; }
    const n = parseFloat(val.replace(',', '.'));
    if (isNaN(n)) { setter(String(fallback)); return; }
    onChange(n); setter(String(n));
  };
  const offsetLabel = axis.type === 'vertical' ? 'الإزاحة يمين (+)/يسار (-):' : 'الإزاحة أعلى (+)/أسفل (-):';
  return (
    <div style={{ display: 'flex', gap: 12, alignItems: 'center', padding: '8px 12px', background: '#f8f8f8', borderRadius: 8, margin: 8, flexWrap: 'wrap' }}>
      <span style={{ fontWeight: 700, color: '#003366' }}>📐 {axis.label}</span>
      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
        <span style={labelStyle}>الطول (م):</span>
        <input type="text" inputMode="decimal" dir="ltr" value={lenStr} style={inputStyle}
          onFocus={e => e.target.select()} onChange={e => setLenStr(e.target.value)}
          onBlur={() => commit(lenStr, axis.length, onChangeLength, setLenStr)}
          onKeyDown={e => { if (e.key === 'Enter') (e.target as HTMLInputElement).blur(); }} />
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
        <span style={labelStyle}>{offsetLabel}</span>
        <input type="text" inputMode="decimal" dir="ltr" value={offStr} style={inputStyle}
          onFocus={e => e.target.select()} onChange={e => setOffStr(e.target.value)}
          onBlur={() => commit(offStr, axis.offset, onChangeOffset, setOffStr)}
          onKeyDown={e => { if (e.key === 'Enter') (e.target as HTMLInputElement).blur(); }} />
      </div>
    </div>
  );
};
