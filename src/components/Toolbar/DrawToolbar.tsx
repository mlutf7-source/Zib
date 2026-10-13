import React from 'react';
import type { AppMode, DrawingType } from '../../core/types';

interface Props {
  mode: AppMode;
  drawingType: DrawingType;
  onStartDrawing: (type: DrawingType) => void;
}

const btnStyle: React.CSSProperties = {
  padding: '8px 10px',
  margin: 0,
  border: '2px solid #ccc',
  borderRadius: 6,
  background: '#fff',
  fontSize: 12,
  cursor: 'pointer',
  fontWeight: 'bold',
  whiteSpace: 'nowrap',
};

const activeStyle: React.CSSProperties = {
  ...btnStyle,
  borderColor: '#06f',
  background: '#e6f0ff',
};

export const DrawToolbar: React.FC<Props> = ({ mode, drawingType, onStartDrawing }) => {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 4, flexWrap: 'nowrap' }}>
      <button
        style={drawingType === 'exterior' && mode === 'drawing' ? activeStyle : btnStyle}
        onClick={() => onStartDrawing('exterior')}
      >
        🧱 رسم خارجي
      </button>
      <button
        style={drawingType === 'interior' && mode === 'drawing' ? activeStyle : btnStyle}
        onClick={() => onStartDrawing('interior')}
      >
        🏠 رسم داخلي
      </button>
    </div>
  );
};
