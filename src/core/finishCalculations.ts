import type { Wall, Column, Window, Door, Stair } from './types';
import type { RoomRegion } from './regionTypes';
import { distance } from './geometry';
import { computeExteriorFootprintArea } from './footprintArea';
import { computeLandBoundaryArea } from './wallSegments3D';
export interface FinishesInput {
  floorHeight: number;
  hasMarble: boolean;
  marbleQuantity?: number;
}

export interface OpeningGroup {
  width: number;
  height: number;
  count: number;
  unitArea: number;
  totalArea: number;
}

export interface FinishResults {
  exteriorWallGross: number;
  interiorWallGross: number;
  ceilingArea: number;
  floorArea: number;
  kitchenArea: number;
  bathroomArea: number;
  kitchenWallArea: number;
  bathroomWallArea: number;
  exteriorWallNet: number;
  interiorWallNet: number;
  outerColumnArea: number;
  innerColumnArea: number;
  extWindowArea: number;
  intWindowArea: number;
  extDoorArea: number;
  intDoorArea: number;
  innerWallArea: number;
  exteriorBlocks: number;
  exteriorBlockCement: number;
  exteriorBlockSand: number;
  interiorBlocks: number;
  interiorBlockCement: number;
  interiorBlockSand: number;
  plasterWallsLabor: number;
  plasterCeilingLabor: number;
  plasterWallsMaterial: number;
  plasterCement: number;
  plasterSand: number;
  paintWalls: number;
  paintCeiling: number;
  putty: number;
  primer: number;
  paint: number;
  tileFloorArea: number;
  tileKitchenFloor: number;
  tileBathroomFloor: number;
  tileKitchenWalls: number;
  tileBathroomWalls: number;
  tileCement: number;
  tileSand: number;
  stairFloorArea: number;
  landingTileArea: number;
  stepTileCount: number;
  marbleArea: number;
  marbleConcrete: number;
  marbleCement: number;
  marbleSand: number;
  marbleAggregate: number;
  electricalPoints: number;
  plumbingPoints: number;
  windowGroups: OpeningGroup[];
  doorGroups: OpeningGroup[];
  totalBlocks: number;
  totalCement: number;
  totalSand: number;
  totalAggregate: number;
  correctedPlasterWalls: number;
  correctedPlasterCeiling: number;
  correctedPlasterArea: number;
  correctedPlasterCement: number;
  correctedPlasterSand: number;
  correctedPaintWalls: number;
  correctedPaintCeiling: number;
  correctedPaintTotal: number;
  correctedTileFloor: number;
  correctedTileKitchenWalls: number;
  correctedTileBathroomWalls: number;
  correctedTileTotalArea: number;
  correctedTileCement: number;
  correctedTileSand: number;
    landBoundaryArea: number;  // ✅ جديد
}

function distanceToSegment(p: {x:number;y:number}, a: {x:number;y:number}, b: {x:number;y:number}) {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const lenSq = dx * dx + dy * dy;
  if (lenSq === 0) return distance(p, a);
  let t = ((p.x - a.x) * dx + (p.y - a.y) * dy) / lenSq;
  t = Math.max(0, Math.min(1, t));
  return distance(p, { x: a.x + t * dx, y: a.y + t * dy });
}

function polygonPerimeter(polygon: {x:number;y:number}[]): number {
  let per = 0;
  for (let i = 0; i < polygon.length; i++) {
    const j = (i + 1) % polygon.length;
    per += distance(polygon[i], polygon[j]);
  }
  return per;
}

