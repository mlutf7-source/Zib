import { useState, useCallback } from 'react';
import type { StairElement, Point } from '../core/types';
import { v4 as uuidv4 } from 'uuid';

export function useStairElementManager() {
  const [stairElements, setStairElements] = useState<StairElement[]>([]);

  const addElementAtPoint = useCallback(
    (config: Omit<StairElement, 'id' | 'position' | 'rotation'>, pt: Point) => {
      const newEl: StairElement = {
        ...config,
        id: uuidv4(),
        position: { ...pt },
        rotation: 0,
      };
      setStairElements(prev => [...prev, newEl]);
    },
    []
  );

  const updateElement = useCallback((id: string, patch: Partial<StairElement>) => {
    setStairElements(prev => prev.map(el => (el.id === id ? { ...el, ...patch } : el)));
  }, []);

  const rotateElementById = useCallback((id: string) => {
    setStairElements(prev =>
      prev.map(el =>
        el.id === id ? { ...el, rotation: (el.rotation + Math.PI / 2) % (Math.PI * 2) } : el
      )
    );
  }, []);

  const removeElement = useCallback((id: string) => {
    setStairElements(prev => prev.filter(el => el.id !== id));
  }, []);

  const setAllElements = useCallback((list: StairElement[]) => {
    setStairElements(list);
  }, []);

  return {
    stairElements,
    addElementAtPoint,
    updateElement,
    rotateElementById,
    removeElement,
    setAllElements,
  };
}
