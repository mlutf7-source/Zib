import type { Point } from './types';

export type RegionType = 'kitchen' | 'bathroom';

export interface RoomRegion {
  id: string;
    type: RegionType;
      polygon: Point[];
        area: number;
          wallIds: string[];
          floor?: number;
          }