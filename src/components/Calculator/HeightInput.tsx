import React from 'react';

interface Props {
  height: number;
  onChange: (h: number) => void;
}

// دالة تحويل آمنة (لا تعيد NaN أبداً)
const safeParse = (val: string, fallback: number) => {
  if (val === '' || val === '.' || val === ',') return fallback;
  const num = parseFloat(val.replace(',', '.'));
  return isNaN(num) ? fallback : num;
};

export const HeightInput: React.FC<Props> = ({ height, onChange }) => {
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') (e.target as HTMLInputElement).blur();
  };

  const commitEdit = (e: React.FocusEvent<HTMLInputElement>) => {
    const num = safeParse(e.target.value, height);
    onChange(num);
    e.target.value = String(num);
  };

  return (
    <div style={{ padding: 12, background: '#f0f4ff', borderRadius: 8, margin: 8 }}>
      <label style={{ fontWeight: 'bold', display: 'block', marginBottom: 6 }}>🏢 ارتفاع المبنى (متر)</label>
      <input
        type="text"
        inputMode="decimal"
        dir="ltr"
        key="building-height"
        defaultValue={String(height)}
        onFocus={(e) => e.target.select()}
        onKeyDown={handleKeyDown}
        onBlur={commitEdit}
        style={{ width: '100%', padding: '8px 12px', borderRadius: 6, border: '1px solid #ccc', fontSize: 15, textAlign: 'left' }}
      />
    </div>
  );
};
