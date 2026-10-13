import type { Wall } from '../../../core/types';
import type { WallMaterialType } from '../view3dTypes';
export const INTERIOR_PAINT_COLOR = '#F2EFE8';
// ✅ خصائص مواد الجدار حسب النوع
export function getWallMaterialProps(material: WallMaterialType, userColor: string) {
  switch (material) {
      case 'marble':
            return { color: userColor || '#FFFFFF', roughness: 0.15, metalness: 0.1 };
                case 'block':
                      return { color: userColor || '#FFFFFF', roughness: 0.9, metalness: 0.0 };
                          case 'stone':
                                return { color: userColor || '#FFFFFF', roughness: 1.0, metalness: 0.0 };
                                    case 'plain':
                                        default:
                                              return { color: userColor || '#FFFFFF', roughness: 0.6, metalness: 0.05 };
                                                }
                                                }
                                                // ✅ فصل جدران السور عن الجدران العادية
                                                export function partitionWalls(walls: Wall[]) {
                                                  const fenceWalls: Wall[] = [];
                                                    const normalWalls: Wall[] = [];
                                                      for (const w of walls) {
                                                          if (w.kind === 'fence') fenceWalls.push(w);
                                                              else normalWalls.push(w);
                                                                }
                                                                  return { fenceWalls, normalWalls };
                                                                  }