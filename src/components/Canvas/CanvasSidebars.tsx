import React from 'react';

interface Props {
  showRightSidebar: boolean;
  showLeftSidebar: boolean;
  lockOptions: {
    direction: boolean;
    length: boolean;
    move: boolean;
  };
  onToggleLockDirection: () => void;
  onToggleLockLength: () => void;
  onToggleLockMove: () => void;
  onDeleteWall: () => void;
  onCopyWall: () => void;
  onDeleteColumn: () => void;
  onDeleteWindow: () => void;
  onDeleteDoor: () => void;
  onDeleteDimension: () => void;
  onCopyText: () => void;
  onDeleteText: () => void;
  onDeleteRegion: () => void;
  onDeleteStair: () => void;
  onDeleteStairElement: () => void;
  onCopyStairElement: () => void;
  onDeleteAxis: () => void;
  onDeselectAll: () => void;
  selectedType: 'wall' | 'column' | 'window' | 'door' | 'dimension' | 'text' | 'region' | 'stair' | 'stairElement' | 'axis' | null;
  onCopyAxis?: () => void;
}

const btnStyle: React.CSSProperties = {
  padding: '6px 8px',
  borderRadius: 6,
  border: '1px solid #ccc',
  background: '#fff',
  cursor: 'pointer',
  fontSize: 16,
};

export const CanvasSidebars: React.FC<Props> = React.memo(({
  showRightSidebar,
  showLeftSidebar,
  lockOptions,
  onToggleLockDirection,
  onToggleLockLength,
  onToggleLockMove,
  onDeleteWall,
  onCopyWall,
  onDeleteColumn,
  onDeleteWindow,
  onDeleteDoor,
  onDeleteDimension,
  onCopyText,
  onDeleteText,
  onDeleteRegion,
  onDeleteStair,
onDeleteStairElement,
onCopyStairElement,
onDeleteAxis,
onDeselectAll,
  selectedType,
  onCopyAxis,
}) => {
  return (
    <>
      {showRightSidebar && (
        <div
          style={{
            position: 'absolute',
            right: 8,
            top: 8,
            display: 'flex',
            flexDirection: 'column',
            gap: 6,
            zIndex: 20,
          }}
          onPointerDown={e => e.stopPropagation()}
          onPointerUp={e => e.stopPropagation()}
        >
          <button onClick={onToggleLockDirection} title="قفل الاتجاه" style={{ ...btnStyle, background: lockOptions.direction ? '#06f' : '#fff', color: lockOptions.direction ? '#fff' : '#000' }}>📐</button>
          <button onClick={onToggleLockLength} title="قفل الطول" style={{ ...btnStyle, background: lockOptions.length ? '#06f' : '#fff', color: lockOptions.length ? '#fff' : '#000' }}>📏</button>
          <button onClick={onToggleLockMove} title="قفل التحريك" style={{ ...btnStyle, background: lockOptions.move ? '#06f' : '#fff', color: lockOptions.move ? '#fff' : '#000' }}>🔒</button>
        </div>
      )}

      {showLeftSidebar && (
        <div
          style={{
            position: 'absolute',
            left: 8,
            top: 8,
            display: 'flex',
            flexDirection: 'column',
            gap: 6,
            zIndex: 20,
          }}
          onPointerDown={e => e.stopPropagation()}
          onPointerUp={e => e.stopPropagation()}
        >
          {selectedType === 'wall' && (
            <>
              <button onClick={onCopyWall} title="نسخ" style={{ ...btnStyle, background: '#06f', color: '#fff' }}>📋</button>
              <button onClick={onDeleteWall} title="حذف" style={{ ...btnStyle, background: '#e44', color: '#fff' }}>🗑</button>
            </>
          )}
          {selectedType === 'column' && (
            <button onClick={onDeleteColumn} title="حذف العمود" style={{ ...btnStyle, background: '#e44', color: '#fff' }}>🗑</button>
          )}
          {selectedType === 'window' && (
            <button onClick={onDeleteWindow} title="حذف النافذة" style={{ ...btnStyle, background: '#e44', color: '#fff' }}>🗑</button>
          )}
          {selectedType === 'door' && (
            <button onClick={onDeleteDoor} title="حذف الباب" style={{ ...btnStyle, background: '#e44', color: '#fff' }}>🗑</button>
          )}
          {selectedType === 'dimension' && (
            <button onClick={onDeleteDimension} title="حذف البعد" style={{ ...btnStyle, background: '#e44', color: '#fff' }}>🗑</button>
          )}
          {selectedType === 'text' && (
            <>
              <button onClick={onCopyText} title="نسخ النص" style={{ ...btnStyle, background: '#06f', color: '#fff' }}>📋</button>
              <button onClick={onDeleteText} title="حذف النص" style={{ ...btnStyle, background: '#e44', color: '#fff' }}>🗑</button>
            </>
          )}
          {selectedType === 'region' && (
            <button onClick={onDeleteRegion} title="حذف المنطقة" style={{ ...btnStyle, background: '#e44', color: '#fff' }}>🗑</button>
          )}
          {selectedType === 'stair' && (
  <button onClick={onDeleteStair} title="حذف السلم" style={{ ...btnStyle, background: '#e44', color: '#fff' }}>🗑</button>
)}
{selectedType === 'stairElement' && (
  <>
    <button onClick={onCopyStairElement} title="نسخ" style={{ ...btnStyle, background: '#06f', color: '#fff' }}>📋</button>
    <button onClick={onDeleteStairElement} title="حذف" style={{ ...btnStyle, background: '#e44', color: '#fff' }}>🗑</button>
  </>
)}
          {selectedType === 'axis' && (
  <>
    {onCopyAxis && (
      <button onClick={onCopyAxis} title="نسخ المحور" style={{ ...btnStyle, background: '#06f', color: '#fff' }}>📋</button>
    )}
    <button onClick={onDeleteAxis} title="حذف المحور" style={{ ...btnStyle, background: '#e44', color: '#fff' }}>🗑</button>
  </>
)}

          <button onClick={onDeselectAll} title="إلغاء التحديد" style={{ ...btnStyle, background: '#555', color: '#fff' }}>✖</button>
        </div>
      )}
    </>
  );
});
