import React from 'react';
import type { FinishResults } from '../../../core/finishCalculations';

interface Props {
  results: FinishResults;
  hasMarble: boolean;
  onMarbleAreaChange?: (value: number) => void;
}

const cardStyle: React.CSSProperties = { background: '#fff', border: '1px solid #ddd', borderRadius: 12, overflow: 'hidden', marginBottom: 12 };
const headStyle: React.CSSProperties = { background: '#f8fafc', padding: '10px 12px', fontWeight: 700, color: '#003366', fontSize: 14, borderBottom: '1px solid #ddd' };
const bodyStyle: React.CSSProperties = { padding: 10 };
const tableStyle: React.CSSProperties = { width: '100%', borderCollapse: 'collapse', fontSize: 12 };
const thStyle: React.CSSProperties = { background: '#003366', color: 'white', padding: '8px 6px', border: '1px solid #003366', textAlign: 'center' };
const tdStyle: React.CSSProperties = { padding: '7px 6px', border: '1px solid #ccc', textAlign: 'center' };
const inputStyle: React.CSSProperties = { width: 70, textAlign: 'center', padding: 4, border: '1px solid #ccc', borderRadius: 4, direction: 'ltr' };

const safeParse = (val: string, fallback: number) => {
  if (val === '' || val === '.' || val === ',') return fallback;
  const num = parseFloat(val.replace(',', '.'));
  return isNaN(num) ? fallback : num;
};

export const TileMarbleTables: React.FC<Props> = ({ results, hasMarble, onMarbleAreaChange }) => {
  const correctedTileFloor = results.correctedTileFloor;
  const correctedTileKitchenWalls = results.correctedTileKitchenWalls;
  const correctedTileBathroomWalls = results.correctedTileBathroomWalls;
  const correctedTileCement = results.correctedTileCement;
  const correctedTileSand = results.correctedTileSand;

  const landingTileArea = results.landingTileArea || 0;
  const stepTileCount = results.stepTileCount || 0;

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') (e.target as HTMLInputElement).blur();
  };

  const commitMarbleArea = (e: React.FocusEvent<HTMLInputElement>) => {
    if (!onMarbleAreaChange) return;
    const num = safeParse(e.target.value, results.marbleArea);
    onMarbleAreaChange(num);
    e.target.value = String(num);
  };

  return (
    <>
      <div style={cardStyle}>
        <div style={headStyle}>🟫 بند البلاط</div>
        <div style={bodyStyle}>
          <table style={tableStyle}>
            <thead>
              <tr><th style={thStyle}>البند</th><th style={thStyle}>الكمية</th><th style={thStyle}>الوحدة</th></tr>
            </thead>
            <tbody>
              <tr><td style={tdStyle}>بلاط الأرضيات</td><td style={tdStyle}>{Math.ceil(correctedTileFloor)}</td><td style={tdStyle}>م²</td></tr>
              <tr><td style={tdStyle}>بلاط أرضيات المطابخ</td><td style={tdStyle}>{Math.ceil(results.tileKitchenFloor)}</td><td style={tdStyle}>م²</td></tr>
              <tr><td style={tdStyle}>بلاط أرضيات الحمامات</td><td style={tdStyle}>{Math.ceil(results.tileBathroomFloor)}</td><td style={tdStyle}>م²</td></tr>
              <tr><td style={tdStyle}>بلاط جدران المطابخ</td><td style={tdStyle}>{Math.ceil(correctedTileKitchenWalls)}</td><td style={tdStyle}>م²</td></tr>
              <tr><td style={tdStyle}>بلاط جدران الحمامات</td><td style={tdStyle}>{Math.ceil(correctedTileBathroomWalls)}</td><td style={tdStyle}>م²</td></tr>
              {landingTileArea > 0 && (
                <tr><td style={tdStyle}>بلاط البسطة</td><td style={tdStyle}>{Math.ceil(landingTileArea)}</td><td style={tdStyle}>م²</td></tr>
              )}
              {stepTileCount > 0 && (
                <tr><td style={tdStyle}>بلاط الدرج (النوائم)</td><td style={tdStyle}>{stepTileCount}</td><td style={tdStyle}>درجة</td></tr>
              )}
              <tr><td style={tdStyle}>أسمنت المونة</td><td style={tdStyle}>{correctedTileCement}</td><td style={tdStyle}>كيس</td></tr>
              <tr><td style={tdStyle}>رمل المونة</td><td style={tdStyle}>{correctedTileSand}</td><td style={tdStyle}>م³</td></tr>
            </tbody>
          </table>
        </div>
      </div>

      {hasMarble && (
        <div style={cardStyle}>
          <div style={headStyle}>🏛️ بند الرخام</div>
          <div style={bodyStyle}>
            <table style={tableStyle}>
              <thead>
                <tr><th style={thStyle}>البند</th><th style={thStyle}>الكمية</th><th style={thStyle}>الوحدة</th></tr>
              </thead>
              <tbody>
                <tr>
                  <td style={tdStyle}>مساحة الرخام</td>
                  <td style={tdStyle}>
                    <input
                      type="text"
                      inputMode="decimal"
                      dir="ltr"
                      key={`marble-area-${Math.ceil(results.marbleArea)}`}
                      defaultValue={String(Math.ceil(results.marbleArea))}
                      style={inputStyle}
                      onFocus={(e) => e.target.select()}
                      onKeyDown={handleKeyDown}
                      onBlur={commitMarbleArea}
                    />
                  </td>
                  <td style={tdStyle}>م²</td>
                </tr>
                <tr><td style={tdStyle}>خرسانة الرخام (4 سم)</td><td style={tdStyle}>{Math.ceil(results.marbleConcrete)}</td><td style={tdStyle}>م³</td></tr>
                <tr><td style={tdStyle}>أسمنت</td><td style={tdStyle}>{Math.ceil(results.marbleCement)}</td><td style={tdStyle}>كيس</td></tr>
                <tr><td style={tdStyle}>الرمل</td><td style={tdStyle}>{Math.ceil(results.marbleSand)}</td><td style={tdStyle}>م³</td></tr>
                <tr><td style={tdStyle}>الركام</td><td style={tdStyle}>{Math.ceil(results.marbleAggregate)}</td><td style={tdStyle}>م³</td></tr>
              </tbody>
            </table>
          </div>
        </div>
      )}
    </>
  );
};
