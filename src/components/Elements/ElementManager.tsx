import React from 'react';
import type { Wall, Column, Window, Door, Point } from '../../core/types';
import { ColumnForm } from './ColumnForm';
import { ColumnList } from './ColumnList';
import { WindowForm } from './WindowForm';
import { DoorForm } from './DoorForm';

interface Props {
walls: Wall[];
columns: Column[];
windows: Window[];
doors: Door[];

onAddColumn: (c: {
position: Point;
width: number;
length: number;
}) => void;

onRemoveColumn: (id: string) => void;

onAddWindow: (w: {
wallId: string;
position: number;
width: number;
height: number;
}) => void;

onRemoveWindow: (id: string) => void;

onAddDoor: (d: {
wallId: string;
position: number;
width: number;
height: number;
}) => void;

onRemoveDoor: (id: string) => void;
}

export const ElementManager: React.FC<Props> = ({
walls,
columns,
windows,
doors,
onAddColumn,
onRemoveColumn,
onAddWindow,
onRemoveWindow,
onAddDoor,
onRemoveDoor,
}) => (

  <div style={{ padding: 8 }}>
      <h4 style={{ margin: '8px 0' }}>🧩 العناصر الإنشائية</h4><ColumnForm onAdd={onAddColumn} />

      <ColumnList
        columns={columns}
          onRemove={onRemoveColumn}
          />

          <WindowForm
            walls={walls}
              onAdd={onAddWindow}
              />

              <DoorForm
                walls={walls}
                  onAdd={onAddDoor}
                  />

                  {windows.length > 0 && (
                    <div style={{ padding: 8, fontSize: 13 }}>
                        <strong>النوافذ:</strong>{' '}
                            {windows.map(w => (
                                  <div key={w.id}>
                                          {w.width}×{w.height}{' '}
                                                  <button
                                                            onClick={() => onRemoveWindow(w.id)}
                                                                      style={{
                                                                                  color: '#e44',
                                                                                              border: 'none',
                                                                                                          background: 'none',
                                                                                                                      cursor: 'pointer',
                                                                                                                                }}
                                                                                                                                        >
                                                                                                                                                  ✕
                                                                                                                                                          </button>
                                                                                                                                                                </div>
                                                                                                                                                                    ))}
                                                                                                                                                                      </div>
                                                                                                                                                                      )}

                                                                                                                                                                      {doors.length > 0 && (
                                                                                                                                                                        <div style={{ padding: 8, fontSize: 13 }}>
                                                                                                                                                                            <strong>الأبواب:</strong>{' '}
                                                                                                                                                                                {doors.map(d => (
                                                                                                                                                                                      <div key={d.id}>
                                                                                                                                                                                              {d.width}×{d.height}{' '}
                                                                                                                                                                                                      <button
                                                                                                                                                                                                                onClick={() => onRemoveDoor(d.id)}
                                                                                                                                                                                                                          style={{
                                                                                                                                                                                                                                      color: '#e44',
                                                                                                                                                                                                                                                  border: 'none',
                                                                                                                                                                                                                                                              background: 'none',
                                                                                                                                                                                                                                                                          cursor: 'pointer',
                                                                                                                                                                                                                                                                                    }}
                                                                                                                                                                                                                                                                                            >
                                                                                                                                                                                                                                                                                                      ✕
                                                                                                                                                                                                                                                                                                              </button>
                                                                                                                                                                                                                                                                                                                    </div>
                                                                                                                                                                                                                                                                                                                        ))}
                                                                                                                                                                                                                                                                                                                          </div>
                                                                                                                                                                                                                                                                                                                          )}

                                                                                                                                                                                                                                                                                                                            </div>
                                                                                                                                                                                                                                                                                                                            );