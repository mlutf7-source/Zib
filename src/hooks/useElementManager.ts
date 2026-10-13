import { useState, useCallback } from 'react';
import type { Column, Window, Door, NorthArrow, Point } from '../core/types';
import { DEFAULT_COLUMN, DEFAULT_WINDOW, DEFAULT_DOOR, DEFAULT_NORTH_ARROW } from '../core/types';
import { v4 as uuidv4 } from 'uuid';

export function useElementManager() {
  const [columns, setColumns] = useState<Column[]>([]);
    const [windows, setWindows] = useState<Window[]>([]);
      const [doors, setDoors] = useState<Door[]>([]);
        const [northArrows, setNorthArrows] = useState<NorthArrow[]>([]);

const addColumn = useCallback((c: Omit<Column, 'id' | 'rotation'>) =>
  setColumns(prev => [...prev, {
      ...c,
          id: uuidv4(),
              rotation: DEFAULT_COLUMN.rotation,
                  columnShape: c.columnShape ?? 'rect',
                    }]), []);
                const addWindow = useCallback((w: Omit<Window, 'id' | 'thickness' | 'center'> & { center?: Point }) =>
                    setWindows(prev => [...prev, {
                          ...w,
                                id: uuidv4(),
                                      thickness: DEFAULT_WINDOW.thickness,
                                            center: w.center ?? { x: 0, y: 0 },
                                                }]), []);

                                                  const addDoor = useCallback((d: Omit<Door, 'id' | 'thickness' | 'hinge' | 'swing' | 'side' | 'center'> & { center?: Point }) =>
                                                      setDoors(prev => [...prev, {
                                                            ...d,
                                                                  id: uuidv4(),
                                                                        thickness: DEFAULT_DOOR.thickness,
                                                                              hinge: DEFAULT_DOOR.hinge,
                                                                                    swing: DEFAULT_DOOR.swing,
                                                                                          side: DEFAULT_DOOR.side,
                                                                                                center: d.center ?? { x: 0, y: 0 },
                                                                                                    }]), []);

                                                                                                      // ✅ إضافة سهم الشمال
                                                                                                        const addNorthArrow = useCallback((position: Point) => {
                                                                                                            setNorthArrows(prev => [...prev, {
                                                                                                                  id: uuidv4(),
                                                                                                                        position,
                                                                                                                              rotation: DEFAULT_NORTH_ARROW.rotation,
                                                                                                                                    size: DEFAULT_NORTH_ARROW.size,
                                                                                                                                        }]);
                                                                                                                                          }, []);

                                                                                                                                            const removeColumn = useCallback((id: string) =>
                                                                                                                                                setColumns(prev => prev.filter(c => c.id !== id)), []);

                                                                                                                                                  const removeWindow = useCallback((id: string) =>
                                                                                                                                                      setWindows(prev => prev.filter(w => w.id !== id)), []);

                                                                                                                                                        const removeDoor = useCallback((id: string) =>
                                                                                                                                                            setDoors(prev => prev.filter(d => d.id !== id)), []);

                                                                                                                                                              const removeNorthArrow = useCallback((id: string) =>
                                                                                                                                                                  setNorthArrows(prev => prev.filter(n => n.id !== id)), []);

                                                                                                                                                                    const updateColumn = useCallback((id: string, patch: Partial<Column>) =>
                                                                                                                                                                        setColumns(prev => prev.map(c => c.id === id ? { ...c, ...patch } : c)), []);

                                                                                                                                                                          const updateWindow = useCallback((id: string, patch: Partial<Window>) =>
                                                                                                                                                                              setWindows(prev => prev.map(w => w.id === id ? { ...w, ...patch } : w)), []);

                                                                                                                                                                                const updateDoor = useCallback((id: string, patch: Partial<Door>) =>
                                                                                                                                                                                    setDoors(prev => prev.map(d => d.id === id ? { ...d, ...patch } : d)), []);

                                                                                                                                                                                      const updateNorthArrow = useCallback((id: string, patch: Partial<NorthArrow>) =>
                                                                                                                                                                                          setNorthArrows(prev => prev.map(n => n.id === id ? { ...n, ...patch } : n)), []);

                                                                                                                                                                                            const setAllElements = useCallback((newColumns: Column[], newWindows: Window[], newDoors: Door[], newNorthArrows: NorthArrow[]) => {
                                                                                                                                                                                                setColumns(newColumns);
                                                                                                                                                                                                    setWindows(newWindows);
                                                                                                                                                                                                        setDoors(newDoors);
                                                                                                                                                                                                            setNorthArrows(newNorthArrows);
                                                                                                                                                                                                              }, []);

                                                                                                                                                                                                                return {
                                                                                                                                                                                                                    columns,
                                                                                                                                                                                                                        windows,
                                                                                                                                                                                                                            doors,
                                                                                                                                                                                                                                northArrows,
                                                                                                                                                                                                                                    addColumn,
                                                                                                                                                                                                                                        addWindow,
                                                                                                                                                                                                                                            addDoor,
                                                                                                                                                                                                                                                addNorthArrow,
                                                                                                                                                                                                                                                    removeColumn,
                                                                                                                                                                                                                                                        removeWindow,
                                                                                                                                                                                                                                                            removeDoor,
                                                                                                                                                                                                                                                                removeNorthArrow,
                                                                                                                                                                                                                                                                    updateColumn,
                                                                                                                                                                                                                                                                        updateWindow,
                                                                                                                                                                                                                                                                            updateDoor,
                                                                                                                                                                                                                                                                                updateNorthArrow,
                                                                                                                                                                                                                                                                                    setAllElements,
                                                                                                                                                                                                                                                                                      };
                                                                                                                                                                                                                                                                                      }