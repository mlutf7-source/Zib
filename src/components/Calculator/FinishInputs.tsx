import React from 'react';

interface Props {
  floorHeight: number;
  hasMarble: boolean;
  onFloorHeightChange: (value: number) => void;
  onHasMarbleChange: (value: boolean) => void;
  onCalculate: () => void;
}

const cardStyle: React.CSSProperties = {
  background: '#fff',
  border: '1px solid #ddd',
  borderRadius: 12,
  overflow: 'hidden',
  marginBottom: 12,
};

const headStyle: React.CSSProperties = {
  background: '#f8fafc',
  padding: '10px 12px',
  fontWeight: 700,
  color: '#003366',
  fontSize: 14,
  borderBottom: '1px solid #ddd',
};

const bodyStyle: React.CSSProperties = {
  padding: 10,
};

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '8px',
  borderRadius: 8,
  border: '1px solid #ccc',
  fontSize: 14,
  textAlign: 'center',
  direction: 'ltr',
};

const labelStyle: React.CSSProperties = {
  fontSize: 13,
  fontWeight: 700,
  color: '#003366',
  marginBottom: 4,
  display: 'block',
};

const btnStyle: React.CSSProperties = {
  padding: '10px 16px',
  background: '#00509e',
  color: '#fff',
  border: 'none',
  borderRadius: 10,
  fontWeight: 700,
  cursor: 'pointer',
  fontSize: 14,
};

const safeParse = (val: string, fallback: number) => {
  if (val === '' || val === '.' || val === ',') return fallback;
  const num = parseFloat(val.replace(',', '.'));
  return isNaN(num) ? fallback : num;
};

export const FinishInputs: React.FC<Props> = ({
  floorHeight,
  hasMarble,
  onFloorHeightChange,
  onHasMarbleChange,
  onCalculate,
}) => {
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') (e.target as HTMLInputElement).blur();
  };

  const commitEdit = (e: React.FocusEvent<HTMLInputElement>, fallback: number, onChange: (n: number) => void) => {
    const num = safeParse(e.target.value, fallback);
    onChange(num);
    e.target.value = String(num);
  };

  return (
    <div style={cardStyle}>
      <div style={headStyle}>مدخلات التشطيبات</div>
      <div style={bodyStyle}>
        <div style={{ marginBottom: 12 }}>
          <label style={labelStyle}>🏢 ارتفاع الدور (متر)</label>
          <input
            type="text"
            inputMode="decimal"
            dir="ltr"
            key="floor-height"
            defaultValue={String(floorHeight)}
            style={inputStyle}
            onFocus={(e) => e.target.select()}
            onKeyDown={handleKeyDown}
            onBlur={(e) => commitEdit(e, floorHeight, onFloorHeightChange)}
          />
        </div>
        <div style={{ marginBottom: 16 }}>
          <label style={labelStyle}>🏛️ هل يوجد رخام؟</label>
          <div style={{ display: 'flex', gap: 16 }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', fontSize: 14 }}>
              <input type="radio" checked={!hasMarble} onChange={() => onHasMarbleChange(false)} />
              لا يوجد
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', fontSize: 14 }}>
              <input type="radio" checked={hasMarble} onChange={() => onHasMarbleChange(true)} />
              يوجد رخام
            </label>
          </div>
        </div>
        <button onClick={onCalculate} style={btnStyle}>احسب الكميات</button>
      </div>
    </div>
  );
};
