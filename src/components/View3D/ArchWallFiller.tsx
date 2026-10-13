import React from 'react';
import * as THREE from 'three';
import type { Wall, Window as WindowType } from '../../core/types';
import { getArchWindowGeometry } from '../../core/wallSegments3D';
import { INTERIOR_PAINT_COLOR } from './helpers/wallHelpers';
import { useSectionPlanes } from './SectionContext';
interface Props {
  wall: Wall;
    win: WindowType;
      viewHeight: number;
        matProps: any;
          isInterior: boolean;
          }

          export const ArchWallFiller: React.FC<Props> = ({
            wall,
              win,
                viewHeight,
                  matProps,
                    isInterior,
                    }) => {
                      const data = React.useMemo(
                          () => getArchWindowGeometry(wall, win),
                              [wall, win],
                                );

                                  const { midX, midY, rotationY, W, H, rH, rV, archBase, sillHeight } = data;

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

                                                                                                                const clippingPlanes = useSectionPlanes();
                                                                                                                const mat = React.useMemo(() => {
                                                                                                                  if (isInterior) {
                                                                                                                      return new THREE.MeshStandardMaterial({
                                                                                                                            color: INTERIOR_PAINT_COLOR,
                                                                                                                                  roughness: 0.9,
                                                                                                                                        metalness: 0.0,
                                                                                                                                              side: THREE.DoubleSide,
                                                                                                                                                    clippingPlanes,
                                                                                                                                                        });
                                                                                                                                                          }
                                                                                                                                                            return new THREE.MeshStandardMaterial({
                                                                                                                                                                color: matProps.color || '#FFFFFF',
                                                                                                                                                                    roughness: matProps.roughness,
                                                                                                                                                                        metalness: matProps.metalness,
                                                                                                                                                                            side: THREE.DoubleSide,
                                                                                                                                                                                clippingPlanes,
                                                                                                                                                                                  });
                                                                                                                                                                                  }, [matProps, isInterior, clippingPlanes]);                                                
                  
                                                                                                                                                                                                                                                        if (sillHeight + H > viewHeight) return null;

                                                                                                                                                                                                                                                          return (
                                                                                                                                                                                                                                                              <group position={[midX, sillHeight, midY]} rotation={[0, rotationY, 0]}>
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