import React from 'react';
import type { FinishResults } from '../../../core/finishCalculations';

interface Props {
  results: FinishResults;
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

const tableStyle: React.CSSProperties = {
  width: '100%',
  borderCollapse: 'collapse',
  fontSize: 12,
};

const thStyle: React.CSSProperties = {
  background: '#003366',
  color: 'white',
  padding: '8px 6px',
  border: '1px solid #003366',
  textAlign: 'center',
};

const tdStyle: React.CSSProperties = {
  padding: '7px 6px',
  border: '1px solid #ccc',
  textAlign: 'center',
};

export const PlasterPaintTables: React.FC<Props> = ({ results }) => {
  // ✅ القيم المصححة مباشرة من النتائج
  const correctedPlasterWalls = results.correctedPlasterWalls;
  const correctedPlasterCeiling = results.correctedPlasterCeiling;
  const correctedPlasterArea = results.correctedPlasterArea;
  const correctedPlasterCement = results.correctedPlasterCement;
  const correctedPlasterSand = results.correctedPlasterSand;

  const correctedPaintWalls = results.correctedPaintWalls;
  const correctedPaintCeiling = results.correctedPaintCeiling;
  const correctedPaintTotal = results.correctedPaintTotal;
  const correctedPutty = Math.ceil(correctedPaintTotal * 0.8);
  const correctedPrimer = Math.ceil(correctedPaintTotal / 8);
  const correctedPaint = Math.ceil(correctedPaintTotal / 8);

  return (
    <>
      {/* جدول التلييس */}
      <div style={cardStyle}>
        <div style={headStyle}>🏗️ بند التلييس</div>
        <div style={bodyStyle}>
          <table style={tableStyle}>
            <thead>
              <tr>
                <th style={thStyle}>البند</th>
                <th style={thStyle}>الكمية</th>
                <th style={thStyle}>الوحدة</th>
              </tr>
            </thead>
            <tbody>
              <tr><td style={tdStyle}>تلييس الجدران الداخلية</td><td style={tdStyle}>{Math.ceil(correctedPlasterWalls)}</td><td style={tdStyle}>م²</td></tr>
              <tr><td style={tdStyle}>تلييس الأسقف</td><td style={tdStyle}>{Math.ceil(correctedPlasterCeiling)}</td><td style={tdStyle}>م²</td></tr>
              <tr><td style={tdStyle}>أكياس الأسمنت</td><td style={tdStyle}>{correctedPlasterCement}</td><td style={tdStyle}>كيس</td></tr>
              <tr><td style={tdStyle}>الرمل</td><td style={tdStyle}>{correctedPlasterSand}</td><td style={tdStyle}>م³</td></tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* جدول الطلاء */}
      <div style={cardStyle}>
        <div style={headStyle}>🎨 بند الطلاء</div>
        <div style={bodyStyle}>
          <table style={tableStyle}>
            <thead>
              <tr>
                <th style={thStyle}>البند</th>
                <th style={thStyle}>الكمية</th>
                <th style={thStyle}>الوحدة</th>
              </tr>
            </thead>
            <tbody>
              <tr><td style={tdStyle}>طلاء الجدران</td><td style={tdStyle}>{Math.ceil(correctedPaintWalls)}</td><td style={tdStyle}>م²</td></tr>
              <tr><td style={tdStyle}>طلاء الأسقف</td><td style={tdStyle}>{Math.ceil(correctedPaintCeiling)}</td><td style={tdStyle}>م²</td></tr>
              <tr><td style={tdStyle}>المعجون</td><td style={tdStyle}>{correctedPutty}</td><td style={tdStyle}>كجم</td></tr>
              <tr><td style={tdStyle}>البرايمر</td><td style={tdStyle}>{correctedPrimer}</td><td style={tdStyle}>كجم</td></tr>
              <tr><td style={tdStyle}>الطلاء</td><td style={tdStyle}>{correctedPaint}</td><td style={tdStyle}>كجم</td></tr>
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
};
