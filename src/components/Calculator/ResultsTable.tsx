import React from 'react';
import type { CalculationResults } from '../../core/types';

interface Props {
  results: CalculationResults | null;
  }

  const cell: React.CSSProperties = { padding: '8px 12px', borderBottom: '1px solid #eee', textAlign: 'right' };
  const header: React.CSSProperties = { ...cell, fontWeight: 'bold', background: '#f5f5f5', textAlign: 'center' };

  export const ResultsTable: React.FC<Props> = ({ results }) => {
    if (!results) return null;

      const rows: [string, number][] = [
          ['مساحة المبنى الكلية', results.buildingArea],
              ['طول الجدران الخارجية', results.exteriorWallsLength],
                  ['طول الجدران الداخلية', results.interiorWallsLength],
                      ['مساحة الجدران الخارجية', results.exteriorWallsArea],
                          ['مساحة الجدران الداخلية', results.interiorWallsArea],
                              ['مساحة الأعمدة', results.columnsArea],
                                  ['مساحة النوافذ', results.windowsArea],
                                      ['مساحة الأبواب', results.doorsArea],
                                          ['صافي مساحة الجدران الخارجية', results.netExteriorWallsArea],
                                              ['صافي مساحة الجدران الداخلية', results.netInteriorWallsArea],
                                                ];

                                                  return (
                                                      <div style={{ margin: 8, overflow: 'auto' }}>
                                                            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
                                                                    <thead>
                                                                              <tr>
                                                                                          <th style={header}>البند</th>
                                                                                                      <th style={header}>القيمة (م² / م)</th>
                                                                                                                </tr>
                                                                                                                        </thead>
                                                                                                                                <tbody>
                                                                                                                                          {rows.map(([label, val]) => (
                                                                                                                                                      <tr key={label}>
                                                                                                                                                                    <td style={cell}>{label}</td>
                                                                                                                                                                                  <td style={cell}>{val.toFixed(2)}</td>
                                                                                                                                                                                              </tr>
                                                                                                                                                                                                        ))}
                                                                                                                                                                                                                </tbody>
                                                                                                                                                                                                                      </table>
                                                                                                                                                                                                                          </div>
                                                                                                                                                                                                                            );
                                                                                                                                                                                                                            };