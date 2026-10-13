import React from 'react';

export const S = {
  card: { border: 'none', borderRadius: '12px', overflow: 'hidden', background: '#ffffff', boxShadow: '0 2px 8px rgba(0,0,0,.08)', marginBottom: '10px' } as React.CSSProperties,
    head: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 14px', background: '#ffffff', cursor: 'pointer', borderBottom: '1px solid #d8e1ea' } as React.CSSProperties,
      body: { padding: '12px 14px' } as React.CSSProperties,
        th: { padding: '10px 8px', border: '1px solid #d8e1ea', background: '#0f4c81', color: 'white', fontSize: '0.85rem', fontWeight: 700 } as React.CSSProperties,
          td: { padding: '8px', border: '1px solid #d8e1ea', textAlign: 'center' as const, fontSize: '0.8rem', fontWeight: 600, color: '#333' } as React.CSSProperties,
            total: { background: '#e8f5e9', border: '2px solid #4caf50', color: '#1b5e20', fontWeight: 700, fontSize: '1rem' } as React.CSSProperties,
            };

            export const Card = ({ title, open, setOpen, children, currency }: any) => (
              <div style={S.card}>
                  <div onClick={() => setOpen(!open)} style={S.head}>
                        <span style={{ fontWeight: 700, color: '#003366', fontSize: '0.9rem' }}>{title}{currency ? ` (${currency})` : ''}</span>
                              <span>{open ? '▲' : '▼'}</span>
                                  </div>
                                      {open && <div style={S.body}>{children}</div>}
                                        </div>
                                        );

                                        export const Tr = ({ label, value, bold, total }: any) => (
                                          <tr style={total ? S.total : undefined}>
                                              <td style={{ ...S.td, fontWeight: bold || total ? 700 : 400 }}>{label}</td>
                                                  <td style={S.td}>{value}</td>
                                                    </tr>
                                                    );

                                                    export const Tr4 = ({ label, qty, price, total, bold, totalRow }: any) => (
                                                      <tr style={totalRow ? S.total : undefined}>
                                                          <td style={{ ...S.td, fontWeight: bold || totalRow ? 700 : 400 }}>{label}</td>
                                                              {totalRow ? (
                                                                    <td style={S.td} colSpan={3}>{total}</td>
                                                                        ) : (
                                                                              <>
                                                                                      <td style={S.td}>{qty}</td>
                                                                                              <td style={S.td}>{price}</td>
                                                                                                      <td style={S.td}>{total}</td>
                                                                                                            </>
                                                                                                                )}
                                                                                                                  </tr>
                                                                                                                  );

                                                                                                                  export const SectionTitle = ({ children }: { children: React.ReactNode }) => (
                                                                                                                    <div style={{ position: 'relative', padding: '8px 12px', marginBottom: '12px', marginTop: '8px', background: 'linear-gradient(to left, transparent, #e8f0fe 30%)', borderRight: '4px solid #2563eb', borderRadius: '0 8px 8px 0', boxShadow: '0 0 8px rgba(37,99,235,0.1)' }}>
                                                                                                                        <span style={{ fontSize: '0.8rem', fontWeight: 800, color: '#003366' }}>{children}</span>
                                                                                                                          </div>
                                                                                                                          );