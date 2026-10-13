import React, { useState } from 'react';
import { StructureInputs } from './StructureInputs';
import { StructureTables } from './StructureTables';
import type { Wall } from '../../core/types';
import { distance } from '../../core/geometry';

interface Props {
  walls: Wall[];
  }

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

                          export const StructurePage: React.FC<Props> = ({ walls }) => {
                            const [designFloors, setDesignFloors] = useState(4);
                              const [buildFloors, setBuildFloors] = useState(1);
                                const [results, setResults] = useState<StructureResults | null>(null);

const calculate = () => {
      // ✅ استثناء الخطوط والأسوار
          const realWalls = walls.filter(w => !w.kind || w.kind === 'wall');
              const extWalls = realWalls.filter(w => w.type === 'exterior');
                                         let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
                                              extWalls.forEach(w => {
                                                    minX = Math.min(minX, w.start.x, w.end.x);
                                                          maxX = Math.max(maxX, w.start.x, w.end.x);
                                                                minY = Math.min(minY, w.start.y, w.end.y);
                                                                      maxY = Math.max(maxY, w.start.y, w.end.y);
                                                                          });
                                                                              const area = Math.max(0, (maxX - minX) * (maxY - minY));
                                                                                  const perimeter = extWalls.reduce((s, w) => s + distance(w.start, w.end), 0);

const totalWallsLength = realWalls.reduce((s, w) => s + distance(w.start, w.end), 0);
                                                                                          const FH = 3;
                                                                                              const DF = designFloors;
                                                                                                  const BF = buildFloors;

                                                                                                      const totalLoad = area * 1.5 * DF;
                                                                                                          const footingArea = totalLoad / 20;
                                                                                                              const footingConcrete = footingArea * 0.5;
                                                                                                                  // ✅ حذف levelingConcrete (خرسانة النظافة)
                                                                                                                      const footingSteel = footingConcrete * 0.090;

                                                                                                                          const colW = DF <= 2 ? 0.25 : DF <= 4 ? 0.30 : 0.35;
                                                                                                                              const colL = DF <= 2 ? 0.60 : DF <= 4 ? 0.70 : 0.80;
                                                                                                                                  const columnCount = Math.ceil(area / 9);
                                                                                                                                      const columnConcrete = columnCount * colW * colL * FH * BF;
                                                                                                                                          const columnSteel = columnConcrete * 0.150;

                                                                                                                                              const neckConcrete = columnCount * colW * colL * 1.5;
                                                                                                                                                  const neckSteel = neckConcrete * 0.150;

                                                                                                                                                      const middConcrete = totalWallsLength * 0.27 * 0.4;
                                                                                                                                                          const mainSteel = (totalWallsLength * 7) / 12 / 52;
                                                                                                                                                              const stirrupSteel = (totalWallsLength * 1.3 * 6) / 12 / 200;
                                                                                                                                                                  const middSteel = mainSteel + stirrupSteel;

                                                                                                                                                                      const slabSteel = (area / 30) * BF;
                                                                                                                                                                          const slabConcrete = area * 0.22 * BF;

                                                                                                                                                                              // ✅ تصحيح الإجمالي: إزالة levelingConcrete من الإجمالي
                                                                                                                                                                                  const totalConcrete = footingConcrete + neckConcrete + columnConcrete + middConcrete + slabConcrete;
                                                                                                                                                                                      const totalSteel = footingSteel + neckSteel + columnSteel + middSteel + slabSteel;

                                                                                                                                                                                          const newResults: StructureResults = {
                                                                                                                                                                                                footingConcrete,
                                                                                                                                                                                                      footingSteel,
                                                                                                                                                                                                            neckConcrete,
                                                                                                                                                                                                                  neckSteel,
                                                                                                                                                                                                                        columnConcrete,
                                                                                                                                                                                                                              columnSteel,
                                                                                                                                                                                                                                    middConcrete,
                                                                                                                                                                                                                                          middSteel,
                                                                                                                                                                                                                                                slabConcrete,
                                                                                                                                                                                                                                                      slabSteel,
                                                                                                                                                                                                                                                            totalConcrete,
                                                                                                                                                                                                                                                                  totalSteel,
                                                                                                                                                                                                                                                                      };

                                                                                                                                                                                                                                                                          setResults(newResults);
                                                                                                                                                                                                                                                                              localStorage.setItem('structure_results', JSON.stringify(newResults));
                                                                                                                                                                                                                                                                                };

                                                                                                                                                                                                                                                                                  return (
                                                                                                                                                                                                                                                                                      <div style={{ padding: 12 }}>
                                                                                                                                                                                                                                                                                            <StructureInputs
                                                                                                                                                                                                                                                                                                    designFloors={designFloors}
                                                                                                                                                                                                                                                                                                            buildFloors={buildFloors}
                                                                                                                                                                                                                                                                                                                    onDesignFloorsChange={setDesignFloors}
                                                                                                                                                                                                                                                                                                                            onBuildFloorsChange={setBuildFloors}
                                                                                                                                                                                                                                                                                                                                    onCalculate={calculate}
                                                                                                                                                                                                                                                                                                                                          />

                                                                                                                                                                                                                                                                                                                                                {results && (
                                                                                                                                                                                                                                                                                                                                                        <StructureTables results={results} />
                                                                                                                                                                                                                                                                                                                                                              )}
                                                                                                                                                                                                                                                                                                                                                                  </div>
                                                                                                                                                                                                                                                                                                                                                                    );
                                                                                                                                                                                                                                                                                                                                                                    };