import React from 'react';

interface StructureResults {
  footingConcrete: number;
    footingSteel: number;
      neckConcrete: number;
        neckSteel: number;
          columnConcrete: number;
            columnSteel: number;
              middConcrete: number;
                middSteel: number;
                  slabConcrete: number;
                    slabSteel: number;
                      totalConcrete: number;
                        totalSteel: number;
                        }

                        interface Props {
                          results: StructureResults;
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

                                                const thStyle: React.CSSProperties = {
                                                  padding: '8px 5px',
                                                    border: '1px solid #003366',
                                                      background: '#0f4c81',
                                                        color: 'white',
                                                          fontSize: '0.75rem',
                                                            fontWeight: 700,
                                                            };

                                                            const tdStyle: React.CSSProperties = {
                                                              padding: '6px 5px',
                                                                border: '1px solid #ccc',
                                                                  textAlign: 'center',
                                                                    fontSize: '0.7rem',
                                                                    };

                                                                    const tdLabelStyle: React.CSSProperties = {
                                                                      padding: '6px 5px',
                                                                        border: '1px solid #ccc',
                                                                          fontWeight: 700,
                                                                            fontSize: '0.7rem',
                                                                            };

                                                                            const totalStyle: React.CSSProperties = {
                                                                              background: '#e8f5e9',
                                                                                color: '#1b5e20',
                                                                                  fontWeight: 700,
                                                                                  };

                                                                                  export const StructureTables: React.FC<Props> = ({ results }) => {
                                                                                    return (
                                                                                        <div style={cardStyle}>
                                                                                              <div style={headStyle}>📊 ملخص الهيكل الخرساني</div>
                                                                                                    <div style={{ padding: 10, overflowX: 'auto' }}>
                                                                                                            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                                                                                                      <thead>
                                                                                                                                  <tr>
                                                                                                                                                <th style={thStyle}>البند</th>
                                                                                                                                                              <th style={thStyle}>خرسانة (م³)</th>
                                                                                                                                                                            <th style={thStyle}>حديد (طن)</th>
                                                                                                                                                                                        </tr>
                                                                                                                                                                                                  </thead>
                                                                                                                                                                                                            <tbody>
                                                                                                                                                                                                                        <tr>
                                                                                                                                                                                                                                      <td style={tdLabelStyle}>🧱 القواعد</td>
                                                                                                                                                                                                                                                    <td style={tdStyle}>{results.footingConcrete.toFixed(2)}</td>
                                                                                                                                                                                                                                                                  <td style={tdStyle}>{results.footingSteel.toFixed(2)}</td>
                                                                                                                                                                                                                                                                              </tr>
                                                                                                                                                                                                                                                                                          <tr>
                                                                                                                                                                                                                                                                                                        <td style={tdLabelStyle}>📏 الرقاب</td>
                                                                                                                                                                                                                                                                                                                      <td style={tdStyle}>{results.neckConcrete.toFixed(2)}</td>
                                                                                                                                                                                                                                                                                                                                    <td style={tdStyle}>{results.neckSteel.toFixed(2)}</td>
                                                                                                                                                                                                                                                                                                                                                </tr>
                                                                                                                                                                                                                                                                                                                                                            <tr>
                                                                                                                                                                                                                                                                                                                                                                          <td style={tdLabelStyle}>🏛️ الأعمدة</td>
                                                                                                                                                                                                                                                                                                                                                                                        <td style={tdStyle}>{results.columnConcrete.toFixed(2)}</td>
                                                                                                                                                                                                                                                                                                                                                                                                      <td style={tdStyle}>{results.columnSteel.toFixed(2)}</td>
                                                                                                                                                                                                                                                                                                                                                                                                                  </tr>
                                                                                                                                                                                                                                                                                                                                                                                                                              <tr>
                                                                                                                                                                                                                                                                                                                                                                                                                                            <td style={tdLabelStyle}>〰️ الميدات</td>
                                                                                                                                                                                                                                                                                                                                                                                                                                                          <td style={tdStyle}>{results.middConcrete.toFixed(2)}</td>
                                                                                                                                                                                                                                                                                                                                                                                                                                                                        <td style={tdStyle}>{results.middSteel.toFixed(2)}</td>
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    </tr>
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                <tr>
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              <td style={tdLabelStyle}>🟫 الأسقف</td>
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            <td style={tdStyle}>{results.slabConcrete.toFixed(2)}</td>
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          <td style={tdStyle}>{results.slabSteel.toFixed(2)}</td>
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      </tr>
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  <tr style={totalStyle}>
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                <td style={{ ...tdLabelStyle, ...totalStyle }}>الإجمالي</td>
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              <td style={{ ...tdStyle, ...totalStyle }}>{results.totalConcrete.toFixed(2)}</td>
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            <td style={{ ...tdStyle, ...totalStyle }}>{results.totalSteel.toFixed(2)}</td>
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        </tr>
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  </tbody>
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          </table>
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                </div>
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    </div>
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      );
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      };