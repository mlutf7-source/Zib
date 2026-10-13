export interface PriceItem {
    id: number;
      name: string;
        price: string;
          unit?: string;
            costType?: 'percent' | 'fixed';
            }

            export interface PricesData {
              currency: string;
                steelUnified: string;
                  concrete: PriceItem[];
                    preliminary: PriceItem[];
                      block: PriceItem[];
                        labor: PriceItem[];
                          other: PriceItem[];
                            finishesMaterials: PriceItem[];
                              finishesLabor: PriceItem[];
                                finishesExtra: PriceItem[];
                                  doorsAndWindows: PriceItem[];
                                    blockMode: 'm2' | 'unit';
                                    }
