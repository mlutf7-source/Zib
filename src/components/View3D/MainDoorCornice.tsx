import React from 'react';
import * as THREE from 'three';
import type { Wall, Door } from '../../core/types';
interface Props {
  wall: Wall;
    door: Door;
      color?: string;
        visible?: boolean;
          /** ✅ ارتفاع الباب عن الأرض (يُرفع الكورنيش معه) */
            elevation?: number;
            }
            const CORNICE_DEPTH = 0.15;
            const CORNICE_WIDTH = 0.10;
            const ARCH_RATIO = 0.22;
            const ARCH_SEGMENTS = 48;
            function getOpeningStart(
              el: { position: number; width: number; center?: { x: number; y: number } },
                wall: Wall,
                ): number {
                  if (!el.center) return el.position;
                    const dx = wall.end.x - wall.start.x;
                      const dy = wall.end.y - wall.start.y;
                        const len = Math.hypot(dx, dy) || 1;
                          const ux = dx / len;
                            const uy = dy / len;
                              const centerAlong =
                                  (el.center.x - wall.start.x) * ux +
                                      (el.center.y - wall.start.y) * uy;
                                        return centerAlong - el.width / 2;
                                        }
                                        export const MainDoorCornice: React.FC<Props> = ({
                                          wall,
                                            door,
                                              color = '#EFE9DC',
                                                visible = true,
                                                  elevation = 0,
                                                  }) => {
                                                    if (!visible) return null;
                                                      const dx = wall.end.x - wall.start.x;
                                                        const dy = wall.end.y - wall.start.y;
                                                          const len = Math.hypot(dx, dy) || 1;
                                                            const ux = dx / len;
                                                              const uy = dy / len;
                                                                const nx = -uy;
                                                                  const ny = ux;
                                                                    const sign = wall.normalSign ?? 1;
                                                                      const halfTh = wall.thickness / 2;
                                                                        const openingStart = getOpeningStart(door, wall);
                                                                          const midDist = openingStart + door.width / 2;
                                                                            const midX = wall.start.x + ux * midDist + nx * halfTh * sign;
                                                                              const midY = wall.start.y + uy * midDist + ny * halfTh * sign;
                                                                                const rotationY = Math.atan2(-uy, ux);
                                                                                  const W = door.width;
                                                                                    const H = door.height;
                                                                                      const rH = W / 2;
                                                                                        const rV = H * ARCH_RATIO;
                                                                                          const archBase = H - rV;
                                                                                            const corniceLocalZ = halfTh + CORNICE_DEPTH / 2;
                                                                                              const material = React.useMemo(
                                                                                                  () =>
                                                                                                        new THREE.MeshStandardMaterial({
                                                                                                                color,
                                                                                                                        roughness: 0.4,
                                                                                                                                metalness: 0.05,
                                                                                                                                      }),
                                                                                                                                          [color],
                                                                                                                                            );
                                                                                                                                              const sideColumnHeight = archBase;
                                                                                                                                                const sideColumnCenterY = sideColumnHeight / 2;
                                                                                                                                                  const sillWidth = W + CORNICE_WIDTH * 2;
                                                                                                                                                    return (
                                                                                                                                                        <group position={[midX, elevation, midY]} rotation={[0, rotationY, 0]}>
                                                                                                                                                              {/* العمود الأيسر */}
                                                                                                                                                                    <mesh
                                                                                                                                                                            position={[-W / 2 - CORNICE_WIDTH / 2, sideColumnCenterY, corniceLocalZ]}
                                                                                                                                                                                    material={material}
                                                                                                                                                                                          >
                                                                                                                                                                                                  <boxGeometry args={[CORNICE_WIDTH, sideColumnHeight, CORNICE_DEPTH]} />
                                                                                                                                                                                                        </mesh>
                                                                                                                                                                                                              {/* العمود الأيمن */}
                                                                                                                                                                                                                    <mesh
                                                                                                                                                                                                                            position={[W / 2 + CORNICE_WIDTH / 2, sideColumnCenterY, corniceLocalZ]}
                                                                                                                                                                                                                                    material={material}
                                                                                                                                                                                                                                          >
                                                                                                                                                                                                                                                  <boxGeometry args={[CORNICE_WIDTH, sideColumnHeight, CORNICE_DEPTH]} />
                                                                                                                                                                                                                                                        </mesh>
                                                                                                                                                                                                                                                              {/* العتبة السفلية */}
                                                                                                                                                                                                                                                                    <mesh
                                                                                                                                                                                                                                                                            position={[0, CORNICE_WIDTH / 2, corniceLocalZ]}
                                                                                                                                                                                                                                                                                    material={material}
                                                                                                                                                                                                                                                                                          >
                                                                                                                                                                                                                                                                                                  <boxGeometry args={[sillWidth, CORNICE_WIDTH, CORNICE_DEPTH]} />
                                                                                                                                                                                                                                                                                                        </mesh>
                                                                                                                                                                                                                                                                                                              {/* القوس العلوي */}
                                                                                                                                                                                                                                                                                                                    <group position={[0, archBase, corniceLocalZ]}>
                                                                                                                                                                                                                                                                                                                            {Array.from({ length: ARCH_SEGMENTS }).map((_, i) => {
                                                                                                                                                                                                                                                                                                                                      const t = ((i + 0.5) / ARCH_SEGMENTS) * Math.PI;
                                                                                                                                                                                                                                                                                                                                                const xMid = (rH + CORNICE_WIDTH / 2) * Math.cos(t);
                                                                                                                                                                                                                                                                                                                                                          const yMid = (rV + CORNICE_WIDTH / 2) * Math.sin(t);
                                                                                                                                                                                                                                                                                                                                                                    const dxT = -rH * Math.sin(t);
                                                                                                                                                                                                                                                                                                                                                                              const dyT = rV * Math.cos(t);
                                                                                                                                                                                                                                                                                                                                                                                        const tangentAngle = Math.atan2(dyT, dxT);
                                                                                                                                                                                                                                                                                                                                                                                                  const segLen =
                                                                                                                                                                                                                                                                                                                                                                                                              (Math.PI * (rH + rV) / 2) * 1.3 / ARCH_SEGMENTS;
                                                                                                                                                                                                                                                                                                                                                                                                                        return (
                                                                                                                                                                                                                                                                                                                                                                                                                                    <mesh
                                                                                                                                                                                                                                                                                                                                                                                                                                                  key={`cornice-seg-${i}`}
                                                                                                                                                                                                                                                                                                                                                                                                                                                                position={[xMid, yMid, 0]}
                                                                                                                                                                                                                                                                                                                                                                                                                                                                              rotation={[0, 0, tangentAngle]}
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            material={material}
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        >
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      <boxGeometry args={[segLen, CORNICE_WIDTH, CORNICE_DEPTH]} />
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  </mesh>
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            );
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    })}
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          </group>
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              </group>
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                );
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                };