import React, { useState, useEffect, useRef } from 'react';
import type { PricesData, PriceItem } from './pricesTypes';
import { getInitial, savePrices, defaults, n, unformat, formatNum } from './pricesData';

const SectionTitle = ({ children }: { children: React.ReactNode }) => (
  <div style={{ position: 'relative', padding: '8px 12px', marginBottom: '12px', marginTop: '8px', background: 'linear-gradient(to left, transparent, #e8f0fe 30%)', borderRight: '4px solid #2563eb', borderRadius: '0 8px 8px 0', boxShadow: '0 0 8px rgba(37,99,235,0.1)' }}>
    <span style={{ fontSize: '0.8rem', fontWeight: 800, color: '#003366' }}>{children}</span>
  </div>
);

const Num = ({ label, value, set, unit, inputRef, onKeyDown, flex }: any) => {
  const [display, setDisplay] = useState(formatNum(value));
  useEffect(() => { setDisplay(formatNum(value)); }, [value]);
  return (
    <div style={{ flex: flex || 1, background: '#fdfdfd', border: '1px solid #ddd', borderRadius: '8px', padding: '8px 5px', textAlign: 'center', display: 'flex', flexDirection: 'column' }}>
      <label style={{ fontSize: '0.6rem', color: '#003366', display: 'block', marginBottom: '2px', fontWeight: 700, whiteSpace: 'normal', wordBreak: 'break-word', minHeight: '14px' }}>{label}</label>
      <input ref={inputRef} type="text" inputMode="decimal" autoComplete="off" value={display}
        onChange={e => setDisplay(e.target.value.replace(/,/g, ''))}
        onBlur={() => { set(unformat(display)); setDisplay(formatNum(unformat(display))); }}
        onFocus={e => e.target.select()} onKeyDown={onKeyDown}
        style={{ width: '100%', border: 'none', textAlign: 'center', fontSize: '0.85rem', padding: '2px 0', outline: 'none', background: 'transparent', fontWeight: 700, fontFamily: 'Cairo, sans-serif' }} />
      {unit && <span style={{ fontSize: '0.55rem', color: '#888', display: 'block', marginTop: '2px', whiteSpace: 'normal' }}>{unit}</span>}
    </div>
  );
};