export function calculateFinishes(
  walls: Wall[],
  columns: Column[],
  windows: Window[],
  doors: Door[],
  regions: RoomRegion[],
  stairs: Stair[],
  input: FinishesInput,
): FinishResults {
  const { floorHeight, hasMarble, marbleQuantity } = input;

  // ✅ استثناء الخطوط والأسوار من الحسابات
  const realWalls = walls.filter(w => !w.kind || w.kind === 'wall');
  // ✅ حساب مساحة الأرض من حدود الأرض
  const landBoundaryArea = computeLandBoundaryArea(walls);

  const extWalls = realWalls.filter(w => w.type === 'exterior');
  const intWalls = realWalls.filter(w => w.type === 'interior');

  // ✅ إضافة سماكة الجدارين (يمين + يسار) للطول الداخلي → الطول الخارجي
const exteriorWallGross = extWalls.reduce(
  (s, w) => s + (distance(w.start, w.end) + 2 * w.thickness) * floorHeight, 0
);
  const interiorWallGross = intWalls.reduce((s, w) => s + distance(w.start, w.end) * floorHeight, 0);

  // ✅ حساب المساحة الفعلية للمبنى بدقة (Shoelace + offset)
const footprintArea = computeExteriorFootprintArea(extWalls);

// Fallback: Bounding box لو فشل التتبع
let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
extWalls.forEach(w => {
  minX = Math.min(minX, w.start.x, w.end.x);
  maxX = Math.max(maxX, w.start.x, w.end.x);
  minY = Math.min(minY, w.start.y, w.end.y);
  maxY = Math.max(maxY, w.start.y, w.end.y);
});
const bboxArea = Math.max(0, (maxX - minX) * (maxY - minY));

const floorArea = footprintArea > 0 ? footprintArea : bboxArea;
  const ceilingArea = floorArea;

  const kitchenRegions = regions.filter(r => r.type === 'kitchen');
  const bathroomRegions = regions.filter(r => r.type === 'bathroom');
  const kitchenArea = kitchenRegions.reduce((s, r) => s + r.area, 0);
  const bathroomArea = bathroomRegions.reduce((s, r) => s + r.area, 0);
  const kitchenWallArea = kitchenRegions.reduce((s, r) => s + polygonPerimeter(r.polygon) * floorHeight, 0);
  const bathroomWallArea = bathroomRegions.reduce((s, r) => s + polygonPerimeter(r.polygon) * floorHeight, 0);

  let stairFloorArea = 0;
  let landingTileArea = 0;
  let stepTileCount = 0;
  stairs.forEach(stair => {
    stairFloorArea += stair.width * stair.totalLength;
    landingTileArea += stair.width * stair.landingLength;
    const stepLength = Math.max(0, stair.totalLength - stair.landingLength);
    const steps = stair.treadDepth > 0 ? Math.floor(stepLength / stair.treadDepth) : 0;
    stepTileCount += steps;
  });

  let outerColumnArea = 0;
  let innerColumnArea = 0;
  columns.forEach(col => {
    const colHeight = floorHeight;
    const colLongSide = col.length;

    let isOnExterior = false;
    let isOnInterior = false;
    extWalls.forEach(wall => {
      const dist = distanceToSegment(col.position, wall.start, wall.end);
      if (dist < col.width / 2 + wall.thickness / 2) {
        isOnExterior = true;
      }
    });

    intWalls.forEach(wall => {
      const dist = distanceToSegment(col.position, wall.start, wall.end);
      if (dist < col.width / 2 + wall.thickness / 2) {
        isOnInterior = true;
      }
    });

    if (isOnExterior && isOnInterior) {
      let closestInteriorDist = Infinity;
      intWalls.forEach(wall => {
        const dist = distanceToSegment(col.position, wall.start, wall.end);
        if (dist < closestInteriorDist) closestInteriorDist = dist;
      });

      if (closestInteriorDist < col.width / 2) {
        outerColumnArea += 0.2 * colHeight;
        innerColumnArea += (colLongSide - 0.2) * colHeight;
      } else {
        innerColumnArea += 0.2 * colHeight;
        outerColumnArea += (colLongSide - 0.2) * colHeight;
      }
    } else if (isOnExterior) {
      outerColumnArea += colLongSide * colHeight;
    } else if (isOnInterior) {
      innerColumnArea += colLongSide * colHeight;
    }
  });

  let extWindowArea = 0;
  let intWindowArea = 0;
  windows.forEach(win => {
    const wall = walls.find(w => w.id === win.wallId);
    if (!wall) return;
    const area = win.width * win.height;
    if (wall.type === 'exterior') extWindowArea += area;
    else intWindowArea += area;
  });

  let extDoorArea = 0;
  let intDoorArea = 0;
  doors.forEach(door => {
    const wall = walls.find(w => w.id === door.wallId);
    if (!wall) return;
    const area = door.width * door.height;
    if (wall.type === 'exterior') extDoorArea += area;
    else intDoorArea += area;
  });

  const innerWallArea = intWalls.reduce((s, w) => s + distance(w.start, w.end) * w.thickness, 0);
  const exteriorWallNet = Math.max(0, exteriorWallGross - outerColumnArea - extWindowArea - extDoorArea);
  const interiorWallNet = Math.max(0, interiorWallGross - innerColumnArea - intWindowArea - intDoorArea);

  const exteriorBlocks = Math.ceil(exteriorWallNet * 12);
  const interiorBlocks = Math.ceil(interiorWallNet * 12);
  const exteriorBlockCement = Math.ceil(exteriorBlocks / 50);
  const interiorBlockCement = Math.ceil(interiorBlocks / 50);
  const exteriorBlockSand = exteriorBlockCement * 0.15;
  const interiorBlockSand = interiorBlockCement * 0.15;

  const plasterWallsLabor = (exteriorWallGross + interiorWallGross * 2) - kitchenWallArea - bathroomWallArea;
  const plasterCeilingLabor = ceilingArea;
  const plasterWallsMaterial = (exteriorWallGross + interiorWallGross * 2) - extWindowArea - extDoorArea - intWindowArea - intDoorArea - kitchenWallArea - bathroomWallArea;
  const plasterArea = plasterWallsMaterial + ceilingArea;
  const plasterCement = plasterArea * 0.15;
  const plasterSand = plasterCement * 0.15;

  const paintWalls = plasterWallsLabor;
  const paintCeiling = ceilingArea;
  const paintTotal = paintWalls + paintCeiling;

  const putty = paintTotal * 0.8;
  const primer = paintTotal / 8;
  const paint = paintTotal / 8;

  const tileFloorArea = Math.max(0, floorArea - kitchenArea - bathroomArea - stairFloorArea);
  const tileKitchenFloor = kitchenArea;
  const tileBathroomFloor = bathroomArea;
  const tileKitchenWalls = kitchenWallArea;
  const tileBathroomWalls = bathroomWallArea;
  const tileTotalArea = tileFloorArea + tileKitchenFloor + tileBathroomFloor + tileKitchenWalls + tileBathroomWalls;
  const tileCement = tileTotalArea * 0.3;
  const tileSand = tileCement * 0.15;

  const marbleArea = hasMarble
    ? (marbleQuantity !== undefined && marbleQuantity > 0
        ? marbleQuantity
        : Math.max(0, exteriorWallGross - extWindowArea - extDoorArea))
    : 0;
  const marbleConcrete = marbleArea * 0.04;
  const marbleCement = marbleArea * 0.3;
  const marbleSand = marbleCement * 0.07;
  const marbleAggregate = marbleCement * 0.075;

  const electricalPoints = floorArea * 0.7;
  const plumbingPoints = bathroomRegions.length * 5 + kitchenRegions.length * 4 + 3;

  const windowGroups: OpeningGroup[] = [];
  const winMap = new Map<string, { width: number; height: number; count: number }>();
  windows.forEach(w => {
    const key = `${w.width}x${w.height}`;
    const existing = winMap.get(key);
    if (existing) existing.count++;
    else winMap.set(key, { width: w.width, height: w.height, count: 1 });
  });
  winMap.forEach(v => {
    windowGroups.push({
      width: v.width,
      height: v.height,
      count: v.count,
      unitArea: v.width * v.height,
      totalArea: v.width * v.height * v.count,
    });
  });

  const doorGroups: OpeningGroup[] = [];
  const doorMap = new Map<string, { width: number; height: number; count: number }>();
  doors.forEach(d => {
    const key = `${d.width}x${d.height}`;
    const existing = doorMap.get(key);
    if (existing) existing.count++;
    else doorMap.set(key, { width: d.width, height: d.height, count: 1 });
  });
  doorMap.forEach(v => {
    doorGroups.push({
      width: v.width,
      height: v.height,
      count: v.count,
      unitArea: v.width * v.height,
      totalArea: v.width * v.height * v.count,
    });
  });

  const correctedPlasterWalls = Math.max(0, plasterWallsLabor - (extWindowArea + extDoorArea + intWindowArea + intDoorArea) - (kitchenWallArea + bathroomWallArea));
  const correctedPlasterCeiling = Math.max(0, ceilingArea - innerWallArea);
  const correctedPlasterArea = correctedPlasterWalls + correctedPlasterCeiling;
  const correctedPlasterCement = Math.ceil(correctedPlasterArea * 0.15);
  const correctedPlasterSand = Math.ceil(correctedPlasterCement * 0.15);

  const correctedPaintWalls = correctedPlasterWalls;
  const correctedPaintCeiling = correctedPlasterCeiling;
  const correctedPaintTotal = correctedPaintWalls + correctedPaintCeiling;

  const correctedTileFloor = Math.max(0, tileFloorArea - innerWallArea);
  const correctedTileKitchenWalls = Math.max(0, tileKitchenWalls - 2);
  const correctedTileBathroomWalls = Math.max(0, tileBathroomWalls - 2);
  const correctedTileTotalArea = correctedTileFloor + tileKitchenFloor + tileBathroomFloor + correctedTileKitchenWalls + correctedTileBathroomWalls;
  const correctedTileCement = Math.ceil(correctedTileTotalArea * 0.3);
  const correctedTileSand = Math.ceil(correctedTileCement * 0.15);

  const totalBlocks = exteriorBlocks + interiorBlocks;
  const totalCement = exteriorBlockCement + interiorBlockCement + plasterCement + tileCement + marbleCement;
  const totalSand = exteriorBlockSand + interiorBlockSand + plasterSand + tileSand + marbleSand;
  const totalAggregate = marbleAggregate;

  return {
    exteriorWallGross,
    interiorWallGross,
    ceilingArea,
    floorArea,
    kitchenArea,
    bathroomArea,
    kitchenWallArea,
    bathroomWallArea,
    exteriorWallNet,
    interiorWallNet,
    outerColumnArea,
    innerColumnArea,
    extWindowArea,
    intWindowArea,
    extDoorArea,
    intDoorArea,
    innerWallArea,
    exteriorBlocks,
    exteriorBlockCement,
    exteriorBlockSand,
    interiorBlocks,
    interiorBlockCement,
    interiorBlockSand,
    plasterWallsLabor,
    plasterCeilingLabor,
    plasterWallsMaterial,
    plasterCement,
    plasterSand,
    paintWalls,
    paintCeiling,
    putty,
    primer,
    paint,
    tileFloorArea,
    tileKitchenFloor,
    tileBathroomFloor,
    tileKitchenWalls,
    tileBathroomWalls,
    tileCement,
    tileSand,
    stairFloorArea,
    landingTileArea,
    stepTileCount,
    marbleArea,
    marbleConcrete,
    marbleCement,
    marbleSand,
    marbleAggregate,
    electricalPoints,
    plumbingPoints,
    windowGroups,
    doorGroups,
    totalBlocks,
    totalCement,
    totalSand,
    totalAggregate,
    correctedPlasterWalls,
    correctedPlasterCeiling,
    correctedPlasterArea,
    correctedPlasterCement,
    correctedPlasterSand,
    correctedPaintWalls,
    correctedPaintCeiling,
    correctedPaintTotal,
    correctedTileFloor,
    correctedTileKitchenWalls,
    correctedTileBathroomWalls,
    correctedTileTotalArea,
      correctedTileCement,
        correctedTileSand,
          landBoundaryArea,
          };
            }
