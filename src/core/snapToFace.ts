import type { Point, Wall, SnapResult } from './types';
import { distance, closestPointOnSegment, wallRectangle } from './geometry';
import { getCurvedWallGeometry } from './curvedWallGeometry';

const CORNER_SNAP = 0.30;
const FACE_SNAP = 0.05;
const ARC_SEGMENTS = 24;

function snapCurvedWall(
  pt: Point,
  wall: Wall,
  bestCorner: SnapResult | null,
  bestCornerDist: number,
  bestFace: SnapResult | null,
  bestFaceDist: number,
): { bestCorner: SnapResult | null; bestCornerDist: number; bestFace: SnapResult | null; bestFaceDist: number } {
  const geo = getCurvedWallGeometry(wall);
  if (!geo) return { bestCorner, bestCornerDist, bestFace, bestFaceDist };

  const span = geo.anticlockwise ? geo.startAngle - geo.endAngle : geo.endAngle - geo.startAngle;
  const dir = geo.anticlockwise ? -1 : 1;

  const outerPts: Point[] = [];
  const innerPts: Point[] = [];
  const midPts: Point[] = [];

  for (let i = 0; i <= ARC_SEGMENTS; i++) {
    const angle = geo.startAngle + dir * span * (i / ARC_SEGMENTS);
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    outerPts.push({ x: geo.center.x + cos * geo.outerRadius, y: geo.center.y + sin * geo.outerRadius });
    innerPts.push({ x: geo.center.x + cos * geo.innerRadius, y: geo.center.y + sin * geo.innerRadius });
    midPts.push({ x: geo.center.x + cos * geo.radius, y: geo.center.y + sin * geo.radius });
  }

  // Corner snap points: outer/inner arc endpoints + mid-thickness endpoints
  const cornerPts = [outerPts[0], outerPts[ARC_SEGMENTS], innerPts[0], innerPts[ARC_SEGMENTS], midPts[0], midPts[ARC_SEGMENTS]];
  for (const corner of cornerPts) {
    const d = distance(pt, corner);
    if (d <= bestCornerDist) {
      bestCornerDist = d;
      bestCorner = { point: corner, type: 'corner', wallId: wall.id, distance: d };
    }
  }

  // Face snap: outer arc, inner arc, and midline as polyline segments
  for (const polyline of [outerPts, innerPts, midPts]) {
    for (let i = 0; i < polyline.length - 1; i++) {
      const cp = closestPointOnSegment(pt, polyline[i], polyline[i + 1]);
      const d = distance(pt, cp);
      if (d <= bestFaceDist) {
        bestFaceDist = d;
        bestFace = { point: cp, type: 'face', wallId: wall.id, distance: d };
      }
    }
  }

  return { bestCorner, bestCornerDist, bestFace, bestFaceDist };
}

export function findSnapToFace(
  pt: Point,
  walls: Wall[],
  excludeId?: string,
  threshold?: number,
): SnapResult | null {
  let bestCorner: SnapResult | null = null;
  let bestCornerDist = CORNER_SNAP;

  let bestFace: SnapResult | null = null;
  let bestFaceDist = threshold ?? FACE_SNAP;

  for (const wall of walls) {
    if (wall.id === excludeId) continue;

    if (wall.curveRadius) {
      const result = snapCurvedWall(pt, wall, bestCorner, bestCornerDist, bestFace, bestFaceDist);
      bestCorner = result.bestCorner;
      bestCornerDist = result.bestCornerDist;
      bestFace = result.bestFace;
      bestFaceDist = result.bestFaceDist;
      continue;
    }

    const rect = wallRectangle(wall);

    const midStart: Point = {
      x: (rect.corners[0].x + rect.corners[3].x) / 2,
      y: (rect.corners[0].y + rect.corners[3].y) / 2,
    };
    const midEnd: Point = {
      x: (rect.corners[1].x + rect.corners[2].x) / 2,
      y: (rect.corners[1].y + rect.corners[2].y) / 2,
    };

    const snapPoints = [...rect.corners, midStart, midEnd];

    for (const corner of snapPoints) {
      const d = distance(pt, corner);
      if (d <= bestCornerDist) {
        bestCornerDist = d;
        bestCorner = { point: corner, type: 'corner', wallId: wall.id, distance: d };
      }
    }

    for (const face of rect.faces) {
      const cp = closestPointOnSegment(pt, face.start, face.end);
      const d = distance(pt, cp);
      if (d <= bestFaceDist) {
        bestFaceDist = d;
        bestFace = { point: cp, type: 'face', wallId: wall.id, distance: d };
      }
    }

    const cpMid = closestPointOnSegment(pt, midStart, midEnd);
    const dMid = distance(pt, cpMid);
    if (dMid <= bestFaceDist) {
      bestFaceDist = dMid;
      bestFace = { point: cpMid, type: 'face', wallId: wall.id, distance: dMid };
    }
  }

  if (bestCorner) return bestCorner;
  return bestFace;
}
