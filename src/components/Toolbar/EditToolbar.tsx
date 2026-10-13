import React from 'react';
import type { LockOptions } from '../../core/types';

interface Props {
  visible: boolean;
    lock: LockOptions;
      onDelete: () => void;
        onCopy: () => void;
          onToggleDir: () => void;
            onToggleLen: () => void;
              onToggleMove: () => void;
                onDeselect: () => void;
                }

                const btn: React.CSSProperties = {
                  padding: '8px 14px',
                    margin: '3px',
                      border: '1px solid #aaa',
                        borderRadius: '6px',
                          background: '#fff',
                            fontSize: '13px',
                              cursor: 'pointer',
                              };

                              const active: React.CSSProperties = {
                                ...btn,
                                  background: '#06f',
                                    color: '#fff',
                                      borderColor: '#06f',
                                      };

                                      export const EditToolbar: React.FC<Props> = ({ visible, lock, onDelete, onCopy, onToggleDir, onToggleLen, onToggleMove, onDeselect }) => {
                                        if (!visible) return null;
                                          return (
                                              <div style={{ display: 'flex', gap: 6, padding: 8, flexWrap: 'wrap', borderTop: '1px solid #ddd' }}>
                                                    <button style={lock.direction ? active : btn} onClick={onToggleDir}>
                                                            📐 قفل الاتجاه
                                                                  </button>
                                                                        <button style={lock.length ? active : btn} onClick={onToggleLen}>
                                                                                📏 قفل الطول
                                                                                      </button>
                                                                                            <button style={lock.move ? active : btn} onClick={onToggleMove}>
                                                                                                    🔒 قفل التحريك
                                                                                                          </button>
                                                                                                                <button style={btn} onClick={onCopy}>📋 نسخ</button>
                                                                                                                      <button style={{ ...btn, background: '#e44', color: '#fff', borderColor: '#e44' }} onClick={onDelete}>
                                                                                                                              🗑 حذف
                                                                                                                                    </button>
                                                                                                                                          <button style={{ ...btn, background: '#555', color: '#fff', borderColor: '#555' }} onClick={onDeselect}>
                                                                                                                                                  ✖ إلغاء التحديد
                                                                                                                                                        </button>
                                                                                                                                                            </div>
                                                                                                                                                              );
                                                                                                                                                              };