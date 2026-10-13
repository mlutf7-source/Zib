import React, { useRef, useState } from 'react';
import { FinishesPage } from './FinishesPage';
import { PreliminaryPage } from './PreliminaryPage';
import { StructurePage } from './StructurePage';
import { PricesPage } from './PricesPage';
import { SummaryPage } from './SummaryPage';
import type { Wall, Column, Window, Door, CalculationResults, Stair } from '../../core/types';
import type { RoomRegion } from '../../core/regionTypes';

class ErrorBoundary extends React.Component<any, any> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  render() {
    return this.state.hasError ? (
      <div style={{ padding: 20, textAlign: 'center', color: 'red', fontWeight: 700 }}>
        حدث خطأ في هذا التبويب، يرجى إعادة المحاولة.
      </div>
    ) : this.props.children;
  }
}

export type QuantitiesTab = 'preliminary' | 'structure' | 'finishes' | 'prices' | 'summary';
export type QuantitiesDisplay = 'all' | 'controls' | 'content';

interface Props {
  showQuantities: boolean;
  onToggle: () => void;
  activeTab: QuantitiesTab;
  onTabChange: (tab: QuantitiesTab) => void;
  walls: Wall[];
  columns: Column[];
  windows: Window[];
  doors: Door[];
  regions: RoomRegion[];
  stairs: Stair[];
  results: CalculationResults | null;
  canShowQuantities: boolean;
  display?: QuantitiesDisplay;
}

const tabs: { key: QuantitiesTab; label: string; icon: string }[] = [
  { key: 'preliminary', label: 'التمهيدية', icon: '📋' },
  { key: 'structure', label: 'الهيكل', icon: '🏗️' },
  { key: 'finishes', label: 'التشطيبات', icon: '🎨' },
  { key: 'prices', label: 'الأسعار', icon: '💰' },
  { key: 'summary', label: 'الملخص', icon: '📑' },
];

export const QuantitiesPanel: React.FC<Props> = ({
  showQuantities,
  onToggle,
  activeTab,
  onTabChange,
  walls,
  columns,
  windows,
  doors,
  regions,
  stairs,
  results,
  canShowQuantities,
  display = 'all',
}) => {
  void results;
  const [dragY, setDragY] = useState(0);
  const dragStart = useRef<number | null>(null);

  const handleToggle = () => {
    if (!canShowQuantities) {
      alert('يرجى حفظ المشروع أولاً قبل حساب الكميات');
      return;
    }
    setDragY(0);
    onToggle();
  };

  const handlePointerDown = (e: React.PointerEvent) => {
    if (!showQuantities) return;
    dragStart.current = e.clientY;
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (dragStart.current === null) return;
    const y = e.clientY - dragStart.current;
    setDragY(Math.max(0, y));
  };

  const handlePointerUp = () => {
    if (dragStart.current === null) return;
    if (dragY > 100) {
      setDragY(window.innerHeight);
      setTimeout(() => onToggle(), 180);
    } else {
      setDragY(0);
    }
    dragStart.current = null;
  };

  const button = (
    <div style={{ flexShrink: 0, padding: 8, boxSizing: 'border-box' }}>
      <button
        onClick={handleToggle}
        style={{
          width: '100%',
          padding: 12,
          background: canShowQuantities ? '#00509e' : '#9e9e9e',
          color: '#fff',
          border: 'none',
          borderRadius: 10,
          fontWeight: 700,
          fontSize: 16,
          cursor: 'pointer',
          touchAction: 'manipulation',
        }}
      >
        📊 الكميات والتكلفة
      </button>
    </div>
  );

  const tabsBar = (
    <div
      style={{
        flexShrink: 0,
        display: 'flex',
        gap: 8,
        padding: '0 8px 10px',
        overflowX: 'auto',
        overflowY: 'hidden',
        borderBottom: '2px solid #00509e',
        WebkitOverflowScrolling: 'touch',
        boxSizing: 'border-box',
      }}
    >
      {tabs.map(tab => (
        <button
          key={tab.key}
          onClick={() => onTabChange(tab.key)}
          style={{
            flex: '1 0 auto',
            padding: '10px 8px',
            background: activeTab === tab.key ? '#00509e' : '#f0f0f0',
            color: activeTab === tab.key ? '#fff' : '#333',
            border: '1px solid #ccc',
            borderRadius: 8,
            cursor: 'pointer',
            fontWeight: 700,
            fontSize: 13,
            whiteSpace: 'nowrap',
            touchAction: 'manipulation',
          }}
        >
          {tab.icon} {tab.label}
        </button>
      ))}
    </div>
  );

  const content = (
    <div
      style={{
        flex: 1,
        minHeight: 0,
        overflowY: 'auto',
        overflowX: 'hidden',
        WebkitOverflowScrolling: 'touch',
        overscrollBehavior: 'contain',
        padding: '12px 8px 30px',
        boxSizing: 'border-box',
      }}
    >
      <ErrorBoundary>
        <div style={{ display: activeTab === 'preliminary' ? 'block' : 'none' }}>
          <PreliminaryPage walls={walls} />
        </div>
      </ErrorBoundary>

      <ErrorBoundary>
        <div style={{ display: activeTab === 'structure' ? 'block' : 'none' }}>
          <StructurePage walls={walls} />
        </div>
      </ErrorBoundary>

      <ErrorBoundary>
        <div style={{ display: activeTab === 'finishes' ? 'block' : 'none' }}>
          <FinishesPage
            walls={walls}
            columns={columns}
            windows={windows}
            doors={doors}
            regions={regions}
            stairs={stairs}
          />
        </div>
      </ErrorBoundary>

      <ErrorBoundary>
        <div style={{ display: activeTab === 'prices' ? 'block' : 'none' }}>
          <PricesPage />
        </div>
      </ErrorBoundary>

      <ErrorBoundary>
  <div style={{ display: activeTab === 'summary' ? 'block' : 'none' }}>
    {activeTab === 'summary' && <SummaryPage walls={walls} />}
  </div>
</ErrorBoundary>
    </div>
  );

  if (display === 'controls') {
    return (
      <div style={{ width: '100%', boxSizing: 'border-box' }}>
        {button}
        {showQuantities && tabsBar}
      </div>
    );
  }

  if (display === 'content') {
    return showQuantities ? content : null;
  }

  return (
    <div
      style={{
        position: showQuantities ? 'absolute' : 'static',
        inset: showQuantities ? 0 : undefined,
        zIndex: showQuantities ? 50 : undefined,
        width: '100%',
        height: showQuantities ? '100%' : 'auto',
        minHeight: showQuantities ? 0 : undefined,
        background: '#fff',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        boxSizing: 'border-box',
        transform: showQuantities ? `translateY(${dragY}px)` : 'none',
        transition: dragStart.current === null ? 'transform 180ms ease' : 'none',
      }}
    >
      {showQuantities && (
        <div
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          style={{
            height: 18,
            flexShrink: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'grab',
            touchAction: 'none',
          }}
        >
          <div style={{ width: 45, height: 5, borderRadius: 5, background: '#aaa' }} />
        </div>
      )}

      {button}

      {showQuantities && (
        <>
          {tabsBar}
          {content}
        </>
      )}
    </div>
  );
};
