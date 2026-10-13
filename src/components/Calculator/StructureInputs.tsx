import React from 'react';

interface Props {
  designFloors: number;
  buildFloors: number;
  onDesignFloorsChange: (value: number) => void;
  onBuildFloorsChange: (value: number) => void;
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

export const StructureInputs: React.FC<Props> = ({
  designFloors,
  buildFloors,
  onDesignFloorsChange,
  onBuildFloorsChange,
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
      <div style={headStyle}>مدخلات الهيكل</div>
      <div style={bodyStyle}>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 16 }}>
          <div style={fieldStyle}>
            <label style={labelStyle}>🏗️ عدد أدوار تصميم الأساسات</label>
            <input
              type="text"
              inputMode="decimal"
              dir="ltr"
              key={`design-floors`}
              defaultValue={String(designFloors)}
              style={inputStyle}
              onFocus={(e) => e.target.select()}
              onKeyDown={handleKeyDown}
              onBlur={(e) => commitEdit(e, designFloors, onDesignFloorsChange)}
            />
          </div>
          <div style={fieldStyle}>
            <label style={labelStyle}>🏢 عدد الأدوار المراد بناؤها</label>
            <input
              type="text"
              inputMode="decimal"
              dir="ltr"
              key={`build-floors`}
              defaultValue={String(buildFloors)}
              style={inputStyle}
              onFocus={(e) => e.target.select()}
              onKeyDown={handleKeyDown}
              onBlur={(e) => commitEdit(e, buildFloors, onBuildFloorsChange)}
            />
          </div>
        </div>
        <button onClick={onCalculate} style={btnStyle}>احسب كميات الهيكل</button>
      </div>
    </div>
  );
};
