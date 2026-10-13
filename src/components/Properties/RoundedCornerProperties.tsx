import React, { useState, useEffect } from 'react';
import type { RoundedCorner, Wall } from '../../core/types';

interface Props {
  corner: RoundedCorner;
  walls: Wall[];
  onUpdate: (id: string, radius: number) => void;
  onCommit: () => void;
  onDelete: (id: string) => void;
  onDeselect: () => void;
}

export const RoundedCornerProperties: React.FC<Props> = ({
  corner,
  walls,
  onUpdate,
  onCommit,
  onDelete,
  onDeselect,
}) => {
  const wallA = walls.find(w => w.id === corner.wallAId);
  const wallB = walls.find(w => w.id === corner.wallBId);
  const maxRadius = (() => {
    if (!wallA || !wallB) return 2;
    const lenA = Math.hypot(wallA.end.x - wallA.start.x, wallA.end.y - wallA.start.y);
    const lenB = Math.hypot(wallB.end.x - wallB.start.x, wallB.end.y - wallB.start.y);
    return Math.max(0.1, Math.min(lenA, lenB) / 2);
  })();

  const [inputStr, setInputStr] = useState(corner.radius.toFixed(2));

  useEffect(() => {
    setInputStr(corner.radius.toFixed(2));
  }, [corner.radius]);

  const handleChange = (v: number) => {
    const clamped = Math.max(0.05, Math.min(maxRadius, v));
    onUpdate(corner.id, clamped);
  };

  const handleInputBlur = () => {
    const v = parseFloat(inputStr.replace(',', '.'));
    if (!isNaN(v)) {
      handleChange(v);
    } else {
      setInputStr(corner.radius.toFixed(2));
    }
  };

  return (
    <div
      onPointerDown={e => e.stopPropagation()}
      style={{
        position: 'absolute',
        top: 8,
        right: 8,
        zIndex: 200,
        background: '#fff',
        borderRadius: 12,
        padding: 14,
        boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
        width: 240,
        direction: 'rtl',
        border: '2px solid #ff8800',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
        <span style={{ fontWeight: 700, fontSize: 14, color: '#003366' }}>🔘 الركن المقوس</span>
        <button
          onClick={onDeselect}
          style={{ border: 'none', background: 'none', cursor: 'pointer', fontSize: 16, color: '#999' }}
        >✖</button>
      </div>

      <div style={{ marginBottom: 10 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
          <span style={{ fontSize: 12, fontWeight: 700, color: '#555' }}>القطر</span>
          <span style={{ fontSize: 12, fontWeight: 700, color: '#00509e' }}>{(corner.radius * 100).toFixed(0)} سم</span>
        </div>
        <input
          type="range"
          min={0.05}
          max={maxRadius}
          step={0.01}
          value={corner.radius}
          onChange={e => handleChange(parseFloat(e.target.value))}
          onMouseUp={onCommit}
          onTouchEnd={onCommit}
          style={{ width: '100%' }}
        />
      </div>

      <div style={{ marginBottom: 10 }}>
        <input
          type="text"
          inputMode="decimal"
          dir="ltr"
          value={inputStr}
          onChange={e => setInputStr(e.target.value)}
          onFocus={e => e.target.select()}
          onBlur={handleInputBlur}
          onKeyDown={e => {
            if (e.key === 'Enter') {
              handleInputBlur();
              onCommit();
              (e.target as HTMLInputElement).blur();
            }
          }}
          style={{
            width: '100%',
            padding: 8,
            borderRadius: 6,
            border: '2px solid #00509e',
            fontSize: 14,
            textAlign: 'center',
            boxSizing: 'border-box',
          }}
        />
      </div>

      <button
        onClick={() => onDelete(corner.id)}
        style={{
          width: '100%',
          padding: 10,
          borderRadius: 8,
          border: 'none',
          background: '#e44',
          color: '#fff',
          fontWeight: 700,
          fontSize: 13,
          cursor: 'pointer',
        }}
      >🗑️ حذف الركن</button>
    </div>
  );
};
