import React, { useState } from 'react';
import {
  calculateFinishes,
  type FinishesInput,
  type FinishResults,
} from '../../core/finishCalculations';
import type {
  Wall,
  Column,
  Window,
  Door,
  Stair,
} from '../../core/types';
import type { RoomRegion } from '../../core/regionTypes';
import { FinishInputs } from './FinishInputs';
import { FinishTables } from './FinishTables';

interface Props {
  walls: Wall[];
  columns: Column[];
  windows: Window[];
  doors: Door[];
  regions: RoomRegion[];
  stairs: Stair[];
}

export const FinishesPage: React.FC<Props> = ({
  walls,
  columns,
  windows,
  doors,
  regions,
  stairs,
}) => {
  const [floorHeight, setFloorHeight] = useState(3);
  const [hasMarble, setHasMarble] = useState<boolean>(false);
  const [results, setResults] = useState<FinishResults | null>(null);
  const [electricalPts, setElectricalPts] = useState(0);
  const [plumbingPts, setPlumbingPts] = useState(0);

  // ✅ كمية عمالة الرخام المخصصة (قابلة للتعديل من الجدول)
  const [marbleLaborOverride, setMarbleLaborOverride] = useState<number | null>(null);

  const calculate = () => {
    const input: FinishesInput = {
      floorHeight,
      hasMarble,
    };

    const res = calculateFinishes(
      walls,
      columns,
      windows,
      doors,
      regions,
      stairs,
      input
    );

    const roundedRes = { ...res };

    roundedRes.exteriorBlocks = Math.ceil(res.exteriorBlocks);
    roundedRes.interiorBlocks = Math.ceil(res.interiorBlocks);
    roundedRes.exteriorBlockCement = Math.ceil(res.exteriorBlockCement);
    roundedRes.interiorBlockCement = Math.ceil(res.interiorBlockCement);
    roundedRes.exteriorBlockSand = Math.ceil(res.exteriorBlockSand);
    roundedRes.interiorBlockSand = Math.ceil(res.interiorBlockSand);
    roundedRes.plasterWallsLabor = Math.ceil(res.plasterWallsLabor);
    roundedRes.plasterCeilingLabor = Math.ceil(res.plasterCeilingLabor);
    roundedRes.plasterWallsMaterial = Math.ceil(res.plasterWallsMaterial);
    roundedRes.plasterCement = Math.ceil(res.plasterCement);
    roundedRes.plasterSand = Math.ceil(res.plasterSand);
    roundedRes.paintWalls = Math.ceil(res.paintWalls);
    roundedRes.paintCeiling = Math.ceil(res.paintCeiling);
    roundedRes.putty = Math.ceil(res.putty);
    roundedRes.primer = Math.ceil(res.primer);
    roundedRes.paint = Math.ceil(res.paint);
    roundedRes.tileFloorArea = Math.ceil(res.tileFloorArea);
    roundedRes.tileKitchenFloor = Math.ceil(res.tileKitchenFloor);
    roundedRes.tileBathroomFloor = Math.ceil(res.tileBathroomFloor);
    roundedRes.tileKitchenWalls = Math.ceil(res.tileKitchenWalls);
    roundedRes.tileBathroomWalls = Math.ceil(res.tileBathroomWalls);
    roundedRes.tileCement = Math.ceil(res.tileCement);
    roundedRes.tileSand = Math.ceil(res.tileSand);
    roundedRes.stairFloorArea = Math.ceil(res.stairFloorArea);
    roundedRes.landingTileArea = Math.ceil(res.landingTileArea);
    roundedRes.stepTileCount = Math.ceil(res.stepTileCount);
    roundedRes.marbleArea = Math.ceil(res.marbleArea);
    roundedRes.marbleConcrete = Math.ceil(res.marbleConcrete);
    roundedRes.marbleCement = Math.ceil(res.marbleCement);
    roundedRes.marbleSand = Math.ceil(res.marbleSand);
    roundedRes.marbleAggregate = Math.ceil(res.marbleAggregate);
    roundedRes.electricalPoints = Math.ceil(res.electricalPoints);
    roundedRes.plumbingPoints = Math.ceil(res.plumbingPoints);
    roundedRes.windowGroups = res.windowGroups;
    roundedRes.doorGroups = res.doorGroups;

    roundedRes.correctedPlasterWalls = Math.ceil(res.correctedPlasterWalls);
    roundedRes.correctedPlasterCeiling = Math.ceil(res.correctedPlasterCeiling);
    roundedRes.correctedPlasterArea = Math.ceil(res.correctedPlasterArea);
    roundedRes.correctedPaintWalls = Math.ceil(res.correctedPaintWalls);
    roundedRes.correctedPaintCeiling = Math.ceil(res.correctedPaintCeiling);
    roundedRes.correctedPaintTotal = Math.ceil(res.correctedPaintTotal);
    roundedRes.correctedTileFloor = Math.ceil(res.correctedTileFloor);
    roundedRes.correctedTileKitchenWalls = Math.ceil(res.correctedTileKitchenWalls);
    roundedRes.correctedTileBathroomWalls = Math.ceil(res.correctedTileBathroomWalls);
    roundedRes.correctedTileTotalArea = Math.ceil(res.correctedTileTotalArea);
    roundedRes.correctedTileCement = Math.ceil(res.correctedTileCement);
    roundedRes.correctedTileSand = Math.ceil(res.correctedTileSand);

    setResults(roundedRes);
    setElectricalPts(Math.ceil(res.electricalPoints));
    setPlumbingPts(Math.ceil(res.plumbingPoints));

    // ✅ إعادة تعيين قيمة عمالة الرخام عند إعادة الحساب
    setMarbleLaborOverride(null);

    const totalBlocks = Math.ceil(roundedRes.exteriorBlocks + roundedRes.interiorBlocks);
    const totalDoorsArea = roundedRes.doorGroups.reduce((s, g) => s + g.totalArea, 0);
    const totalWindowsArea = roundedRes.windowGroups.reduce((s, g) => s + g.totalArea, 0);

    // ✅ إجمالي البلاط (أرضيات + مطابخ + حمامات + جدران)
    const totalTileArea = Math.ceil(
      roundedRes.correctedTileFloor +
      roundedRes.tileKitchenFloor +
      roundedRes.tileBathroomFloor +
      roundedRes.correctedTileKitchenWalls +
      roundedRes.correctedTileBathroomWalls
    );

    // ✅ قيمة عمالة الرخام الافتراضية (قبل أي تعديل)
    const defaultMarbleLabor = hasMarble
      ? Math.ceil(roundedRes.exteriorWallGross)
      : 0;

    const dataToSave = {
      totalBlocks,
      totalCement: Math.ceil(roundedRes.totalCement),
      totalSand: Math.ceil(roundedRes.totalSand),
      totalAggregate: Math.ceil(roundedRes.totalAggregate),
      totalMarbleArea: Math.ceil(roundedRes.marbleArea),
      totalDoorsArea: Math.ceil(totalDoorsArea * 100) / 100,
      totalWindowsArea: Math.ceil(totalWindowsArea * 100) / 100,
      landingTileArea: roundedRes.landingTileArea,
      stepTileCount: roundedRes.stepTileCount,
      totalTileArea,

// ✅ قيم جدول إجمالي كميات العمالة (مطابقة تماماً للجدول)
laborWallTotal: Math.ceil(roundedRes.exteriorWallGross + roundedRes.interiorWallGross),
laborPlasterTotal: Math.ceil(roundedRes.plasterWallsLabor + (roundedRes.plasterCeilingLabor - roundedRes.innerWallArea)),
laborPaintTotal: Math.ceil(roundedRes.paintWalls + (roundedRes.paintCeiling - roundedRes.innerWallArea)),
laborTileTotal: Math.ceil((roundedRes.tileFloorArea - roundedRes.innerWallArea) + roundedRes.tileKitchenFloor + roundedRes.tileBathroomFloor + roundedRes.tileKitchenWalls + roundedRes.tileBathroomWalls),
      // ✅ عمالة الرخام (افتراضية = exteriorWallGross)
      marbleLaborArea: defaultMarbleLabor,

      // ✅ نقاط الكهرباء والسباكة (لحساب عمالتها في الملخص)
      electricalPoints: roundedRes.electricalPoints,
      plumbingPoints: roundedRes.plumbingPoints,

      blockOuter: {
        blocks: roundedRes.exteriorBlocks,
        cement: roundedRes.exteriorBlockCement,
        sand: roundedRes.exteriorBlockSand,
      },
      blockInner: {
        blocks: roundedRes.interiorBlocks,
        cement: roundedRes.interiorBlockCement,
        sand: roundedRes.interiorBlockSand,
      },
      plaster: {
        area: roundedRes.correctedPlasterWalls,
        cement: roundedRes.correctedPlasterCement,
        sand: roundedRes.correctedPlasterSand,
      },
      paint: {
        area: roundedRes.correctedPaintWalls,
        putty: Math.ceil(roundedRes.correctedPaintTotal * 0.8),
        primer: Math.ceil(roundedRes.correctedPaintTotal / 8),
        paint: Math.ceil(roundedRes.correctedPaintTotal / 8),
      },
      tile: {
        floor: roundedRes.correctedTileFloor,
        kitchenWalls: roundedRes.correctedTileKitchenWalls,
        bathroomWalls: roundedRes.correctedTileBathroomWalls,
        landing: roundedRes.landingTileArea,
        steps: roundedRes.stepTileCount,
        total: totalTileArea,
      },
      marble: {
        area: roundedRes.marbleArea,
        aggregate: roundedRes.marbleAggregate,
        cement: roundedRes.marbleCement,
        sand: roundedRes.marbleSand,
      },
      extras: {
        bathrooms: regions.filter(r => r.type === 'bathroom').length,
        kitchens: regions.filter(r => r.type === 'kitchen').length,
        windows: windows.length,
        doors: doors.length,
      },
      labor: {
        blockArea: roundedRes.exteriorWallNet + roundedRes.interiorWallNet,
      },
      exteriorWallNet: roundedRes.exteriorWallNet,
      interiorWallNet: roundedRes.interiorWallNet,
      exteriorWallGross: roundedRes.exteriorWallGross,
      interiorWallGross: roundedRes.interiorWallGross,
      paintWalls: roundedRes.correctedPaintWalls,
      paintCeiling: roundedRes.correctedPaintCeiling,
      plasterWallsLabor: roundedRes.correctedPlasterWalls,
      plasterCeilingLabor: roundedRes.correctedPlasterCeiling,
      innerWallArea: roundedRes.innerWallArea,
      tileFloorArea: roundedRes.correctedTileFloor,
      tileKitchenFloor: roundedRes.tileKitchenFloor,
      tileBathroomFloor: roundedRes.tileBathroomFloor,
      tileKitchenWalls: roundedRes.correctedTileKitchenWalls,
      tileBathroomWalls: roundedRes.correctedTileBathroomWalls,
    };

    localStorage.setItem('hasMarble', JSON.stringify(hasMarble));
    localStorage.setItem('finishes_results', JSON.stringify(dataToSave));
  };

  // ✅ دالة تعديل مساحة الرخام يدوياً
  const handleMarbleAreaChange = (newArea: number) => {
    if (!results || newArea < 0) return;

    const newMarbleConcrete = newArea * 0.04;
    const newMarbleCement = newArea * 0.3;
    const newMarbleSand = newMarbleCement * 0.07;
    const newMarbleAggregate = newMarbleCement * 0.075;

    const updatedResults = {
      ...results,
      marbleArea: newArea,
      marbleConcrete: newMarbleConcrete,
      marbleCement: newMarbleCement,
      marbleSand: newMarbleSand,
      marbleAggregate: newMarbleAggregate,
      totalCement: Math.ceil(
        results.exteriorBlockCement + results.interiorBlockCement +
        results.correctedPlasterCement + results.correctedTileCement + newMarbleCement
      ),
      totalSand: Math.ceil(
        results.exteriorBlockSand + results.interiorBlockSand +
        results.correctedPlasterSand + results.correctedTileSand + newMarbleSand
      ),
      totalAggregate: newMarbleAggregate,
    };

    setResults(updatedResults);

    const currentData = localStorage.getItem('finishes_results');
    if (currentData) {
      try {
        const parsed = JSON.parse(currentData);
        parsed.marble = {
          area: newArea,
          aggregate: newMarbleAggregate,
          cement: newMarbleCement,
          sand: newMarbleSand,
        };
        parsed.totalMarbleArea = newArea;
        parsed.totalCement = updatedResults.totalCement;
        parsed.totalSand = updatedResults.totalSand;
        parsed.totalAggregate = updatedResults.totalAggregate;
        localStorage.setItem('finishes_results', JSON.stringify(parsed));
      } catch (e) {
        // تجاهل
      }
    }
  };

  // ✅ دالة تعديل كمية عمالة الرخام يدوياً
  const handleMarbleLaborChange = (newValue: number) => {
    if (newValue < 0) return;
    setMarbleLaborOverride(newValue);

    const currentData = localStorage.getItem('finishes_results');
    if (currentData) {
      try {
        const parsed = JSON.parse(currentData);
        parsed.marbleLaborArea = newValue;
        localStorage.setItem('finishes_results', JSON.stringify(parsed));
      } catch (e) {
        // تجاهل
      }
    }
  };

  return (
    <div style={{ padding: 12 }}>
      <FinishInputs
        floorHeight={floorHeight}
        hasMarble={hasMarble}
        onFloorHeightChange={setFloorHeight}
        onHasMarbleChange={setHasMarble}
        onCalculate={calculate}
      />

      {results && (
        <div id="finishes-pdf" style={{ background: '#ffffff', width: '100%' }}>
          <FinishTables
            results={results}
            hasMarble={hasMarble}
            electricalPts={electricalPts}
            plumbingPts={plumbingPts}
            onElectricalChange={setElectricalPts}
            onPlumbingChange={setPlumbingPts}
            onMarbleAreaChange={handleMarbleAreaChange}
            marbleLaborOverride={marbleLaborOverride}
            onMarbleLaborChange={handleMarbleLaborChange}
          />
        </div>
      )}
    </div>
  );
};
