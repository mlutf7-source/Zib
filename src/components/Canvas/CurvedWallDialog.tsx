import React from 'react';

interface Props {
  initialRadius: number;
  minRadius: number;
  onRadiusChange: (radius: number) => void;
  onConfirm: (side: 1 | -1) => void;
  onCancel: () => void;
}

export const CurvedWallDialog: React.FC<Props> = ({
  initialRadius,
  minRadius,
  onRadiusChange,
  onConfirm,
  onCancel,
}) => {
  const [radius, setRadius] = React.useState(initialRadius);
  const [inputStr, setInputStr] = React.useState(initialRadius.toFixed(2));

  React.useEffect(() => {
    setRadius(initialRadius);
    setInputStr(initialRadius.toFixed(2));
  }, [initialRadius]);

  const maxRadius = 50;

  const commitRadius = (v: number) => {
    const clamped = Math.max(minRadius, Math.min(maxRadius, v));
    setRadius(clamped);
    setInputStr(clamped.toFixed(2));
    onRadiusChange(clamped);
  };

  const btnBase: React.CSSProperties = {
    flex: 1,
    padding: 14,
    borderRadius: 10,
    border: 'none',
    fontWeight: 700,
    fontSize: 15,
    cursor: 'pointer',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 4,
  };

  return (
    <>
      <div
        onClick={onCancel}
        style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.5)',
          zIndex: 9999,
        }}
      />
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          background: '#fff',
          borderRadius: 16,
          padding: 24,
          maxWidth: 380,
          width: '90%',
          zIndex: 10000,
          boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
          direction: 'rtl',
        }}
      >
        <h3 style={{ margin: '0 0 8px 0', color: '#003366', fontSize: 17, textAlign: 'center' }}>
          الجدار المنحني
        </h3>
        <p style={{ margin: '0 0 16px 0', color: '#666', fontSize: 13, textAlign: 'center' }}>
          اضبط نصف قطر الجدار ثم اختر جهة الانحناء
        </p>

        <div style={{ marginBottom: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: '#333' }}>نصف القطر</span>
            <span style={{ fontSize: 13, fontWeight: 700, color: '#00509e' }}>
              {radius.toFixed(2)} م
            </span>
          </div>
          <input
            type="range"
            min={minRadius}
            max={maxRadius}
            step={0.05}
            value={radius}
            onChange={(e) => commitRadius(parseFloat(e.target.value))}
            style={{ width: '100%' }}
          />
        </div>

        <div style={{ marginBottom: 20 }}>
          <label style={{ fontSize: 13, fontWeight: 700, color: '#333', display: 'block', marginBottom: 6 }}>
            أو أدخل القيمة يدوياً (م)
          </label>
          <input
            type="text"
            inputMode="decimal"
            dir="ltr"
            value={inputStr}
            onChange={(e) => setInputStr(e.target.value)}
            onFocus={(e) => e.target.select()}
            onBlur={() => {
              const v = parseFloat(inputStr.replace(',', '.'));
              if (!isNaN(v)) commitRadius(v);
              else setInputStr(radius.toFixed(2));
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') (e.target as HTMLInputElement).blur();
            }}
            style={{
              width: '100%',
              padding: 10,
              borderRadius: 8,
              border: '2px solid #00509e',
              fontSize: 15,
              textAlign: 'center',
              boxSizing: 'border-box',
            }}
          />
        </div>

        <div style={{ marginBottom: 12 }}>
          <label style={{ fontSize: 13, fontWeight: 700, color: '#333', display: 'block', marginBottom: 8, textAlign: 'center' }}>
            جهة الانحناء
          </label>
          <div style={{ display: 'flex', gap: 10 }}>
            <button
              onClick={() => onConfirm(1)}
              style={{ ...btnBase, background: '#00509e', color: '#fff' }}
            >
              <span style={{ fontSize: 22 }}>↺</span>
              انحناء لليمين
            </button>
            <button
              onClick={() => onConfirm(-1)}
              style={{ ...btnBase, background: '#00509e', color: '#fff' }}
            >
              <span style={{ fontSize: 22 }}>↻</span>
              انحناء لليسار
            </button>
          </div>
        </div>

        <button
          onClick={onCancel}
          style={{
            width: '100%',
            padding: 12,
            borderRadius: 10,
            border: '2px solid #ccc',
            background: '#f0f0f0',
            color: '#333',
            fontWeight: 700,
            fontSize: 15,
            cursor: 'pointer',
          }}
        >
          إلغاء
        </button>
      </div>
    </>
  );
};
