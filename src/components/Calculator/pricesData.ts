import type { PricesData, PriceItem } from './pricesTypes';

const STORAGE_KEY = 'prices_v2';

export const n = (v: any): number => { const num = parseFloat(v); return isNaN(num) ? 0 : num; };
export const unformat = (v: string): string => v.replace(/,/g, '');
export const formatNum = (val: string): string => {
  if (!val && val !== '0') return '';
    const num = parseFloat(val.replace(/,/g, ''));
      if (isNaN(num)) return val;
        return num.toLocaleString('en-US');
        };

        export const defaults: PricesData = {
          currency: 'YER',
            steelUnified: '3500',
              concrete: [
                  { id: 1, name: 'خرسانة النظافة', price: '350', unit: 'م³' },
                      { id: 2, name: 'خرسانة الهيكل', price: '450', unit: 'م³' },
                          { id: 3, name: 'خرسانة الخزان', price: '500', unit: 'م³' },
                            ],
                              preliminary: [
                                  { id: 1, name: 'الحفر', price: '50', unit: 'م³' },
                                      { id: 2, name: 'الردم', price: '40', unit: 'م³' },
                                          { id: 3, name: 'الكرسي الحجري', price: '60', unit: 'م²' },
                                            ],
                                              block: [
                                                  { id: 1, name: 'البلوك العادي', price: '5', unit: 'بلوكة' },
                                                      { id: 2, name: 'بلوك السقف / الهوردي', price: '8', unit: 'بلوكة' },
                                                        ],
                                                          labor: [
                                                              { id: 1, name: 'أجر المقاول للمتر المكعب للهيكل الخرساني', price: '120', unit: 'م³' },
                                                                  { id: 2, name: 'أجر المقاول للمتر المكعب للخزان', price: '150', unit: 'م³' },
                                                                      { id: 3, name: 'أجر الحدادة للمتر المكعب', price: '80', unit: 'م³' },
                                                                          { id: 4, name: 'أجر النجارة للمتر المكعب', price: '70', unit: 'م³' },
                                                                            ],
                                                                              other: [
                                                                                  { id: 1, name: 'المخططات والإشراف الهندسي', price: '5', unit: '%', costType: 'percent' },
                                                                                      { id: 2, name: 'التراخيص', price: '2', unit: '%', costType: 'percent' },
                                                                                          { id: 3, name: 'الحراسة', price: '1', unit: '%', costType: 'percent' },
                                                                                              { id: 4, name: 'نقل وترتيب المواد', price: '3', unit: '%', costType: 'percent' },
                                                                                                ],
                                                                                                  finishesMaterials: [
                                                                                                      { id: 1, name: 'البلوك', price: '5', unit: 'بلوكة' },
                                                                                                          { id: 2, name: 'الرخام', price: '80', unit: 'م²' },
                                                                                                              { id: 3, name: 'الأسمنت', price: '1200', unit: 'كيس' },
                                                                                                                  { id: 4, name: 'الرمل', price: '150', unit: 'م³' },
                                                                                                                      { id: 5, name: 'الركام', price: '200', unit: 'م³' },
                                                                                                                          { id: 6, name: 'المعجون', price: '5', unit: 'كجم' },
                                                                                                                              { id: 7, name: 'البرايمر', price: '20', unit: 'كجم' },
                                                                                                                                  { id: 8, name: 'الطلاء', price: '120', unit: 'كجم' },
                                                                                                                                      { id: 9, name: 'البلاط', price: '35', unit: 'م²' },
                                                                                                                                          { id: 10, name: 'بلاط السلم', price: '50', unit: 'درجة' },
                                                                                                                                            ],
                                                                                                                                              finishesLabor: [
                                                                                                                                                  { id: 1, name: 'بناء البلوك', price: '25', unit: 'م²' },
                                                                                                                                                      { id: 2, name: 'تركيب الرخام', price: '40', unit: 'م²' },
                                                                                                                                                          { id: 3, name: 'التلييس', price: '20', unit: 'م²' },
                                                                                                                                                              { id: 4, name: 'الطلاء', price: '15', unit: 'م²' },
                                                                                                                                                                  { id: 5, name: 'تركيب البلاط', price: '30', unit: 'م²' },
                                                                                                                                                                      { id: 6, name: 'عمالة كهرباء بالنقطة', price: '50', unit: 'نقطة' },
                                                                                                                                                                          { id: 7, name: 'عمالة سباكة بالنقطة', price: '60', unit: 'نقطة' },
                                                                                                                                                                            ],
                                                                                                                                                                              finishesExtra: [
                                                                                                                                                                                  { id: 1, name: 'مواد سباكة الحمام', price: '800', unit: 'حمام' },
                                                                                                                                                                                      { id: 2, name: 'مواد سباكة المطبخ', price: '1200', unit: 'مطبخ' },
                                                                                                                                                                                          { id: 3, name: 'مواد كهرباء المتر المربع', price: '50', unit: 'م²' },
                                                                                                                                                                                            ],
                                                                                                                                                                                              doorsAndWindows: [
                                                                                                                                                                                                  { id: 1, name: 'شباك حماية', price: '150', unit: 'م²' },
                                                                                                                                                                                                      { id: 2, name: 'نوافذ ألمنيوم', price: '300', unit: 'م²' },
                                                                                                                                                                                                          { id: 3, name: 'أبواب', price: '500', unit: 'م²' },
                                                                                                                                                                                                            ],
                                                                                                                                                                                                              blockMode: 'm2',
                                                                                                                                                                                                              };

                                                                                                                                                                                                              export const getInitial = (): PricesData => {
                                                                                                                                                                                                                try {
                                                                                                                                                                                                                    const stored = localStorage.getItem(STORAGE_KEY);
                                                                                                                                                                                                                        if (stored) {
                                                                                                                                                                                                                              const parsed = JSON.parse(stored);
                                                                                                                                                                                                                                    return { ...defaults, ...parsed, doorsAndWindows: parsed.doorsAndWindows?.length ? parsed.doorsAndWindows : defaults.doorsAndWindows };
                                                                                                                                                                                                                                        }
                                                                                                                                                                                                                                          } catch (e) {}
                                                                                                                                                                                                                                            return defaults;
                                                                                                                                                                                                                                            };

                                                                                                                                                                                                                                            export const savePrices = (data: PricesData) => localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
