import React from 'react';
import type { ClipFrame, CanvasView } from '../../core/types';
import { worldToScreen, PX_PER_METER } from '../../core/geometry';

interface Props {
  clipFrame: ClipFrame | null;
    view: CanvasView;
      width: number;
        height: number;
          selected: boolean;
          }

          export const ClipFrameOverlay: React.FC<Props> = React.memo(({ clipFrame, view, width, height, selected }) => {
            if (!clipFrame) return null;
              const center = worldToScreen(clipFrame.x, clipFrame.y, width, height, view.zoom, view.offsetX, view.offsetY);
                const frameWidth = clipFrame.width * PX_PER_METER * view.zoom;
                  const frameHeight = clipFrame.height * PX_PER_METER * view.zoom;

                    return (
                        <div style={{ position: 'absolute', top: center.y - frameHeight / 2, left: center.x - frameWidth / 2, width: frameWidth, height: frameHeight, border: '2px solid #f00', borderStyle: 'dashed', pointerEvents: 'none', zIndex: 150, transform: `rotate(${clipFrame.rotation}rad)`, transformOrigin: 'center center' }}>
                              {selected && (
                                      <>
                                                <div style={{ position: 'absolute', top: -10, left: '50%', width: 12, height: 12, background: '#f80', borderRadius: '50%', transform: 'translateX(-50%)' }} />
                                                          <div style={{ position: 'absolute', right: -10, top: '50%', width: 12, height: 12, background: '#06f', borderRadius: '50%', transform: 'translateY(-50%)' }} />
                                                                    <div style={{ position: 'absolute', top: '50%', left: '50%', width: 12, height: 12, background: '#0a0', borderRadius: '50%', transform: 'translate(-50%, -50%)' }} />
                                                                            </>
                                                                                  )}
                                                                                      </div>
                                                                                        );
                                                                                        });