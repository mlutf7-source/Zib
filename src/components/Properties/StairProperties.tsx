import React, { useState, useEffect } from 'react';
import type { Stair } from '../../core/types';

interface Props {
  stair: Stair | null;
  onChangeWidth: (width: number) => void;
  onChangeTotalLength: (length: number) => void;
  onChangeLandingLength: (length: number) => void;
  onChangeTreadDepth: (depth: number) => void;
  onChangeRiserHeight: (height: number) => void;
  onRotate: () => void;
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

export const StairProperties: React.FC<Props> = ({
  stair,
  onChangeWidth,
  onChangeTotalLength,
  onChangeLandingLength,
  onChangeTreadDepth,
  onChangeRiserHeight,
  onRotate,
}) => {
  const [widthStr, setWidthStr] = useState('');
  const [totalLengthStr, setTotalLengthStr] = useState('');
  const [landingStr, setLandingStr] = useState('');
  const [treadStr, setTreadStr] = useState('');
  const [riserStr, setRiserStr] = useState('');

  useEffect(() => {
    if (stair) {
      setWidthStr(stair.width.toFixed(2));
      setTotalLengthStr(stair.totalLength.toFixed(2));
      setLandingStr(stair.landingLength.toFixed(2));
      setTreadStr(stair.treadDepth.toFixed(2));
      setRiserStr(stair.riserHeight.toFixed(2));
    }
  }, [stair]);

  if (!stair) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>, setter: (v: string) => void) => {
    const val = e.target.value;
    // السماح فقط بالأرقام والنقطة أو الفاصلة العشرية
    if (/^[0-9]*[.,]?[0-9]*$/.test(val)) {
      setter(val);
    }
  };

  const commit = (value: string, setter: (v: string) => void, original: string, onChange: (v: number) => void) => {
    const v = parseFloat(value.replace(',', '.'));
    if (v > 0) onChange(v);
    else setter(original);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, commitFn: () => void) => {
    if (e.key === 'Enter') {
      commitFn();
      (e.target as HTMLInputElement).blur();
    }
  };

  return (
    <div style={{ display: 'flex', gap: 10, alignItems: 'center', padding: '8px 12px', background: '#f8f8f8', borderRadius: 8, margin: 8, flexWrap: 'wrap' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
        <span style={labelStyle}>العرض (م):</span>
        <input
          type="text"
          inputMode="decimal"
          dir="ltr"
          pattern="[0-9]*[.,]?[0-9]*"
          value={widthStr}
          style={inputStyle}
          onFocus={(e) => e.target.select()}
          onChange={e => handleChange(e, setWidthStr)}
          onBlur={() => commit(widthStr, setWidthStr, stair.width.toFixed(2), onChangeWidth)}
          onKeyDown={e => handleKeyDown(e, () => commit(widthStr, setWidthStr, stair.width.toFixed(2), onChangeWidth))}
        />
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
        <span style={labelStyle}>الطول الكلي (م):</span>
        <input
          type="text"
          inputMode="decimal"
          dir="ltr"
          pattern="[0-9]*[.,]?[0-9]*"
          value={totalLengthStr}
          style={inputStyle}
          onFocus={(e) => e.target.select()}
          onChange={e => handleChange(e, setTotalLengthStr)}
          onBlur={() => commit(totalLengthStr, setTotalLengthStr, stair.totalLength.toFixed(2), onChangeTotalLength)}
          onKeyDown={e => handleKeyDown(e, () => commit(totalLengthStr, setTotalLengthStr, stair.totalLength.toFixed(2), onChangeTotalLength))}
        />
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
        <span style={labelStyle}>البسطة (م):</span>
        <input
          type="text"
          inputMode="decimal"
          dir="ltr"
          pattern="[0-9]*[.,]?[0-9]*"
          value={landingStr}
          style={inputStyle}
          onFocus={(e) => e.target.select()}
          onChange={e => handleChange(e, setLandingStr)}
          onBlur={() => commit(landingStr, setLandingStr, stair.landingLength.toFixed(2), onChangeLandingLength)}
          onKeyDown={e => handleKeyDown(e, () => commit(landingStr, setLandingStr, stair.landingLength.toFixed(2), onChangeLandingLength))}
        />
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
        <span style={labelStyle}>عمق الدرجة (م):</span>
        <input
          type="text"
          inputMode="decimal"
          dir="ltr"
          pattern="[0-9]*[.,]?[0-9]*"
          value={treadStr}
          style={inputStyle}
          onFocus={(e) => e.target.select()}
          onChange={e => handleChange(e, setTreadStr)}
          onBlur={() => commit(treadStr, setTreadStr, stair.treadDepth.toFixed(2), onChangeTreadDepth)}
          onKeyDown={e => handleKeyDown(e, () => commit(treadStr, setTreadStr, stair.treadDepth.toFixed(2), onChangeTreadDepth))}
        />
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
        <span style={labelStyle}>ارتفاع الدرجة (م):</span>
        <input
          type="text"
          inputMode="decimal"
          dir="ltr"
          pattern="[0-9]*[.,]?[0-9]*"
          value={riserStr}
          style={inputStyle}
          onFocus={(e) => e.target.select()}
          onChange={e => handleChange(e, setRiserStr)}
          onBlur={() => commit(riserStr, setRiserStr, stair.riserHeight.toFixed(2), onChangeRiserHeight)}
          onKeyDown={e => handleKeyDown(e, () => commit(riserStr, setRiserStr, stair.riserHeight.toFixed(2), onChangeRiserHeight))}
        />
      </div>
      <button
        onClick={onRotate}
        style={{ padding: '6px 12px', background: '#f80', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', fontWeight: 700 }}
      >
        🔄 تدوير 90°
      </button>
    </div>
  );
};
