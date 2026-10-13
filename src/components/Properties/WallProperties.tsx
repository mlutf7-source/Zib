import React, { useState, useEffect } from 'react';
import type { Wall } from '../../core/types';
import { distance } from '../../core/geometry';

interface Props {
  wall: Wall | null;
  onChangeLength: (len: number) => void;
  onChangeThickness: (t: number) => void;
  onChangeRadius: (radius: number) => void;
}

const inputStyle: React.CSSProperties = {
  width: '100%',
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

export const WallProperties: React.FC<Props> = ({ wall, onChangeLength, onChangeThickness, onChangeRadius }) => {
  const [lengthStr, setLengthStr] = useState('');
  const [thicknessStr, setThicknessStr] = useState('');
  const [radiusStr, setRadiusStr] = useState('');

  useEffect(() => {
    if (wall) {
      setLengthStr(distance(wall.start, wall.end).toFixed(2));
      setThicknessStr(String(wall.thickness));
      setRadiusStr(wall.curveRadius ? String(wall.curveRadius) : '');
    }
  }, [wall]);

  if (!wall) return null;

  const handleNumericChange = (e: React.ChangeEvent<HTMLInputElement>, setter: React.Dispatch<React.SetStateAction<string>>) => {
    const val = e.target.value;
    if (/^[0-9]*[.,]?[0-9]*$/.test(val)) {
      setter(val);
    }
  };

  const commitLength = () => {
    const v = parseFloat(lengthStr.replace(',', '.'));
    if (v > 0) onChangeLength(v);
    else setLengthStr(distance(wall.start, wall.end).toFixed(2));
  };

  const commitRadius = () => {
    const v = parseFloat(radiusStr.replace(',', '.'));
    if (wall.curveRadius && v > distance(wall.start, wall.end) / 2) onChangeRadius(v);
    else if (wall.curveRadius) setRadiusStr(String(wall.curveRadius));
  };

  const commitThickness = () => {
    const v = parseFloat(thicknessStr.replace(',', '.'));
    if (v > 0 && v <= 1) onChangeThickness(v);
    else setThicknessStr(String(wall.thickness));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, commit: () => void) => {
    if (e.key === 'Enter') {
      commit();
      (e.target as HTMLInputElement).blur();
    }
  };

  return (
    <div style={{ display: 'flex', gap: '12px', alignItems: 'center', padding: '8px 12px', background: '#f8f8f8', borderRadius: 8, margin: 8 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 4, flex: 1 }}>
        <span style={labelStyle}>الطول (م):</span>
        <input
          type="text"
          inputMode="decimal"
          dir="ltr"
          pattern="[0-9]*[.,]?[0-9]*"
          value={lengthStr}
          style={inputStyle}
          onFocus={(e) => e.target.select()}
          onChange={(e) => handleNumericChange(e, setLengthStr)}
          onBlur={commitLength}
          onKeyDown={e => handleKeyDown(e, commitLength)}
        />
      </div>
      {wall.curveRadius && <div style={{ display: 'flex', alignItems: 'center', gap: 4, flex: 1 }}>
        <span style={labelStyle}>نصف القطر (م):</span>
        <input type="text" inputMode="decimal" dir="ltr" value={radiusStr} style={inputStyle} onFocus={(e) => e.target.select()} onChange={(e) => handleNumericChange(e, setRadiusStr)} onBlur={commitRadius} onKeyDown={e => handleKeyDown(e, commitRadius)} />
      </div>}
      <div style={{ display: 'flex', alignItems: 'center', gap: 4, flex: 1 }}>
        <span style={labelStyle}>السماكة (م):</span>
        <input
          type="text"
          inputMode="decimal"
          dir="ltr"
          pattern="[0-9]*[.,]?[0-9]*"
          value={thicknessStr}
          style={inputStyle}
          onFocus={(e) => e.target.select()}
          onChange={(e) => handleNumericChange(e, setThicknessStr)}
          onBlur={commitThickness}
          onKeyDown={e => handleKeyDown(e, commitThickness)}
        />
      </div>
    </div>
  );
};
