export interface Point { x: number; y: number; }
export type WallType = 'exterior' | 'interior';
export type WallKind = 'wall' | 'land-boundary' | 'helper-line' | 'fence';

export interface Wall {
  id: string;
    start: Point;
      end: Point;
        thickness: number;
          curveRadius?: number;
            curveSide?: 1 | -1;
            
          type: WallType;
            normalSign: 1 | -1;
              lockDirection: boolean;
                lockLength: boolean;
                  lockMove: boolean;
                    kind?: WallKind;  // ✅ undefined = 'wall'
                    floor?: number;
                      /** ✅ تقويس زاوية البداية */
                                          roundStartCorner?: boolean;
                                                              /** ✅ تقويس زاوية النهاية */
                                                                                  roundEndCorner?: boolean;
                    }
export interface WallRectangle { start: Point; end: Point; thickness: number; corners: Point[]; faces: { start: Point; end: Point }[]; }
export type ColumnShape = 'rect' | 'circle';

export interface Column {
  id: string;
    position: Point;
      width: number;
        length: number;
          rotation: number;
            center?: Point;
              floor?: number;
                columnShape?: ColumnShape;   // ✅ الشكل (افتراضي: rect)
                }
export interface Window { id: string; wallId: string; position: number; width: number; height: number; thickness: number; center?: Point;
floor?: number; }
export type DoorType = 'regular' | 'main' | 'shop';

export interface Door {
  id: string;
    wallId: string;
      position: number;
        width: number;
          height: number;
            thickness: number;
              center?: Point;
                hinge: 'start' | 'end';
                  swing: 1 | -1;
                    side: 1 | -1;
                      rotation?: number;
                        floor?: number;
                          doorType?: DoorType;   // ✅ نوع الباب
                          }
export interface TextElement { id: string; position: Point; text: string; fontSize: number; color: string; rotation: number; fontFamily?: string;
floor?: number; }
export interface Stair { id: string; polygon: Point[]; center: Point; width: number; totalLength: number; landingLength: number; treadDepth: number; riserHeight: number; rotation: number;
floor?: number; }
export interface NorthArrow { id: string; position: Point; rotation: number; size: number; }
export interface ClipFrame { id: string; x: number; y: number; width: number; height: number; rotation: number; }
export type AppMode = 'view' | 'drawing' | 'edit' | 'dimension' | 'column' | 'window' | 'door' | 'kitchen' | 'bathroom' | 'text' | 'stair' | 'round-corner';
export type DrawingType =
  | 'exterior'
    | 'interior'
      | 'curved-wall'
        | 'land-boundary'
        | 'helper-line'
          | null;
          export type EditType = 'none' | 'move' | 'extendStart' | 'extendEnd';
export interface LockOptions { direction: boolean; length: boolean; move: boolean; }
export interface SnapResult { point: Point; type: 'corner' | 'face'; wallId: string; distance: number; }
export interface CanvasView { zoom: number; offsetX: number; offsetY: number; }
export interface CalculationResults { buildingArea: number; exteriorWallsLength: number; interiorWallsLength: number; exteriorWallsArea: number; interiorWallsArea: number; columnsArea: number; windowsArea: number; doorsArea: number; netExteriorWallsArea: number; netInteriorWallsArea: number; }
export const SNAP_THRESHOLD = 0.10;
export const DEFAULT_COLUMN = { width: 0.2, length: 0.6, rotation: 0 };
export const DEFAULT_WINDOW = { width: 1.2, height: 1.5, thickness: 0.3 };
export const DEFAULT_DOOR = { width: 1.0, height: 2.0, thickness: 0.2, hinge: 'start' as const, swing: 1 as 1 | -1, side: 1 as 1 | -1, rotation: 0 };
export const DEFAULT_TEXT = { fontSize: 0.5, color: '#000000', rotation: 0 };
export const DEFAULT_STAIR = { width: 2.0, totalLength: 3.5, landingLength: 1.0, treadDepth: 0.27, riserHeight: 0.17, rotation: 0 };
export const DEFAULT_NORTH_ARROW = { size: 30, rotation: 0 };
export const DEFAULT_CLIP_FRAME = { width: 6, height: 6 * 1.414, rotation: 0 };

// ✅ إضافة الصورة المستوردة مع الخصائص الجديدة
export interface PlanImage {
  id: string;
  url: string;
  x: number;
  y: number;
  width: number;
  height: number;
  opacity: number;
  rotation?: number;   // ✅ جديد
  locked?: boolean;
  isSelected?: boolean;
}
export interface Axis {
  id: string;
  type: 'vertical' | 'horizontal';
  label: string;        // 'A','B','C' للمحاور الرأسية | '1','2','3' للمحاور الأفقية
  position: number;     // x للمحور الرأسي | y للمحور الأفقي
  center: number;       // y للمحور الرأسي | x للمحور الأفقي (مركز الخط)
  length: number;       // طول خط المحور
  offset: number;  
  
  floor?: number;
  // الإزاحة العمودية (موجب = يمين/أعلى)
}
// ✅ عنصر سلم فردي (جديد - لا يمس Stair القديم)
export interface StairElement {
  id: string;
  type: 'step' | 'landing';
  position: Point;      // مركز العنصر
  width: number;        // العرض
  length: number;       // الطول (اتجاه الصعود)
  rotation: number;     // زاوية الدوران
  // خاص بالسحبة (step):
  treadDepth?: number;  // عمق الدرجة
  riserHeight?: number; // ارتفاع الدرجة
  stepCount?: number;   // عدد الدرجات (يُحسب من length/treadDepth)
    // ✅ قفل العنصر (يمنع تحديده/تحريكه)
      locked?: boolean;
        floor?: number;
          /** ✅ منسوب العنصر عن الأرض (م) — يُستخدم لترتيب السحبات والبسطات */
            elevation?: number;
            }
// ✅ ثوابت الخطوط الجديدة
export const LAND_BOUNDARY_THICKNESS = 0.05;
export const HELPER_LINE_THICKNESS = 0.02;
export const FENCE_THICKNESS = 0.20;

// ✅ ألوان الخطوط
export const WALL_KIND_COLORS = {
    wall: '#333',
      'land-boundary': '#2e7d32',
        'helper-line': '#2196f3',
          fence: '#444',
          } as const;
// ✅ ركن مقوس حقيقي (بين جدارين)
export interface RoundedCorner {
  id: string;
    wallAId: string;
      wallBId: string;
        radius: number;   // بالمتر
        }