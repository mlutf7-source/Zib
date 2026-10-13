import React, { useState } from 'react';
import type { Wall } from '../../core/types';
import { getSummaryData } from './summaryData';
import { SummaryTables1 } from './summaryTables1';
import { SummaryTables2 } from './summaryTables2';
import { createPdfFromElement } from '../../utils/pdfShare';
export const SummaryPage: React.FC<{ walls: Wall[] }> = ({ walls }) => {
  if (!walls) return null;

    // ✅ قراءة حالة الرخام من localStorage
      const hasMarble = localStorage.getItem('hasMarble') === 'true';

        const [settings, setSettings] = useState<any>({ currency: 'YER', rate: '1', floors: '1' });
          const [allOpen, setAllOpen] = useState(true);
            const [appliedFloors, setAppliedFloors] = useState<number>(1);

              const [o, setO] = useState({ cur: true, conc: true, steel: true, other: true, prel: true, mat: true, labor: true, extra: true, final: true, ind: true, finishes: true });

                const data = getSummaryData(walls);

                  const cur = settings.currency === 'YER' ? 'ر.ي' : settings.currency === 'SAR' ? 'ر.س' : '$';
                    const rate = parseFloat(settings.rate) || 1;
                      const cv = (v: number) => settings.currency === 'YER' ? v : v / rate;

                        const update = (k: string, v: string) => {
                            const updated = { ...settings, [k]: v };
                                setSettings(updated);
                                    localStorage.setItem('summary_settings', JSON.stringify(updated));
                                      };

                                        const handleUpdateData = () => {
                                            const newFloors = parseFloat(settings.floors) || 1;
                                                setAppliedFloors(newFloors);
                                                  };

                                                    const toggleAll = () => {
                                                        const ns = !allOpen;
                                                            setAllOpen(ns);
                                                                setO({ cur: ns, conc: ns, steel: ns, other: ns, prel: ns, mat: ns, labor: ns, extra: ns, final: ns, ind: ns, finishes: ns });
                                                                  };

                                                                    return (
                                                                        <>
                                                                            {/* منطقة التقرير التي سيتم تحويلها إلى PDF */}
                                                                                <div
                                                                                      id="printable-area"
                                                                                            style={{
                                                                                                    display: 'flex',
                                                                                                            flexDirection: 'column',
                                                                                                                    gap: '12px',
                                                                                                                          }}
                                                                                                                              >
                                                                                                                                    <SummaryTables1
                                                                                                                                            data={data}
                                                                                                                                                    o={o}
                                                                                                                                                            setO={setO}
                                                                                                                                                                    cur={cur}
                                                                                                                                                                            cv={cv}
                                                                                                                                                                                    floors={appliedFloors}
                                                                                                                                                                                            settings={settings}
                                                                                                                                                                                                    update={update}
                                                                                                                                                                                                            toggleAll={toggleAll}
                                                                                                                                                                                                                    allOpen={allOpen}
                                                                                                                                                                                                                            onUpdateFloors={handleUpdateData}
                                                                                                                                                                                                                                  />

                                                                                                                                                                                                                                        <SummaryTables2
                                                                                                                                                                                                                                                data={data}
                                                                                                                                                                                                                                                        o={o}
                                                                                                                                                                                                                                                                setO={setO}
                                                                                                                                                                                                                                                                        cur={cur}
                                                                                                                                                                                                                                                                                cv={cv}
                                                                                                                                                                                                                                                                                        floors={appliedFloors}
                                                                                                                                                                                                                                                                                                hasMarble={hasMarble}
                                                                                                                                                                                                                                                                                                      />
                                                                                                                                                                                                                                                                                                          </div>

                                                                                                                                                                                                                                                                                                              {/* زر مشاركة PDF - خارج منطقة التقرير */}
                                                                                                                                                                                                                                                                                                                  <div style={{ display: 'flex', gap: '8px', padding: '4px 0' }}>
                                                                                                                                                                                                                                                                                                                        <button
                                                                                                                                                                                                                                                                                                                                onClick={() =>
                                                                                                                                                                                                                                                                                                                                          createPdfFromElement('printable-area', 'الملخص النهائي')
                                                                                                                                                                                                                                                                                                                                                  }
                                                                                                                                                                                                                                                                                                                                                          style={{
                                                                                                                                                                                                                                                                                                                                                                    flex: 1,
                                                                                                                                                                                                                                                                                                                                                                              padding: '12px',
                                                                                                                                                                                                                                                                                                                                                                                        border: 'none',
                                                                                                                                                                                                                                                                                                                                                                                                  borderRadius: '10px',
                                                                                                                                                                                                                                                                                                                                                                                                            background: '#00509e',
                                                                                                                                                                                                                                                                                                                                                                                                                      color: 'white',
                                                                                                                                                                                                                                                                                                                                                                                                                                fontWeight: 700,
                                                                                                                                                                                                                                                                                                                                                                                                                                          fontSize: '0.85rem',
                                                                                                                                                                                                                                                                                                                                                                                                                                                    cursor: 'pointer',
                                                                                                                                                                                                                                                                                                                                                                                                                                                              fontFamily: 'Cairo, sans-serif',
                                                                                                                                                                                                                                                                                                                                                                                                                                                                      }}
                                                                                                                                                                                                                                                                                                                                                                                                                                                                            >
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    📄 مشاركة PDF
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          </button>
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              </div>
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                </>
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                );
                                                                                                                                                                                                                                                                                                                                                                                                                                                                };