import React from 'react';
import { Card, Tr, Tr4, S } from './summaryComponents';

const n = (v: any) => { const num = parseFloat(v); return isNaN(num) ? 0 : num; };
const fmt = (v: number) => v.toFixed(2).replace(/\.00$/, '');
const fm = (v: number) => v.toLocaleString('en-US', { maximumFractionDigits: 0 });

export const SummaryTables2 = ({ data, o, setO, cur, cv, floors, hasMarble = false }: any) => {
  const { finishes = {}, prices = {}, struct = {}, prelim = {}, buildingArea = 0 } = data;
  const fmat = prices.finishesMaterials || [];
  const flab = prices.finishesLabor || [];
  const fext = prices.finishesExtra || [];
  const doorsAndWindows = prices.doorsAndWindows || [];

  const totalBlocks = Math.ceil(n(finishes?.totalBlocks) * floors);
  const totalCement = Math.ceil(n(finishes?.totalCement) * floors);
  const totalSand = Math.ceil(n(finishes?.totalSand) * floors);
  const totalAggregate = Math.ceil(n(finishes?.totalAggregate) * floors);
  const totalMarbleArea = Math.ceil(n(finishes?.totalMarbleArea) * floors);

  // ✅ الأبواب والنوافذ بالمتر المربع
  const totalDoorsArea = n(finishes?.totalDoorsArea) * floors;
  const totalWindowsArea = n(finishes?.totalWindowsArea) * floors;

  // ✅ إجمالي البلاط (أرضيات + مطابخ + حمامات + جدران مطابخ + جدران حمامات)
  const totalTileArea = Math.ceil(
    n(finishes?.tileFloorArea) +
    n(finishes?.tileKitchenFloor) +
    n(finishes?.tileBathroomFloor) +
    n(finishes?.tileKitchenWalls) +
    n(finishes?.tileBathroomWalls)
  );

  // ✅ بلاط البسطة والدرج
  const landingTileArea = Math.ceil(n(finishes?.landingTileArea) * floors);
  const stepTileCount = Math.ceil(n(finishes?.stepTileCount) * floors);

  // ✅ نقاط الكهرباء والسباكة
  const electricalPoints = Math.ceil(n(finishes?.electricalPoints) * floors);
  const plumbingPoints = Math.ceil(n(finishes?.plumbingPoints) * floors);

  // ✅ عمالة الكهرباء والسباكة
  const electricalLaborPrice = n(flab[5]?.price || '0');
  const plumbingLaborPrice = n(flab[6]?.price || '0');
  const electricalLaborCost = electricalPoints * electricalLaborPrice;
  const plumbingLaborCost = plumbingPoints * plumbingLaborPrice;

  // ✅ مواد الكهرباء (بالمتر المربع)
  const electricalMaterialsPrice = n(fext[2]?.price || '0');
  const electricalMaterialsCost = buildingArea * floors * electricalMaterialsPrice;

  const totalPutty = Math.ceil(n(finishes?.paint?.putty) * floors);
  const totalPrimer = Math.ceil(n(finishes?.paint?.primer) * floors);
  const totalPaint = Math.ceil(n(finishes?.paint?.paint) * floors);

// ✅ قيم جدول إجمالي كميات العمالة (مأخوذة مباشرة من صفحة التشطيبات)
const totalWallLaborFloors = Math.ceil(n(finishes?.laborWallTotal) * floors);
const totalPlasterLaborFloors = Math.ceil(n(finishes?.laborPlasterTotal) * floors);
const totalPaintLaborFloors = Math.ceil(n(finishes?.laborPaintTotal) * floors);
const totalTileLaborFloors = Math.ceil(n(finishes?.laborTileTotal) * floors);

  // ✅ عمالة الرخام: القيمة المحفوظة من صفحة التشطيبات (إن وُجدت) وإلا الافتراضية
  const marbleLaborStored = n(finishes?.marbleLaborArea);
  const totalMarbleLaborFloors = hasMarble
    ? (marbleLaborStored > 0
        ? marbleLaborStored
        : Math.ceil(n(finishes?.exteriorWallGross) * floors))
    : 0;

  const blockLaborArea = totalWallLaborFloors;

  const blockLaborMode = prices.blockMode || 'm2';
  const blockLaborUnit = n(flab[0]?.price || '0');

  const totalSteelCost = n(struct?.totalSteel) * n(prices.steelUnified || '0');
  const totalConcreteCost = n(struct?.totalConcrete) * n(prices.concrete?.[1]?.price || prices.concrete?.[0]?.price || '0');
  const prelimCost = Math.ceil(n(prelim?.excavationVolume)) * n(prices.preliminary?.[0]?.price || '0') + Math.ceil(n(prelim?.backfillVolume)) * n(prices.preliminary?.[1]?.price || '0') + Math.ceil(n(prelim?.plinthArea)) * n(prices.preliminary?.[2]?.price || '0');

  // ✅ البلوك في جدول التشطيبات (للاستخدام في حساب مواد التشطيبات)
  const totalBlocksCost = totalBlocks * n(fmat[0]?.price || '0');

  // ✅ البلوك الهوردي (القيمة الصحيحة من جدول تكلفة المواد - نفس معادلة summaryTables1)
  const structureBlockPrice = n(fmat[0]?.price || '0');
  const structureTotalBlocks = Math.ceil(buildingArea * 5 * floors);
  const structureBlocksCost = structureTotalBlocks * structureBlockPrice;

  const laborPrice = n(prices.labor?.[0]?.price || '0');
  const slabConcreteForLabor = buildingArea * 0.3 * floors;
  const laborTotal = n(struct?.footingConcrete) * laborPrice + n(struct?.neckConcrete) * laborPrice + n(struct?.columnConcrete) * floors * laborPrice + n(struct?.middConcrete) * laborPrice + slabConcreteForLabor * laborPrice;

  // ✅ مصاريف إضافية (من prices.other - نفس معادلة summaryTables1)
  let extrasCost = 0;
  (prices.other || []).forEach((e: any) => {
    extrasCost += e.costType === 'fixed' ? n(e.price) : (totalSteelCost + totalConcreteCost) * n(e.price) / 100;
  });

  // ✅ تكلفة مواد التشطيبات (مع إجمالي البلاط)
  const fmCost =
    totalBlocks * n(fmat[0]?.price || '0') +
    totalCement * n(fmat[2]?.price || '0') +
    totalSand * n(fmat[3]?.price || '0') +
    totalAggregate * n(fmat[4]?.price || '0') +
    totalMarbleArea * n(fmat[1]?.price || '0') +
    totalPutty * n(fmat[5]?.price || '0') +
    totalPrimer * n(fmat[6]?.price || '0') +
    totalPaint * n(fmat[7]?.price || '0') +
    totalTileArea * n(fmat[8]?.price || '0') +
    landingTileArea * n(fmat[8]?.price || '0') +
    stepTileCount * n(fmat[9]?.price || '0');

  const blockLaborCost = blockLaborMode === 'm2' ? blockLaborArea * blockLaborUnit : totalBlocks * blockLaborUnit;

  // ✅ تكلفة عمالة التشطيبات (مع كهرباء وسباكة)
  const flCost =
    blockLaborCost +
    totalMarbleLaborFloors * n(flab[1]?.price || '0') +
    totalPlasterLaborFloors * n(flab[2]?.price || '0') +
    totalPaintLaborFloors * n(flab[3]?.price || '0') +
    totalTileLaborFloors * n(flab[4]?.price || '0') +
    electricalLaborCost +
    plumbingLaborCost;

  // ✅ تكاليف إضافية (مع مواد الكهرباء + الأبواب والنوافذ بالمتر المربع)
  const feCost =
    Math.ceil(n(finishes?.extras?.bathrooms) * floors) * n(fext[0]?.price || '0') +
    Math.ceil(n(finishes?.extras?.kitchens) * floors) * n(fext[1]?.price || '0') +
    electricalMaterialsCost +
    totalWindowsArea * n(doorsAndWindows[1]?.price || '0') +
    totalDoorsArea * n(doorsAndWindows[2]?.price || '0');

  // ✅ الإجمالي الكلي (مع استبدال البلوك + إضافة المصاريف الإضافية)
  const grandTotal = cv(prelimCost + totalConcreteCost + totalSteelCost + structureBlocksCost + laborTotal + extrasCost + (fmCost + flCost + feCost));

  const costPerM2 = (buildingArea > 0) ? grandTotal / buildingArea : 0;
  const steelPerM2 = (buildingArea > 0) ? n(struct?.totalSteel) / buildingArea : 0;
  const concretePerM2 = (buildingArea > 0) ? n(struct?.totalConcrete) / buildingArea : 0;

  // ✅ النسب المئوية (7 نسب)
  const prelimPercent = grandTotal > 0 ? (cv(prelimCost) / grandTotal) * 100 : 0;
  const concretePercent = grandTotal > 0 ? (cv(totalConcreteCost) / grandTotal) * 100 : 0;
  const steelPercent = grandTotal > 0 ? (cv(totalSteelCost) / grandTotal) * 100 : 0;
  const blocksPercent = grandTotal > 0 ? (cv(structureBlocksCost) / grandTotal) * 100 : 0;
  const laborPercent = grandTotal > 0 ? (cv(laborTotal) / grandTotal) * 100 : 0;
  const extrasPercent = grandTotal > 0 ? (cv(extrasCost) / grandTotal) * 100 : 0;
  const finishesPercent = grandTotal > 0 ? (cv((fmCost + flCost + feCost)) / grandTotal) * 100 : 0;

  return (
    <>
      {/* ملخص التشطيبات */}
      <Card title={`ملخص التشطيبات (${cur})`} open={o.finishes} setOpen={() => setO((p: any) => ({ ...p, finishes: !p.finishes }))}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.7rem' }}>
          <thead><tr><th style={S.th}>البند</th><th style={S.th}>الكمية</th><th style={S.th}>سعر الوحدة</th><th style={S.th}>الإجمالي</th></tr></thead>
          <tbody>
            <tr><td style={S.td} colSpan={4}><strong>🧱 مواد التشطيبات</strong></td></tr>
            <Tr4 label={`البلوك (${floors} دور)`} qty={`${fm(totalBlocks)} بلوكة`} price={fm(cv(n(fmat[0]?.price || '0')))} total={fm(cv(totalBlocks * n(fmat[0]?.price || '0')))} />
            <Tr4 label={`الأسمنت (${floors} دور)`} qty={`${fm(totalCement)} كيس`} price={fm(cv(n(fmat[2]?.price || '0')))} total={fm(cv(totalCement * n(fmat[2]?.price || '0')))} />
            <Tr4 label={`الرمل (${floors} دور)`} qty={`${fm(totalSand)} م³`} price={fm(cv(n(fmat[3]?.price || '0')))} total={fm(cv(totalSand * n(fmat[3]?.price || '0')))} />
            <Tr4 label={`الركام (${floors} دور)`} qty={`${fm(totalAggregate)} م³`} price={fm(cv(n(fmat[4]?.price || '0')))} total={fm(cv(totalAggregate * n(fmat[4]?.price || '0')))} />
            <Tr4 label={`الرخام (${floors} دور)`} qty={`${fm(totalMarbleArea)} م²`} price={fm(cv(n(fmat[1]?.price || '0')))} total={fm(cv(totalMarbleArea * n(fmat[1]?.price || '0')))} />
            <Tr4 label={`البلاط - إجمالي (${floors} دور)`} qty={`${fm(totalTileArea)} م²`} price={fm(cv(n(fmat[8]?.price || '0')))} total={fm(cv(totalTileArea * n(fmat[8]?.price || '0')))} />
            {landingTileArea > 0 && (
              <Tr4 label={`بلاط البسطة (${floors} دور)`} qty={`${fm(landingTileArea)} م²`} price={fm(cv(n(fmat[8]?.price || '0')))} total={fm(cv(landingTileArea * n(fmat[8]?.price || '0')))} />
            )}
            {stepTileCount > 0 && (
              <Tr4 label={`بلاط الدرج (${floors} دور)`} qty={`${fm(stepTileCount)} درجة`} price={fm(cv(n(fmat[9]?.price || '0')))} total={fm(cv(stepTileCount * n(fmat[9]?.price || '0')))} />
            )}
            <Tr4 label={`المعجون (${floors} دور)`} qty={`${fm(totalPutty)} كجم`} price={fm(cv(n(fmat[5]?.price || '0')))} total={fm(cv(totalPutty * n(fmat[5]?.price || '0')))} />
            <Tr4 label={`البرايمر (${floors} دور)`} qty={`${fm(totalPrimer)} كجم`} price={fm(cv(n(fmat[6]?.price || '0')))} total={fm(cv(totalPrimer * n(fmat[6]?.price || '0')))} />
            <Tr4 label={`الطلاء (${floors} دور)`} qty={`${fm(totalPaint)} كجم`} price={fm(cv(n(fmat[7]?.price || '0')))} total={fm(cv(totalPaint * n(fmat[7]?.price || '0')))} />
            <tr><td style={S.td} colSpan={4}><strong>👷 عمالة التشطيبات</strong></td></tr>
            <Tr4 label={`بناء البلوك (${floors} دور)`} qty={blockLaborMode === 'm2' ? `${fm(blockLaborArea)} م²` : `${fm(totalBlocks)} بلوكة`} price={fm(cv(blockLaborUnit))} total={fm(cv(blockLaborCost))} />
            {hasMarble && (
              <Tr4 label={`تركيب الرخام (${floors} دور)`} qty={`${fm(totalMarbleLaborFloors)} م²`} price={fm(cv(n(flab[1]?.price || '0')))} total={fm(cv(totalMarbleLaborFloors * n(flab[1]?.price || '0')))} />
            )}
            <Tr4 label={`التلييس (${floors} دور)`} qty={`${fmt(totalPlasterLaborFloors)} م²`} price={fm(cv(n(flab[2]?.price || '0')))} total={fm(cv(totalPlasterLaborFloors * n(flab[2]?.price || '0')))} />
            <Tr4 label={`الطلاء (${floors} دور)`} qty={`${fmt(totalPaintLaborFloors)} م²`} price={fm(cv(n(flab[3]?.price || '0')))} total={fm(cv(totalPaintLaborFloors * n(flab[3]?.price || '0')))} />
            <Tr4 label={`البلاط (${floors} دور)`} qty={`${fmt(totalTileLaborFloors)} م²`} price={fm(cv(n(flab[4]?.price || '0')))} total={fm(cv(totalTileLaborFloors * n(flab[4]?.price || '0')))} />
            {electricalPoints > 0 && (
              <Tr4 label={`عمالة الكهرباء - ${electricalPoints} نقطة (${floors} دور)`} qty={`${fm(electricalPoints)} نقطة`} price={fm(cv(electricalLaborPrice))} total={fm(cv(electricalLaborCost))} />
            )}
            {plumbingPoints > 0 && (
              <Tr4 label={`عمالة السباكة - ${plumbingPoints} نقطة (${floors} دور)`} qty={`${fm(plumbingPoints)} نقطة`} price={fm(cv(plumbingLaborPrice))} total={fm(cv(plumbingLaborCost))} />
            )}
            <tr><td style={S.td} colSpan={4}><strong>🔧 تكاليف إضافية</strong></td></tr>
            <Tr4 label={`سباكة الحمامات (${floors} دور)`} qty={`${fm(Math.ceil(n(finishes?.extras?.bathrooms) * floors))} حمام`} price={fm(cv(n(fext[0]?.price || '0')))} total={fm(cv(Math.ceil(n(finishes?.extras?.bathrooms) * floors) * n(fext[0]?.price || '0')))} />
            <Tr4 label={`سباكة المطابخ (${floors} دور)`} qty={`${fm(Math.ceil(n(finishes?.extras?.kitchens) * floors))} مطبخ`} price={fm(cv(n(fext[1]?.price || '0')))} total={fm(cv(Math.ceil(n(finishes?.extras?.kitchens) * floors) * n(fext[1]?.price || '0')))} />
            {electricalMaterialsPrice > 0 && (
              <Tr4 label={`مواد الكهرباء (${floors} دور)`} qty={`${fm(Math.ceil(buildingArea * floors))} م²`} price={fm(cv(electricalMaterialsPrice))} total={fm(cv(electricalMaterialsCost))} />
            )}
            <Tr4 label={`النوافذ (${floors} دور)`} qty={`${fmt(totalWindowsArea)} م²`} price={fm(cv(n(doorsAndWindows[1]?.price || '0')))} total={fm(cv(totalWindowsArea * n(doorsAndWindows[1]?.price || '0')))} />
            <Tr4 label={`الأبواب (${floors} دور)`} qty={`${fmt(totalDoorsArea)} م²`} price={fm(cv(n(doorsAndWindows[2]?.price || '0')))} total={fm(cv(totalDoorsArea * n(doorsAndWindows[2]?.price || '0')))} />
            <tr style={S.total}><td style={S.td} colSpan={3}>إجمالي التشطيبات</td><td style={S.td}>{fm(cv((fmCost + flCost + feCost)))} {cur}</td></tr>
          </tbody>
        </table>
      </Card>

      {/* الملخص المالي النهائي */}
      <Card title={`الملخص المالي النهائي (${cur})`} open={o.final} setOpen={() => setO((p: any) => ({ ...p, final: !p.final }))}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.7rem' }}>
          <thead><tr><th style={S.th}>البند</th><th style={S.th}>القيمة</th></tr></thead>
          <tbody>
            <Tr label="الأعمال التمهيدية" value={`${fm(cv(prelimCost))} ${cur}`} />
            <Tr label="الخرسانة" value={`${fm(cv(totalConcreteCost))} ${cur}`} />
            <Tr label="الحديد" value={`${fm(cv(totalSteelCost))} ${cur}`} />
            <Tr label={`البلوك الهوردي (${floors} دور)`} value={`${fm(cv(structureBlocksCost))} ${cur}`} />
            <Tr label={`أجور المقاول (${floors} دور)`} value={`${fm(cv(laborTotal))} ${cur}`} />
            <Tr label="إجمالي المصاريف الإضافية" value={`${fm(cv(extrasCost))} ${cur}`} />
            <Tr label="إجمالي التشطيبات" value={`${fm(cv((fmCost + flCost + feCost)))} ${cur}`} />
            <Tr label="إجمالي تكلفة المشروع" value={`${fm(grandTotal)} ${cur}`} total />
          </tbody>
        </table>
      </Card>

      {/* مؤشرات هندسية */}
      <Card title="مؤشرات هندسية" open={o.ind} setOpen={() => setO((p: any) => ({ ...p, ind: !p.ind }))}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px' }}>
          <div style={{ border: '1px solid #2196F3', borderRadius: '10px', padding: '10px 8px', textAlign: 'center', background: '#f0f8ff' }}>
            <span style={{ fontSize: '0.55rem', color: '#555', fontWeight: 700 }}>إجمالي الخرسانة</span>
            <strong style={{ fontSize: '1rem', fontWeight: 700, color: '#2196F3', display: 'block' }}>{fmt(n(struct?.totalConcrete))} م³</strong>
          </div>
          <div style={{ border: '1px solid #FF9800', borderRadius: '10px', padding: '10px 8px', textAlign: 'center', background: '#fff8f0' }}>
            <span style={{ fontSize: '0.55rem', color: '#555', fontWeight: 700 }}>إجمالي الحديد</span>
            <strong style={{ fontSize: '1rem', fontWeight: 700, color: '#FF9800', display: 'block' }}>{fmt(n(struct?.totalSteel))} طن</strong>
          </div>
          <div style={{ border: '1px solid #4CAF50', borderRadius: '10px', padding: '10px 8px', textAlign: 'center', background: '#f0fff0' }}>
            <span style={{ fontSize: '0.55rem', color: '#555', fontWeight: 700 }}>تكلفة المتر المربع</span>
            <strong style={{ fontSize: '1rem', fontWeight: 700, color: '#4CAF50', display: 'block' }}>{fm(costPerM2)} {cur}</strong>
          </div>
          <div style={{ border: '1px solid #f44336', borderRadius: '10px', padding: '10px 8px', textAlign: 'center', background: '#fff0f0' }}>
            <span style={{ fontSize: '0.55rem', color: '#555', fontWeight: 700 }}>الحديد / م²</span>
            <strong style={{ fontSize: '1rem', fontWeight: 700, color: '#f44336', display: 'block' }}>{fmt(steelPerM2)} طن/م²</strong>
          </div>
          <div style={{ border: '1px solid #9C27B0', borderRadius: '10px', padding: '10px 8px', textAlign: 'center', background: '#faf0ff' }}>
            <span style={{ fontSize: '0.55rem', color: '#555', fontWeight: 700 }}>الخرسانة / م²</span>
            <strong style={{ fontSize: '1rem', fontWeight: 700, color: '#9C27B0', display: 'block' }}>{fmt(concretePerM2)} م³/م²</strong>
          </div>
        </div>

        {/* ✅ المؤشرات: 7 نسب بنفس الترتيب المطلوب */}
        <div style={{ marginTop: '12px' }}>
          {[
            { label: 'نسبة الأعمال التمهيدية', val: prelimPercent, color: '#FFC107' },
            { label: 'نسبة الخرسانة', val: concretePercent, color: '#2196F3' },
            { label: 'نسبة الحديد', val: steelPercent, color: '#f44336' },
            { label: 'نسبة البلوك الهوردي', val: blocksPercent, color: '#607D8B' },
            { label: 'نسبة أجور المقاول', val: laborPercent, color: '#4CAF50' },
            { label: 'نسبة المصاريف الإضافية', val: extrasPercent, color: '#FF5722' },
            { label: 'نسبة التشطيبات', val: finishesPercent, color: '#8B5CF6' },
          ].map((r, i) => (
            <div key={i} style={{ marginBottom: '6px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.65rem', fontWeight: 700 }}>
                <span>{r.label}</span><span>{fmt(r.val)}%</span>
              </div>
              <div style={{ width: '100%', height: '6px', background: '#eee', borderRadius: '3px' }}>
                <div style={{ width: `${Math.min(r.val, 100)}%`, height: '100%', background: r.color, borderRadius: '3px' }} />
              </div>
            </div>
          ))}
        </div>
      </Card>
    </>
  );
};
