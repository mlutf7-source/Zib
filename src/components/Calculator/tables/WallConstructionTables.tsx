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

                                                export const WallConstructionTables: React.FC<Props> = ({ results }) => {
                                                  return (
                                                      <>
                                                            {/* جدول بناء الجدران الخارجية */}
                                                                  <div style={cardStyle}>
                                                                          <div style={headStyle}>🧱 كميات بناء الجدران الخارجية</div>
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
                                                                                                                                                                                                                          <tr><td style={tdStyle}>عدد البلوك</td><td style={tdStyle}>{Math.ceil(results.exteriorBlocks)}</td><td style={tdStyle}>بلوكة</td></tr>
                                                                                                                                                                                                                                        <tr><td style={tdStyle}>أكياس الأسمنت</td><td style={tdStyle}>{Math.ceil(results.exteriorBlockCement)}</td><td style={tdStyle}>كيس</td></tr>
                                                                                                                                                                                                                                                      <tr><td style={tdStyle}>الرمل</td><td style={tdStyle}>{Math.ceil(results.exteriorBlockSand)}</td><td style={tdStyle}>م³</td></tr>
                                                                                                                                                                                                                                                                  </tbody>
                                                                                                                                                                                                                                                                            </table>
                                                                                                                                                                                                                                                                                    </div>
                                                                                                                                                                                                                                                                                          </div>

                                                                                                                                                                                                                                                                                                {/* جدول بناء الجدران الداخلية */}
                                                                                                                                                                                                                                                                                                      <div style={cardStyle}>
                                                                                                                                                                                                                                                                                                              <div style={headStyle}>🧱 كميات بناء الجدران الداخلية</div>
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
                                                                                                                                                                                                                                                                                                                                                                                                                                                              <tr><td style={tdStyle}>عدد البلوك</td><td style={tdStyle}>{Math.ceil(results.interiorBlocks)}</td><td style={tdStyle}>بلوكة</td></tr>
                                                                                                                                                                                                                                                                                                                                                                                                                                                                            <tr><td style={tdStyle}>أكياس الأسمنت</td><td style={tdStyle}>{Math.ceil(results.interiorBlockCement)}</td><td style={tdStyle}>كيس</td></tr>
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          <tr><td style={tdStyle}>الرمل</td><td style={tdStyle}>{Math.ceil(results.interiorBlockSand)}</td><td style={tdStyle}>م³</td></tr>
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      </tbody>
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                </table>
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        </div>
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              </div>
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  </>
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    );
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    };