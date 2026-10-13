import type { Point } from './types';

export interface Dimension {
  id: string;
      start: Point;
            end: Point;
                    offset: number;
                              // إضافة حقل جديد لتحديد الوجه (1 = خارجي، -1 = داخلي)
                                          faceSide?: 1 | -1;
       floor?: number;
                                        }