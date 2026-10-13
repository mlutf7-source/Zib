import React from 'react';

interface Props {
  excavationDepth: number;
  backfillDepth: number;
  plinthHeight: number;
  onExcavationDepthChange: (value: number) => void;
  onBackfillDepthChange: (value: number) => void;
  onPlinthHeightChange: (value: number) => void;
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

const fieldStyle: React.CSSProperties = {
  flex: 1,
  minWidth: 120,
};

// دالة تحويل آمنة (لا تعيد NaN أبداً)
const safeParse = (val: string, fallback: number) => {
  if (val === '' || val === '.' || val === ',') return fallback;
  const num = parseFloat(val.replace(',', '.'));
  return isNaN(num) ? fallback : num;
};

export const PreliminaryInputs: React.FC<Props> = ({
  excavationDepth,
  backfillDepth,
  plinthHeight,
  onExcavationDepthChange,
  onBackfillDepthChange,
  onPlinthHeightChange,
  onCalculate,
}) => {
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') (e.target as HTMLInputElement).blur();
  };

  // دالة الحفظ عند مغادرة الحقل
  const commitEdit = (e: React.FocusEvent<HTMLInputElement>, fallback: number, onChange: (n: number) => void) => {
    const num = safeParse(e.target.value, fallback);
    onChange(num);
    e.target.value = String(num);
  };

  return (
    <div style={cardStyle}>
      <div style={headStyle}>مدخلات التمهيدية</div>
      <div style={bodyStyle}>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 16 }}>
          <div style={fieldStyle}>
            <label style={labelStyle}>⛏️ عمق الحفر (متر)</label>
            <input
              type="text"
              inputMode="decimal"
              dir="ltr"
              key="excavation-depth"
              defaultValue={String(excavationDepth)}
              style={inputStyle}
              onFocus={(e) => e.target.select()}
              onKeyDown={handleKeyDown}
              onBlur={(e) => commitEdit(e, excavationDepth, onExcavationDepthChange)}
            />
          </div>
          <div style={fieldStyle}>
            <label style={labelStyle}>🪨 عمق الدفان (متر)</label>
            <input
              type="text"
              inputMode="decimal"
              dir="ltr"
              key="backfill-depth"
              defaultValue={String(backfillDepth)}
              style={inputStyle}
              onFocus={(e) => e.target.select()}
              onKeyDown={handleKeyDown}
              onBlur={(e) => commitEdit(e, backfillDepth, onBackfillDepthChange)}
            />
          </div>
          <div style={fieldStyle}>
            <label style={labelStyle}>🧱 ارتفاع الكرسي (متر)</label>
            <input
              type="text"
              inputMode="decimal"
              dir="ltr"
              key="plinth-height"
              defaultValue={String(plinthHeight)}
              style={inputStyle}
              onFocus={(e) => e.target.select()}
              onKeyDown={handleKeyDown}
              onBlur={(e) => commitEdit(e, plinthHeight, onPlinthHeightChange)}
            />
          </div>
        </div>
        <button onClick={onCalculate} style={btnStyle}>احسب الكميات التمهيدية</button>
      </div>
    </div>
  );
};
