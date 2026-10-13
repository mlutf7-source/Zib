export type WallMaterialType = 'plain' | 'marble' | 'block' | 'stone';
export type WindowStyleType = 'rect' | 'arch';
export type StreetSide = 'north' | 'south' | 'east' | 'west';
export interface View3DSettings {
  floorHeight: number;
    sectionHeight: number;
      showGrid: boolean;
        showFloor: boolean;
          wallColor: string;
            wallMaterial: WallMaterialType;
              doorColor: string;
                doorOpenAngle: number;
                  windowFrameColor: string;
                    windowGlassColor: string;
                      windowGlassOpacity: number;
                        windowStyle: WindowStyleType;
                          windowSashCols: number;
                            windowSashRows: number;
                              showCornice: boolean;
                                corniceColor: string;
                                  // ✅ لون مقطع الجدران والأعمدة عند القص
                                    cutSectionColor: string;
                                      // ✅ نطاق العرض: 'all' = كل الأدوار، أو رقم دور محدد
                                        displayFloor: 'all' | number;
                                          // ✅ إعدادات لكل دور (تجاوزات)
                                            floorOverrides: Record<number, Partial<View3DSettings>>;
                                              // ✅ إعدادات الأبواب — باب المحل (شتر)
                                                shopDoorColor: string;
                                                  shopDoorSlatCount: number;
                                                    shopBaseColor: string;
                                                      // ✅ إعدادات الأبواب — الباب الرئيسي (ليزر كت)
                                                        mainDoorFrameColor: string;
                                                          mainDoorSheetColor: string;
                                                            mainDoorPatternColor: string;
                                                              // ✅ إعدادات السقف (المرد)
                                                                showSlab: boolean;
                                                                  slabThickness: number;
                                                                    slabColor: string;
                                                                      slabBorderColor: string;
                                                                        slabBorderJointSpacing: number;
                                                                          slabBorderProtrusion: number;
                                                                            // ✅ إعدادات سور محيط الأرض
                                                                              showFence: boolean;
                                                                                fenceHeight: number;
                                                                                  fenceMaterial: WallMaterialType;
                                                                                    fenceColor: string;
                                                                                      // ✅ الأعمدة
                                                                                        columnColor: string;
                                                                                          columnRoughness: number;
                                                                                            columnMetalness: number;
                                                                                              // ✅ الأرضية والشوارع
                                                                                                groundTileColor: string;
                                                                                                  streetColor: string;
                                                                                                    streetSides: StreetSide[];
                                                                                                      sidewalkWidth: number;
                                                                                                        sidewalkRaised: number;
                                                         streetWidth: number;   // ✅ عرض الشارع
                                                                                                          // ✅ ارتفاع الأبواب عن منسوب الشارع
                                                                                                            shopDoorElevation: number;
                                                                                                              mainDoorElevation: number;
                                                                                                              // ✅ إضاءة تحت السقف (لإبراز البلكونات والبروز)
                                                                                                              showBalconyLight: boolean;
                                                                                                              balconyLightColor: string;
                                                                                                              balconyLightIntensity: number;
                                                                                                              }
                                                                                                              export const DEFAULT_VIEW3D_SETTINGS: View3DSettings = {
                                                                                                                floorHeight: 3,
                                                                                                                  sectionHeight: 0,
                                                                                                                    showGrid: true,
                                                                                                                      showFloor: true,
                                                                                                                        wallColor: '#FFFFFF',
                                                                                                                          wallMaterial: 'plain',
                                                                                                                            doorColor: '#8B5A2B',
                                                                                                                              doorOpenAngle: 80,
                                                                                                                                windowFrameColor: '#000000',
                                                                                                                                  windowGlassColor: '#87CEEB',
                                                                                                                                    windowGlassOpacity: 0.90,
                                                                                                                                      windowStyle: 'rect',
                                                                                                                                        windowSashCols: 2,
                                                                                                                                          windowSashRows: 2,
                                                                                                                                            showCornice: true,
                                                                                                                                              corniceColor: '#F5F0E8',
                                                                                                                                                cutSectionColor: '#B0B0B0',
                                                                                                                                                  displayFloor: 'all',
                                                                                                                                                    floorOverrides: {},
                                                                                                                                                      // ✅ افتراضيات باب المحل (شتر)
                                                                                                                                                        shopDoorColor: '#9a9a9a',
                                                                                                                                                          shopDoorSlatCount: 20,
                                                                                                                                                            shopBaseColor: '#E8E4DC',
                                                                                                                                                              // ✅ افتراضيات الباب الرئيسي (ليزر كت)
                                                                                                                                                                mainDoorFrameColor: '#9a9a9a',
                                                                                                                                                                  mainDoorSheetColor: '#1a1a1a',
                                                                                                                                                                    mainDoorPatternColor: '#e8e8e8',
                                                                                                                                                                      // ✅ افتراضيات السقف (المرد)
                                                                                                                                                                        showSlab: true,
                                                                                                                                                                          slabThickness: 0.30,
                                                                                                                                                                            slabColor: '#d9d4c8',
                                                                                                                                                                              slabBorderColor: '#f5f0e8',
                                                                                                                                                                                slabBorderJointSpacing: 0.20,
                                                                                                                                                                                  slabBorderProtrusion: 0.03,
                                                                                                                                                                                    // ✅ افتراضيات السور
                                                                                                                                                                                      showFence: true,
                                                                                                                                                                                        fenceHeight: 2.5,
                                                                                                                                                                                          fenceMaterial: 'plain',
                                                                                                                                                                                            fenceColor: '#E8E4DC',
                                                                                                                                                                                              // ✅ افتراضيات الأعمدة
                                                                                                                                                                                                columnColor: '#9a9a9a',
                                                                                                                                                                                                  columnRoughness: 0.6,
                                                                                                                                                                                                    columnMetalness: 0.05,
                                                                                                                                                                                                      // ✅ افتراضيات الأرضية والشوارع
                                                                                                                                                                                                        groundTileColor: '#c8c4bc',
                                                                                                                                                                                                          streetColor: '#3a3a3a',
                                                                                                                                                                                                            streetSides: [],
                                                                                                                                                                                                              sidewalkWidth: 2.0,
                                                                                                                                                                                                                sidewalkRaised: 0.15,
                                                           streetWidth: 6.0,    
                                                                                                                                                                                                              // ✅ افتراضيات ارتفاع الأبواب
                                                                                                                                                                                                                    shopDoorElevation: 0.15,
                                                                                                                                                                                                                      mainDoorElevation: 0.15,
                                                                                                                                                                                                                      showBalconyLight: true,
                                                                                                                                                                                                                      balconyLightColor: '#FFE6A8',
                                                                                                                                                                                                                      balconyLightIntensity: 2.5,
                                                                                                                                                                                                                      };
                                                                                                                                                                                                                      // ✅ ألوان جاهزة للاختيار السريع
                                                                                                                                                                                                                      export const COLOR_PALETTE = [
                                                                                                                                                                                                                        '#FFFFFF', '#F5F0E8', '#FFF8DC', '#EDE9E0',
                                                                                                                                                                                                                          '#F0F0F0', '#D9D9D9', '#B0B0B0', '#808080',
                                                                                                                                                                                                                            '#4A4A4A', '#1A1A1A', '#000000', '#1A2A4A',
                                                                                                                                                                                                                              '#8B5A2B', '#A0522D', '#D2B48C', '#F5DEB3',
                                                                                                                                                                                                                                '#87CEEB', '#A0C8E0', '#B0D4E8', '#E8F0F5',
                                                                                                                                                                                                                                  '#F5E6D3', '#E8E0D0', '#D4C5B0', '#C4A57B',
                                                                                                                                                                                                                                  ];
                                                                                                                                                                                                                                  // ============================================================
                                                                                                                                                                                                                                  // ✅ دوال مساعدة لإعدادات كل دور (floorOverrides)
                                                                                                                                                                                                                                  // ============================================================
                                                                                                                                                                                                                                  /**
                                                                                                                                                                                                                                   * ✅ حلّ الإعدادات الفعلية لدور محدد:
                                                                                                                                                                                                                                    * يبدأ من الإعدادات العامة (global) ثم يطبّق تجاوزات الدور فوقها.
                                                                                                                                                                                                                                     */
                                                                                                                                                                                                                                     export function resolveSettingsForFloor(
                                                                                                                                                                                                                                       global: View3DSettings,
                                                                                                                                                                                                                                         floor: number,
                                                                                                                                                                                                                                         ): View3DSettings {
                                                                                                                                                                                                                                           const override = global.floorOverrides?.[floor];
                                                                                                                                                                                                                                             if (!override) return global;
                                                                                                                                                                                                                                               return { ...global, ...override, floorOverrides: global.floorOverrides };
                                                                                                                                                                                                                                               }
                                                                                                                                                                                                                                               /**
                                                                                                                                                                                                                                                * ✅ هل هذا الدور له تجاوزات خاصة؟
                                                                                                                                                                                                                                                 */
                                                                                                                                                                                                                                                 export function hasFloorOverride(
                                                                                                                                                                                                                                                   settings: View3DSettings,
                                                                                                                                                                                                                                                     floor: number,
                                                                                                                                                                                                                                                     ): boolean {
                                                                                                                                                                                                                                                       const o = settings.floorOverrides?.[floor];
                                                                                                                                                                                                                                                         return !!o && Object.keys(o).length > 0;
                                                                                                                                                                                                                                                         }
                                                                                                                                                                                                                                                         /**
                                                                                                                                                                                                                                                          * ✅ حذف تجاوزات دور محدد
                                                                                                                                                                                                                                                           */
                                                                                                                                                                                                                                                           export function clearFloorOverride(
                                                                                                                                                                                                                                                             settings: View3DSettings,
                                                                                                                                                                                                                                                               floor: number,
                                                                                                                                                                                                                                                               ): View3DSettings {
                                                                                                                                                                                                                                                                 const next = { ...settings.floorOverrides };
                                                                                                                                                                                                                                                                   delete next[floor];
                                                                                                                                                                                                                                                                     return { ...settings, floorOverrides: next };
                                                                                                                                                                                                                                                                     }