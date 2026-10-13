import React from 'react';
import * as THREE from 'three';
import type { Wall, Door } from '../../core/types';
import { INTERIOR_PAINT_COLOR } from './helpers/wallHelpers';
interface Props {
  wall: Wall;
    door: Door;
      matProps: any;
        isInterior: boolean;
          /** ✅ ارتفاع الباب عن الأرض (يُرفع الحشو معه) */
            elevation?: number;
            }
            const ARCH_RATIO = 0.22;
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
                                        export const MainDoorWallFiller: React.FC<Props> = ({
                                          wall,
                                            door,
                                              matProps,
                                                isInterior,
                                                  elevation = 0,
                                                  }) => {
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
                                                                                          const geometries = React.useMemo(() => {
                                                                                              const rH_hole = rH - 0.001;
                                                                                                  const rV_hole = rV - 0.001;
                                                                                                      const left = new THREE.Shape();
                                                                                                          left.moveTo(-rH, archBase);
                                                                                                              left.lineTo(-rH, H);
                                                                                                                  left.lineTo(0, H);
                                                                                                                      left.absellipse(0, archBase, rH_hole, rV_hole, Math.PI / 2, Math.PI, false);
                                                                                                                          left.closePath();
                                                                                                                              const right = new THREE.Shape();
                                                                                                                                  right.moveTo(rH, archBase);
                                                                                                                                      right.lineTo(rH, H);
                                                                                                                                          right.lineTo(0, H);
                                                                                                                                              right.absellipse(0, archBase, rH_hole, rV_hole, Math.PI / 2, 0, true);
                                                                                                                                                  right.closePath();
                                                                                                                                                      const leftGeom = new THREE.ExtrudeGeometry(left, {
                                                                                                                                                            depth: wall.thickness,
                                                                                                                                                                  bevelEnabled: false,
                                                                                                                                                                        curveSegments: 64,
                                                                                                                                                                            });
                                                                                                                                                                                leftGeom.translate(0, 0, -wall.thickness / 2);
                                                                                                                                                                                    const rightGeom = new THREE.ExtrudeGeometry(right, {
                                                                                                                                                                                          depth: wall.thickness,
                                                                                                                                                                                                bevelEnabled: false,
                                                                                                                                                                                                      curveSegments: 64,
                                                                                                                                                                                                          });
                                                                                                                                                                                                              rightGeom.translate(0, 0, -wall.thickness / 2);
                                                                                                                                                                                                                  return [leftGeom, rightGeom];
                                                                                                                                                                                                                    }, [rH, rV, archBase, H, wall.thickness]);
                                                                                                                                                                                                                      const mat = React.useMemo(() => {
                                                                                                                                                                                                                          if (isInterior) {
                                                                                                                                                                                                                                return new THREE.MeshStandardMaterial({
                                                                                                                                                                                                                                        color: INTERIOR_PAINT_COLOR,
                                                                                                                                                                                                                                                roughness: 0.9,
                                                                                                                                                                                                                                                        metalness: 0.0,
                                                                                                                                                                                                                                                                side: THREE.DoubleSide,
                                                                                                                                                                                                                                                                      });
                                                                                                                                                                                                                                                                          }
                                                                                                                                                                                                                                                                              return new THREE.MeshStandardMaterial({
                                                                                                                                                                                                                                                                                    color: matProps.color || '#FFFFFF',
                                                                                                                                                                                                                                                                                          roughness: matProps.roughness,
                                                                                                                                                                                                                                                                                                metalness: matProps.metalness,
                                                                                                                                                                                                                                                                                                      side: THREE.DoubleSide,
                                                                                                                                                                                                                                                                                                          });
                                                                                                                                                                                                                                                                                                            }, [matProps, isInterior]);
                                                                                                                                                                                                                                                                                                              return (
                                                                                                                                                                                                                                                                                                                  <group position={[midX, elevation, midY]} rotation={[0, rotationY, 0]}>
                                                                                                                                                                                                                                                                                                                        <mesh>
                                                                                                                                                                                                                                                                                                                                <primitive object={geometries[0]} attach="geometry" />
                                                                                                                                                                                                                                                                                                                                        <primitive object={mat} attach="material" />
                                                                                                                                                                                                                                                                                                                                              </mesh>
                                                                                                                                                                                                                                                                                                                                                    <mesh>
                                                                                                                                                                                                                                                                                                                                                            <primitive object={geometries[1]} attach="geometry" />
                                                                                                                                                                                                                                                                                                                                                                    <primitive object={mat} attach="material" />
                                                                                                                                                                                                                                                                                                                                                                          </mesh>
                                                                                                                                                                                                                                                                                                                                                                              </group>
                                                                                                                                                                                                                                                                                                                                                                                );
                                                                                                                                                                                                                                                                                                                                                                                };