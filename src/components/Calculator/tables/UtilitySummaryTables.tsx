import React from 'react';
import type { FinishResults } from '../../../core/finishCalculations';

interface Props {
  results: FinishResults;
  hasMarble: boolean;
  electricalPts: number;
  plumbingPts: number;
  onElectricalChange: (value: number) => void;
  onPlumbingChange: (value: number) => void;
}

const cardStyle: React.CSSProperties = { background: '#fff', border: '1px solid #ddd', borderRadius: 12, overflow: 'hidden', marginBottom: 12 };
const headStyle: React.CSSProperties = { background: '#f8fafc', padding: '10px 12px', fontWeight: 700, color: '#003366', fontSize: 14, borderBottom: '1px solid #ddd' };
const bodyStyle: React.CSSProperties = { padding: 10 };
const tableStyle: React.CSSProperties = { width: '100%', borderCollapse: 'collapse', fontSize: 12 };
const thStyle: React.CSSProperties = { background: '#003366', color: 'white', padding: '8px 6px', border: '1px solid #003366', textAlign: 'center' };
const tdStyle: React.CSSProperties = { padding: '7px 6px', border: '1px solid #ccc', textAlign: 'center', direction: 'ltr' };
const inputStyle: React.CSSProperties = { width: 70, textAlign: 'center', padding: 4, border: '1px solid #ccc', borderRadius: 4, direction: 'ltr' };

const safeParse = (val: string, fallback: number) => {
  if (val === '' || val === '.' || val === ',') return fallback;
  const num = parseFloat(val.replace(',', '.'));
  return isNaN(num) ? fallback : num;
};

export const UtilitySummaryTables: React.FC<Props> = ({ results, hasMarble, electricalPts, plumbingPts, onElectricalChange, onPlumbingChange }) => {
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') (e.target as HTMLInputElement).blur();
  };

  const commitEdit = (e: React.FocusEvent<HTMLInputElement>, fallback: number, onChange: (n: number) => void) => {
    const num = safeParse(e.target.value, fallback);
    onChange(num);
    e.target.value = String(num);
  };

  const correctedTileTotalArea = results.correctedTileTotalArea;
  const correctedTileCement = results.correctedTileCement;
  const correctedTileSand = results.correctedTileSand;
  const correctedPlasterCement = results.correctedPlasterCement;
  const correctedPlasterSand = results.correctedPlasterSand;
  const marbleArea = hasMarble ? results.marbleArea : 0;
  const marbleCement = hasMarble ? results.marbleCement : 0;
  const marbleSand = hasMarble ? results.marbleSand : 0;
  const marbleAggregate = hasMarble ? results.marbleAggregate : 0;

  const landingTileArea = results.landingTileArea || 0;
  const stepTileCount = results.stepTileCount || 0;

  const totalBlocks = Math.ceil(results.exteriorBlocks + results.interiorBlocks);
  const totalCement = Math.ceil(results.exteriorBlockCement + results.interiorBlockCement + correctedPlasterCement + correctedTileCement + marbleCement);
  const totalSand = Math.ceil(results.exteriorBlockSand + results.interiorBlockSand + correctedPlasterSand + correctedTileSand + marbleSand);
  const totalAggregate = marbleAggregate;

  const totalDoorsArea = results.doorGroups.reduce((s, g) => s + g.totalArea, 0);
  const totalWindowsArea = results.windowGroups.reduce((s, g) => s + g.totalArea, 0);

  return (<>
    <div style={cardStyle}>
      <div style={headStyle}>💡🔌 الكهرباء والسباكة</div>
      <div style={bodyStyle}>
        <table style={tableStyle}>
          <thead><tr><th style={thStyle}>البند</th><th style={thStyle}>عدد النقاط</th></tr></thead>
          <tbody>
            <tr><td style={tdStyle}>السباكة</td><td style={tdStyle}><input type="text" inputMode="decimal" dir="ltr" key="plumbing-pts" defaultValue={String(plumbingPts)} style={inputStyle} onFocus={(e) => e.target.select()} onKeyDown={handleKeyDown} onBlur={(e) => commitEdit(e, plumbingPts, onPlumbingChange)} /></td></tr>
            <tr><td style={tdStyle}>الكهرباء</td><td style={tdStyle}><input type="text" inputMode="decimal" dir="ltr" key="electrical-pts" defaultValue={String(electricalPts)} style={inputStyle} onFocus={(e) => e.target.select()} onKeyDown={handleKeyDown} onBlur={(e) => commitEdit(e, electricalPts, onElectricalChange)} /></td></tr>
          </tbody>
        </table>
      </div>
    </div>
    <div style={cardStyle}>
      <div style={headStyle}>📦 إجمالي الكميات النهائي</div>
      <div style={bodyStyle}>
        <table style={tableStyle}>
          <thead><tr><th style={thStyle}>البند</th><th style={thStyle}>الكمية</th><th style={thStyle}>الوحدة</th></tr></thead>
          <tbody>
            <tr><td style={tdStyle}>إجمالي البلوك</td><td style={tdStyle}>{totalBlocks}</td><td style={tdStyle}>بلوكة</td></tr>
            <tr><td style={tdStyle}>إجمالي البلاط</td><td style={tdStyle}>{Math.ceil(correctedTileTotalArea)}</td><td style={tdStyle}>م²</td></tr>
            {landingTileArea > 0 && (
              <tr><td style={tdStyle}>إجمالي بلاط البسطة</td><td style={tdStyle}>{Math.ceil(landingTileArea)}</td><td style={tdStyle}>م²</td></tr>
            )}
            {stepTileCount > 0 && (
              <tr><td style={tdStyle}>إجمالي بلاط الدرج</td><td style={tdStyle}>{stepTileCount}</td><td style={tdStyle}>درجة</td></tr>
            )}
            <tr><td style={tdStyle}>إجمالي الأسمنت</td><td style={tdStyle}>{totalCement}</td><td style={tdStyle}>كيس</td></tr>
            <tr><td style={tdStyle}>إجمالي الرمل</td><td style={tdStyle}>{totalSand}</td><td style={tdStyle}>م³</td></tr>
            <tr><td style={tdStyle}>إجمالي الركام</td><td style={tdStyle}>{totalAggregate}</td><td style={tdStyle}>م³</td></tr>
            {hasMarble && (<tr><td style={tdStyle}>إجمالي الرخام</td><td style={tdStyle}>{Math.ceil(marbleArea)}</td><td style={tdStyle}>م²</td></tr>)}
            <tr><td style={tdStyle}>إجمالي الأبواب</td><td style={tdStyle}>{Math.ceil(totalDoorsArea * 100) / 100}</td><td style={tdStyle}>م²</td></tr>
            <tr><td style={tdStyle}>إجمالي النوافذ</td><td style={tdStyle}>{Math.ceil(totalWindowsArea * 100) / 100}</td><td style={tdStyle}>م²</td></tr>
          </tbody>
        </table>
      </div>
    </div>
  </>);
};
