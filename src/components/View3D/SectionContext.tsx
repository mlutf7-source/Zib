import React from 'react';
import * as THREE from 'three';
/**
 * ✅ سياق لمستويات القص — يُوفّر لكل طفل في الدور
  * قيمة فارغة [] = لا قص (الدور كامل)
   * قيمة بمستوى واحد = قص عند ارتفاع محدد
    */
    export const SectionContext = React.createContext<THREE.Plane[]>([]);
    export const useSectionPlanes = (): THREE.Plane[] => React.useContext(SectionContext);