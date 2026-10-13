import React, { useState } from 'react';
export interface LayersState {
    walls: boolean;
      landBoundaries: boolean;
        helperLines: boolean;
          dimensions: boolean;
            columns: boolean;
              windows: boolean;
                doors: boolean;
                  texts: boolean;
                    regions: boolean;
                      stairs: boolean;
                        northArrow: boolean;
                          axes: boolean;
                          }

interface Props { layers: LayersState; onToggleLayer: (layer: keyof LayersState) => void; onToggleAll: () => void; allUnlocked: boolean; }
export const LayersPanel: React.FC<Props> = ({ layers, onToggleLayer, onToggleAll, allUnlocked }) => {
  const [open, setOpen] = useState(false);
  const layerItems: { key: keyof LayersState; label: string; icon: string }[] = [
      { key: 'walls', label: 'الجدران', icon: '🧱' },
        { key: 'landBoundaries', label: 'حدود الأرض', icon: '🟢' },
          { key: 'helperLines', label: 'الخطوط المساعدة', icon: '🔵' },
            { key: 'dimensions', label: 'الأبعاد', icon: '📏' },
  
    { key: 'columns', label: 'الأعمدة', icon: '📌' },
    { key: 'windows', label: 'النوافذ', icon: '🪟' },
    { key: 'doors', label: 'الأبواب', icon: '🚪' },
    { key: 'texts', label: 'النصوص', icon: '📝' },
    { key: 'regions', label: 'المناطق', icon: '🗺️' },
    { key: 'stairs', label: 'السلالم', icon: '🪜' },
    { key: 'axes', label: 'المحاور', icon: '📐' },
  ];
  return (
    <div style={{ position: 'relative', display: 'inline-block' }}>
      <button onClick={() => setOpen(prev => !prev)} style={{ padding: '8px 14px', borderRadius: 6, border: '1px solid #ccc', background: '#fff', cursor: 'pointer' }}>
        {allUnlocked ? '🔓 الطبقات' : '🔒 الطبقات'}
      </button>
      {open && (
        <div style={{ position: 'absolute', top: '100%', left: 0, zIndex: 100, background: '#fff', border: '1px solid #ccc', borderRadius: 8, padding: 8, minWidth: 180, boxShadow: '0 4px 8px rgba(0,0,0,0.1)' }}>
          <div style={{ fontWeight: 'bold', marginBottom: 6 }}>🔒 قفل الطبقات</div>
          {layerItems.map(item => (
            <div key={item.key} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 4px', borderBottom: '1px solid #eee' }}>
              <span>{item.icon} {item.label}</span>
              <button onClick={() => onToggleLayer(item.key)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 18 }}>
                {layers[item.key] ? '🔓' : '🔒'}
              </button>
            </div>
          ))}
          <div style={{ marginTop: 6, textAlign: 'center' }}>
            <button onClick={onToggleAll} style={{ padding: '6px 12px', borderRadius: 4, border: '1px solid #ccc', background: '#f0f0f0', cursor: 'pointer', fontSize: 12 }}>
              {allUnlocked ? 'قفل الكل' : 'فتح الكل'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
