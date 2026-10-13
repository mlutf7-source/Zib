import { useMemo } from 'react';
import type { Wall, Column, Window, Door, CalculationResults } from '../core/types';
import { calculateResults } from '../core/calculations';

export function useCalculations(
  walls: Wall[],
    columns: Column[],
      windows: Window[],
        doors: Door[],
          buildingHeight: number,
          ): CalculationResults | null {
            return useMemo(() => {
                // ✅ استثناء الخطوط والأسوار من الحسابات
                    const realWalls = walls.filter(w => !w.kind || w.kind === 'wall');

                        if (realWalls.length === 0) return null;

                            return calculateResults(realWalls, columns, windows, doors, buildingHeight);
                              }, [walls, columns, windows, doors, buildingHeight]);
                              }