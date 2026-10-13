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

                                                export const DeductionsTable: React.FC<Props> = ({ results }) => {
                                                  return (
                                                      <div style={cardStyle}>
                                                            <div style={headStyle}>📉 مساحات الخصومات من الجدران</div>
                                                                  <div style={bodyStyle}>
                                                                          <table style={tableStyle}>
                                                                                    <thead>
                                                                                                <tr>
                                                                                                              <th style={thStyle}>البند</th>
                                                                                                                            <th style={thStyle}>الجدران الخارجية (م²)</th>
                                                                                                                                          <th style={thStyle}>الجدران الداخلية (م²)</th>
                                                                                                                                                      </tr>
                                                                                                                                                                </thead>
                                                                                                                                                                          <tbody>
                                                                                                                                                                                      <tr>
                                                                                                                                                                                                    <td style={tdStyle}>الأعمدة</td>
                                                                                                                                                                                                                  <td style={tdStyle}>{results.outerColumnArea.toFixed(2)}</td>
                                                                                                                                                                                                                                <td style={tdStyle}>{results.innerColumnArea.toFixed(2)}</td>
                                                                                                                                                                                                                                            </tr>
                                                                                                                                                                                                                                                        <tr>
                                                                                                                                                                                                                                                                      <td style={tdStyle}>النوافذ</td>
                                                                                                                                                                                                                                                                                    <td style={tdStyle}>{results.extWindowArea.toFixed(2)}</td>
                                                                                                                                                                                                                                                                                                  <td style={tdStyle}>{results.intWindowArea.toFixed(2)}</td>
                                                                                                                                                                                                                                                                                                              </tr>
                                                                                                                                                                                                                                                                                                                          <tr>
                                                                                                                                                                                                                                                                                                                                        <td style={tdStyle}>الأبواب</td>
                                                                                                                                                                                                                                                                                                                                                      <td style={tdStyle}>{results.extDoorArea.toFixed(2)}</td>
                                                                                                                                                                                                                                                                                                                                                                    <td style={tdStyle}>{results.intDoorArea.toFixed(2)}</td>
                                                                                                                                                                                                                                                                                                                                                                                </tr>
                                                                                                                                                                                                                                                                                                                                                                                          </tbody>
                                                                                                                                                                                                                                                                                                                                                                                                  </table>
                                                                                                                                                                                                                                                                                                                                                                                                        </div>
                                                                                                                                                                                                                                                                                                                                                                                                            </div>
                                                                                                                                                                                                                                                                                                                                                                                                              );
                                                                                                                                                                                                                                                                                                                                                                                                              };