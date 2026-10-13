import React from 'react';
import type { Column } from '../../core/types';
import { useSectionPlanes } from './SectionContext';
interface Props {
  column: Column;
    height: number;
      /** ✅ لون جسم العمود (نفس لون الجدار) */
        bodyColor?: string;
          /** ✅ لون المقطع عند القص (رمادي) */
            cutColor?: string;
              /** ✅ هل الدور مقطوع؟ */
                isCut?: boolean;
                  roughness?: number;
                    metalness?: number;
                    }
                    export const Column3D: React.FC<Props> = ({
                      column,
                        height,
                          bodyColor = '#9a9a9a',
                            cutColor = '#B0B0B0',
                              isCut = false,
                                roughness = 0.6,
                                  metalness = 0.05,
                                  }) => {
                                    const clippingPlanes = useSectionPlanes();
                                      const cx = column.position.x;
                                        const cz = column.position.y;
                                          const isCircle = column.columnShape === 'circle';
                                            // ✅ الوجه العلوي: رمادي عند القص، وإلا نفس لون الجسم
                                              const topColor = isCut ? cutColor : bodyColor;
                                                const topRoughness = isCut ? 0.95 : roughness;
                                                  const topMetalness = isCut ? 0.0 : metalness;
                                                    if (isCircle) {
                                                        const radius = column.width / 2;
                                                            return (
                                                                  <mesh position={[cx, height / 2, cz]} castShadow>
                                                                          <cylinderGeometry args={[radius, radius, height, 32]} />
                                                                                  {/* 0: جانب */}
                                                                                          <meshStandardMaterial
                                                                                                    attach="material-0"
                                                                                                              color={bodyColor}
                                                                                                                        roughness={roughness}
                                                                                                                                  metalness={metalness}
                                                                                                                                            clippingPlanes={clippingPlanes}
                                                                                                                                                    />
                                                                                                                                                            {/* 1: علوي */}
                                                                                                                                                                    <meshStandardMaterial
                                                                                                                                                                              attach="material-1"
                                                                                                                                                                                        color={topColor}
                                                                                                                                                                                                  roughness={topRoughness}
                                                                                                                                                                                                            metalness={topMetalness}
                                                                                                                                                                                                                      clippingPlanes={clippingPlanes}
                                                                                                                                                                                                                              />
                                                                                                                                                                                                                                      {/* 2: سفلي */}
                                                                                                                                                                                                                                              <meshStandardMaterial
                                                                                                                                                                                                                                                        attach="material-2"
                                                                                                                                                                                                                                                                  color={bodyColor}
                                                                                                                                                                                                                                                                            roughness={roughness}
                                                                                                                                                                                                                                                                                      metalness={metalness}
                                                                                                                                                                                                                                                                                                clippingPlanes={clippingPlanes}
                                                                                                                                                                                                                                                                                                        />
                                                                                                                                                                                                                                                                                                              </mesh>
                                                                                                                                                                                                                                                                                                                  );
                                                                                                                                                                                                                                                                                                                    }
                                                                                                                                                                                                                                                                                                                      return (
                                                                                                                                                                                                                                                                                                                          <mesh
                                                                                                                                                                                                                                                                                                                                position={[cx, height / 2, cz]}
                                                                                                                                                                                                                                                                                                                                      rotation={[0, -(column.rotation || 0), 0]}
                                                                                                                                                                                                                                                                                                                                            castShadow
                                                                                                                                                                                                                                                                                                                                                >
                                                                                                                                                                                                                                                                                                                                                      <boxGeometry args={[column.width, height, column.length]} />
                                                                                                                                                                                                                                                                                                                                                            <meshStandardMaterial attach="material-0" color={bodyColor} roughness={roughness} metalness={metalness} clippingPlanes={clippingPlanes} />
                                                                                                                                                                                                                                                                                                                                                                  <meshStandardMaterial attach="material-1" color={bodyColor} roughness={roughness} metalness={metalness} clippingPlanes={clippingPlanes} />
                                                                                                                                                                                                                                                                                                                                                                        <meshStandardMaterial attach="material-2" color={topColor} roughness={topRoughness} metalness={topMetalness} clippingPlanes={clippingPlanes} />
                                                                                                                                                                                                                                                                                                                                                                              <meshStandardMaterial attach="material-3" color={bodyColor} roughness={roughness} metalness={metalness} clippingPlanes={clippingPlanes} />
                                                                                                                                                                                                                                                                                                                                                                                    <meshStandardMaterial attach="material-4" color={bodyColor} roughness={roughness} metalness={metalness} clippingPlanes={clippingPlanes} />
                                                                                                                                                                                                                                                                                                                                                                                          <meshStandardMaterial attach="material-5" color={bodyColor} roughness={roughness} metalness={metalness} clippingPlanes={clippingPlanes} />
                                                                                                                                                                                                                                                                                                                                                                                              </mesh>
                                                                                                                                                                                                                                                                                                                                                                                                );
                                                                                                                                                                                                                                                                                                                                                                                                };