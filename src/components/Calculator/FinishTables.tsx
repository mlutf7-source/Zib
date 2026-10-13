import React from 'react';
import type { FinishResults } from '../../core/finishCalculations';
import { LaborTable } from './tables/LaborTable';
import { WallConstructionTables } from './tables/WallConstructionTables';
import { PlasterPaintTables } from './tables/PlasterPaintTables';
import { TileMarbleTables } from './tables/TileMarbleTables';
import { OpeningTables } from './tables/OpeningTables';
import { UtilitySummaryTables } from './tables/UtilitySummaryTables';
import { DeductionsTable } from './tables/DeductionsTable';
import { createPdfFromElement } from '../../utils/pdfShare';

interface Props {
  results: FinishResults;
  hasMarble: boolean;
  electricalPts: number;
  plumbingPts: number;
  onElectricalChange: (value: number) => void;
  onPlumbingChange: (value: number) => void;
  onMarbleAreaChange?: (value: number) => void;
  marbleLaborOverride?: number | null;
  onMarbleLaborChange?: (value: number) => void;
}

const inputStyle: React.CSSProperties = {
  width: 70,
  textAlign: 'center',
  padding: 4,
  border: '1px solid #ccc',
  borderRadius: 4,
  direction: 'ltr',
  fontFamily: 'Cairo, sans-serif',
  fontWeight: 700,
  fontSize: '0.8rem',
};

const TotalLaborSummary: React.FC<{
  results: FinishResults;
  hasMarble: boolean;
  marbleLaborOverride?: number | null;
  onMarbleLaborChange?: (value: number) => void;
}> = ({ results, hasMarble, marbleLaborOverride, onMarbleLaborChange }) => {
  const totalWallLabor = Math.ceil(
    results.exteriorWallGross +
    results.interiorWallGross
  );

  const totalPlasterLabor = Math.ceil(
    results.plasterWallsLabor +
    (results.plasterCeilingLabor -
      results.innerWallArea)
  );

  const totalPaintLabor = Math.ceil(
    results.paintWalls +
    (results.paintCeiling -
      results.innerWallArea)
  );

  const totalTileLabor = Math.ceil(
    (results.tileFloorArea -
      results.innerWallArea) +
    results.tileKitchenFloor +
    results.tileBathroomFloor +
    results.tileKitchenWalls +
    results.tileBathroomWalls
  );

  // ✅ عمالة الرخام: القيمة المخصصة إن وُجدت، وإلا الافتراضية
  const defaultMarbleLabor = Math.ceil(results.exteriorWallGross);
  const totalMarbleLabor = hasMarble
    ? (marbleLaborOverride !== null && marbleLaborOverride !== undefined
        ? marbleLaborOverride
        : defaultMarbleLabor)
    : 0;

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

  const thStyle: React.CSSProperties = {
    padding: '8px 5px',
    border: '1px solid #ddd',
    background: '#0f4c81',
    color: 'white',
    fontSize: '0.8rem',
    fontWeight: 700,
  };

  const tdStyle: React.CSSProperties = {
    padding: '8px',
    border: '1px solid #ddd',
    textAlign: 'center',
    fontSize: '0.8rem',
  };

  return (
    <div style={cardStyle}>
      <div style={headStyle}>📊 إجمالي كميات العمالة</div>
      <div style={{ padding: 10, overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={thStyle}>البند</th>
              <th style={thStyle}>الكمية</th>
              <th style={thStyle}>الوحدة</th>
            </tr>
          </thead>
          <tbody>
            <tr><td style={{ ...tdStyle, fontWeight: 600 }}>إجمالي عمالة الجدران</td><td style={tdStyle}>{totalWallLabor}</td><td style={tdStyle}>م²</td></tr>
            <tr><td style={{ ...tdStyle, fontWeight: 600 }}>إجمالي عمالة التلييس</td><td style={tdStyle}>{totalPlasterLabor}</td><td style={tdStyle}>م²</td></tr>
            <tr><td style={{ ...tdStyle, fontWeight: 600 }}>إجمالي عمالة الطلاء</td><td style={tdStyle}>{totalPaintLabor}</td><td style={tdStyle}>م²</td></tr>
            <tr><td style={{ ...tdStyle, fontWeight: 600 }}>إجمالي عمالة البلاط</td><td style={tdStyle}>{totalTileLabor}</td><td style={tdStyle}>م²</td></tr>

            {/* ✅ عمالة الرخام - قابلة للتعديل */}
            {hasMarble && (
              <tr>
                <td style={{ ...tdStyle, fontWeight: 600 }}>إجمالي عمالة الرخام</td>
                <td style={tdStyle}>
                  {onMarbleLaborChange ? (
                    <input
                      type="text"
                      inputMode="decimal"
                      dir="ltr"
                      key={`marble-labor-${totalMarbleLabor}`}
                      defaultValue={String(totalMarbleLabor)}
                      style={inputStyle}
                      onFocus={(e) => e.target.select()}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') (e.target as HTMLInputElement).blur();
                      }}
                      onBlur={(e) => {
                        const v = parseFloat(e.target.value.replace(',', '.'));
                        if (!isNaN(v) && v >= 0) {
                          onMarbleLaborChange(v);
                        } else {
                          e.target.value = String(totalMarbleLabor);
                        }
                      }}
                    />
                  ) : (
                    totalMarbleLabor
                  )}
                </td>
                <td style={tdStyle}>م²</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export const FinishTables: React.FC<Props> = ({
  results,
  hasMarble,
  electricalPts,
  plumbingPts,
  onElectricalChange,
  onPlumbingChange,
  onMarbleAreaChange,
  marbleLaborOverride,
  onMarbleLaborChange,
}) => {
  const handlePdfShare = async () => {
    await createPdfFromElement('finishes-pdf', 'تقرير_التشطيبات');
  };

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'flex-start', marginBottom: 12 }}>
        <button
          type="button"
          onClick={handlePdfShare}
          style={{
            width: '100%',
            padding: '11px 16px',
            border: 'none',
            borderRadius: 10,
            background: '#0f4c81',
            color: '#fff',
            fontSize: 15,
            fontWeight: 700,
            cursor: 'pointer',
          }}
        >
          📄 مشاركة تقرير التشطيبات PDF
        </button>
      </div>

      <LaborTable results={results} hasMarble={hasMarble} />
      <DeductionsTable results={results} />

      <TotalLaborSummary
        results={results}
        hasMarble={hasMarble}
        marbleLaborOverride={marbleLaborOverride}
        onMarbleLaborChange={onMarbleLaborChange}
      />

      <WallConstructionTables results={results} />
      <PlasterPaintTables results={results} />
      <TileMarbleTables
        results={results}
        hasMarble={hasMarble}
        onMarbleAreaChange={onMarbleAreaChange}
      />
      <OpeningTables results={results} />
      <UtilitySummaryTables
        results={results}
        hasMarble={hasMarble}
        electricalPts={electricalPts}
        plumbingPts={plumbingPts}
        onElectricalChange={onElectricalChange}
        onPlumbingChange={onPlumbingChange}
      />
    </>
  );
};
