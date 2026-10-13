import React from 'react';
import type { Column } from '../../core/types';

interface Props {
  columns: Column[];
    onRemove: (id: string) => void;
    }

    export const ColumnList: React.FC<Props> = ({ columns, onRemove }) => {
      if (columns.length === 0) return <div style={{ padding: 8, color: '#888' }}>لا توجد أعمدة</div>;

        return (
            <div style={{ padding: 8 }}>
                  {columns.map(c => (
                          <div key={c.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 0', borderBottom: '1px solid #eee', fontSize: 13 }}>
                                    <span>📍 ({c.position.x.toFixed(1)}, {c.position.y.toFixed(1)}) — {c.width}×{c.length}</span>
                                              <button
                                                          onClick={() => onRemove(c.id)}
                                                                      style={{ background: '#e44', color: '#fff', border: 'none', borderRadius: 4, padding: '4px 8px', cursor: 'pointer' }}
                                                                                >✕</button>
                                                                                        </div>
                                                                                              ))}
                                                                                                  </div>
                                                                                                    );
                                                                                                    };