const Txt = ({ label, value, unit, flex, editable, onChange }: any) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const handleBlur = () => { if (inputRef.current && onChange) onChange(inputRef.current.value); };
  return (
    <div style={{ flex: flex || 1, background: '#fdfdfd', border: '1px solid #ddd', borderRadius: '8px', padding: '8px 5px', textAlign: 'center', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
      <label style={{ fontSize: '0.6rem', color: '#003366', display: 'block', marginBottom: '2px', fontWeight: 700, whiteSpace: 'normal', wordBreak: 'break-word', minHeight: '14px' }}>{label}</label>
      {editable ? (
        <input ref={inputRef} type="text" defaultValue={value} onBlur={handleBlur} onFocus={e => e.target.select()}
          style={{ width: '100%', border: 'none', textAlign: 'center', fontSize: '0.85rem', padding: '2px 0', outline: 'none', background: 'transparent', fontWeight: 700, fontFamily: 'Cairo, sans-serif' }} placeholder="اسم البند" />
      ) : (
        <span style={{ fontSize: '0.85rem', fontWeight: 700, fontFamily: 'Cairo, sans-serif', whiteSpace: 'normal', wordBreak: 'break-word', padding: '2px 0' }}>{value}</span>
      )}
      {unit && <span style={{ fontSize: '0.55rem', color: '#888', display: 'block', marginTop: '2px' }}>{unit}</span>}
    </div>
  );
};

const DelBtn = ({ onClick }: any) => (
  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', alignSelf: 'center' }}>
    <span style={{ fontSize: '0.5rem', color: '#dc3545', marginBottom: '2px', fontWeight: 700 }}>حذف</span>
    <button onClick={onClick} tabIndex={-1} style={{ background: '#dc3545', color: 'white', border: 'none', borderRadius: '6px', padding: '4px 8px', fontSize: '0.7rem', cursor: 'pointer', fontFamily: 'Cairo, sans-serif', fontWeight: 700 }}>🗑️</button>
  </div>
);

const AddBtn = ({ onClick, label }: any) => (
  <button onClick={onClick} tabIndex={-1} style={{ width: '100%', padding: '8px', border: '2px dashed #00509e', borderRadius: '8px', background: '#e8f0fe', color: '#00509e', fontWeight: 700, fontSize: '0.8rem', cursor: 'pointer', fontFamily: 'Cairo, sans-serif' }}>+ {label}</button>
);

export const PricesPage: React.FC = () => {
  const [data, setData] = useState<PricesData>(getInitial);
  useEffect(() => { savePrices(data); }, [data]);

  const update = (k: keyof PricesData, v: any) => setData(prev => ({ ...prev, [k]: v }));
  const addItem = (section: keyof PricesData, item: PriceItem) => setData(prev => ({ ...prev, [section]: [...prev[section], item] }));
  const updateItem = (section: keyof PricesData, id: number, field: string, v: string) => {
    setData(prev => ({ ...prev, [section]: (prev[section] as PriceItem[]).map(item => item.id === id ? { ...item, [field]: v } : item) }));
  };
  const removeItem = (section: keyof PricesData, id: number) => setData(prev => ({ ...prev, [section]: (prev[section] as PriceItem[]).filter(item => item.id !== id) }));
  const clearPrices = () => { if (confirm('تفريغ جميع الأسعار؟')) setData(defaults); };

  const cur = data.currency === 'YER' ? 'ر.ي' : data.currency === 'SAR' ? 'ر.س' : '$';

  const refs = useRef<(HTMLInputElement | null)[]>([]);
  const goNext = (e: React.KeyboardEvent, idx: number, total: number) => {
    if (e.key === 'Enter') { e.preventDefault(); if (idx < total - 1) refs.current[idx + 1]?.focus(); }
  };

  const renderRow = (section: keyof PricesData, item: PriceItem, index: number) => (
    <div key={item.id} style={{ display: 'flex', gap: '6px', alignItems: 'stretch', marginBottom: '8px', border: '1px solid #ddd', borderRadius: '8px', padding: '8px' }}>
      <Txt label="اسم البند" value={item.name} flex={2} editable={!item.name} onChange={(v: string) => updateItem(section, item.id, 'name', v)} />
      <Num label="السعر" value={item.price} set={(v: string) => updateItem(section, item.id, 'price', v)} unit={cur}
        inputRef={(el: any) => refs.current[index] = el} onKeyDown={(e: any) => goNext(e, index, 10)} />
      <Txt label="الوحدة" value={item.unit} flex={0.7} />
      <DelBtn onClick={() => removeItem(section, item.id)} />
    </div>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
      {/* العملة */}
      <div className="model-card" style={{ border: '1px solid #ddd', borderRadius: '12px', overflow: 'hidden', background: 'white' }}>
        <div className="model-body" style={{ padding: '10px 12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontWeight: 700, color: '#003366', fontSize: '0.85rem' }}>العملة:</span>
            <select value={data.currency} onChange={e => update('currency', e.target.value)} tabIndex={-1} style={{ border: '1px solid #ccc', borderRadius: '8px', padding: '6px 12px', fontSize: '0.85rem', fontFamily: 'Cairo, sans-serif', fontWeight: 700, background: 'white', flex: 1 }}>
              <option value="YER">ريال يمني</option>
              <option value="SAR">ريال سعودي</option>
              <option value="USD">دولار</option>
            </select>
          </div>
        </div>
      </div>

      {/* الحديد الموحد */}
      <SectionTitle>أسعار الحديد (سعر موحد)</SectionTitle>
      <div className="model-card" style={{ border: '1px solid #ddd', borderRadius: '12px', overflow: 'hidden', background: 'white' }}>
        <div className="model-body" style={{ padding: '10px 12px' }}>
          <Num label="سعر الطن (موحد)" value={data.steelUnified} set={(v: string) => update('steelUnified', v)} unit={cur}
            inputRef={(el: any) => refs.current[0] = el} onKeyDown={(e: any) => goNext(e, 0, 1)} />
        </div>
      </div>

      {/* الخرسانة */}
      <SectionTitle>أسعار الخرسانة</SectionTitle>
      <div className="model-card" style={{ border: '1px solid #ddd', borderRadius: '12px', overflow: 'hidden', background: 'white' }}>
        <div className="model-body" style={{ padding: '10px 12px' }}>
          {data.concrete.map((item, i) => renderRow('concrete', item, i))}
          <AddBtn onClick={() => addItem('concrete', { id: Date.now(), name: '', price: '', unit: 'م³' })} label="إضافة بند خرسانة" />
        </div>
      </div>

      {/* التمهيدية */}
      <SectionTitle>أسعار الأعمال التمهيدية</SectionTitle>
      <div className="model-card" style={{ border: '1px solid #ddd', borderRadius: '12px', overflow: 'hidden', background: 'white' }}>
        <div className="model-body" style={{ padding: '10px 12px' }}>
          {data.preliminary.map((item, i) => renderRow('preliminary', item, i))}
          <AddBtn onClick={() => addItem('preliminary', { id: Date.now(), name: '', price: '', unit: 'م³' })} label="إضافة بند تمهيدي" />
        </div>
      </div>

      {/* البلوك */}
      <SectionTitle>أسعار البلوك</SectionTitle>
      <div className="model-card" style={{ border: '1px solid #ddd', borderRadius: '12px', overflow: 'hidden', background: 'white' }}>
        <div className="model-body" style={{ padding: '10px 12px' }}>
          {data.block.map((item, i) => renderRow('block', item, i))}
          <AddBtn onClick={() => addItem('block', { id: Date.now(), name: '', price: '' })} label="إضافة بند بلوك" />
        </div>
      </div>

      {/* العمالة */}
      <SectionTitle>أسعار العمالة</SectionTitle>
      <div className="model-card" style={{ border: '1px solid #ddd', borderRadius: '12px', overflow: 'hidden', background: 'white' }}>
        <div className="model-body" style={{ padding: '10px 12px' }}>
          {data.labor.map((item, i) => renderRow('labor', item, i))}
          <AddBtn onClick={() => addItem('labor', { id: Date.now(), name: '', price: '', unit: 'م³' })} label="إضافة بند عمالة" />
        </div>
      </div>

      {/* تكاليف أخرى */}
      <SectionTitle>تكاليف أخرى</SectionTitle>
      <div className="model-card" style={{ border: '1px solid #ddd', borderRadius: '12px', overflow: 'hidden', background: 'white' }}>
        <div className="model-body" style={{ padding: '10px 12px' }}>
          {data.other.map((item, i) => (
            <div key={item.id} style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginBottom: '8px', border: '1px solid #ddd', borderRadius: '8px', padding: '8px' }}>
              <Txt label="اسم التكلفة" value={item.name} flex={1} editable={!item.name} onChange={(v: string) => updateItem('other', item.id, 'name', v)} />
              <div style={{ display: 'flex', gap: '6px', alignItems: 'stretch' }}>
                <select value={item.costType || 'percent'} onChange={e => updateItem('other', item.id, 'costType', e.target.value)} tabIndex={-1} style={{ border: '1px solid #ccc', borderRadius: '6px', background: 'white', width: '70px', fontSize: '0.8rem', fontFamily: 'Cairo' }}>
                  <option value="percent">نسبة %</option>
                  <option value="fixed">مبلغ ثابت</option>
                </select>
                <Num label={item.costType === 'fixed' ? 'المبلغ' : 'النسبة'} value={item.price} set={(v: string) => updateItem('other', item.id, 'price', v)} unit={item.costType === 'fixed' ? cur : '%'} flex={1.3}
                  inputRef={(el: any) => refs.current[i * 2 + 1] = el} onKeyDown={(e: any) => goNext(e, i * 2 + 1, 10)} />
                <DelBtn onClick={() => removeItem('other', item.id)} />
              </div>
            </div>
          ))}
          <AddBtn onClick={() => addItem('other', { id: Date.now(), name: '', price: '', costType: 'percent' })} label="إضافة تكلفة" />
        </div>
      </div>

      {/* مواد التشطيبات */}
      <SectionTitle>أسعار مواد التشطيبات</SectionTitle>
      <div className="model-card" style={{ border: '1px solid #ddd', borderRadius: '12px', overflow: 'hidden', background: 'white' }}>
        <div className="model-body" style={{ padding: '10px 12px' }}>
          {data.finishesMaterials.map((item, i) => renderRow('finishesMaterials', item, i))}
          <AddBtn onClick={() => addItem('finishesMaterials', { id: Date.now(), name: '', price: '', unit: '' })} label="إضافة مادة" />
        </div>
      </div>

      {/* عمالة التشطيبات */}
      <SectionTitle>أسعار عمالة التشطيبات</SectionTitle>
      <div className="model-card" style={{ border: '1px solid #ddd', borderRadius: '12px', overflow: 'hidden', background: 'white' }}>
        <div className="model-body" style={{ padding: '10px 12px' }}>
          {data.finishesLabor.map((item, i) => {
            if (item.name === 'بناء البلوك') {
              return (
                <div key={item.id} style={{ border: '1px solid #ddd', borderRadius: '8px', padding: '8px', marginBottom: '8px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <Txt label="اسم البند" value={item.name} flex={1} editable={!item.name} onChange={(v: string) => updateItem('finishesLabor', item.id, 'name', v)} />
                  <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.7rem', color: '#333', fontWeight: 700 }}>وحدة الحساب:</span>
                    <select value={data.blockMode} onChange={e => update('blockMode', e.target.value)} tabIndex={-1} style={{ border: '1px solid #ccc', borderRadius: '6px', padding: '4px', background: 'white', fontSize: '0.8rem', fontWeight: 700 }}>
                      <option value="m2">متر مربع (م²)</option>
                      <option value="unit">بلوكة واحدة</option>
                    </select>
                  </div>
                  <Num label={data.blockMode === 'm2' ? 'سعر المتر المربع' : 'سعر البلوكة'} value={item.price} set={(v: string) => updateItem('finishesLabor', item.id, 'price', v)} unit={data.blockMode === 'm2' ? 'م²' : 'بلوكة'}
                    inputRef={(el: any) => refs.current[i] = el} onKeyDown={(e: any) => goNext(e, i, 10)} />
                </div>
              );
            }
            return renderRow('finishesLabor', item, i);
          })}
          <AddBtn onClick={() => addItem('finishesLabor', { id: Date.now(), name: '', price: '', unit: '' })} label="إضافة بند عمالة" />
        </div>
      </div>

      {/* مواد السباكة والكهرباء */}
      <SectionTitle>أسعار مواد السباكة والكهرباء</SectionTitle>
      <div className="model-card" style={{ border: '1px solid #ddd', borderRadius: '12px', overflow: 'hidden', background: 'white' }}>
        <div className="model-body" style={{ padding: '10px 12px' }}>
          {data.finishesExtra.map((item, i) => renderRow('finishesExtra', item, i))}
          <AddBtn onClick={() => addItem('finishesExtra', { id: Date.now(), name: '', price: '', unit: '' })} label="إضافة بند مواد" />
        </div>
      </div>

      {/* بند الأبواب والنوافذ (بالمتر المربع) */}
      <SectionTitle>أسعار الأبواب والنوافذ (بالمتر المربع)</SectionTitle>
      <div className="model-card" style={{ border: '1px solid #ddd', borderRadius: '12px', overflow: 'hidden', background: 'white' }}>
        <div className="model-body" style={{ padding: '10px 12px' }}>
          {data.doorsAndWindows.map((item, i) => renderRow('doorsAndWindows', item, i))}
          <AddBtn onClick={() => addItem('doorsAndWindows', { id: Date.now(), name: '', price: '', unit: 'م²' })} label="إضافة بند أبواب/نوافذ" />
        </div>
      </div>

      {/* الأزرار */}
      <div style={{ display: 'flex', gap: '8px' }}>
        <button onClick={clearPrices} tabIndex={-1} style={{ flex: 1, padding: '12px', border: '2px solid #dc3545', borderRadius: '10px', background: 'white', color: '#dc3545', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer', fontFamily: 'Cairo, sans-serif' }}>تفريغ الأسعار</button>
        <button onClick={() => savePrices(data)} tabIndex={-1} style={{ flex: 1, padding: '12px', border: 'none', borderRadius: '10px', background: '#00509e', color: 'white', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer', fontFamily: 'Cairo, sans-serif' }}>حفظ الأسعار</button>
      </div>
    </div>
  );
};
