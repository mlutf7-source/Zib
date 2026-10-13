import * as THREE from 'three';

const TEXTURE_WORLD_SIZE = 2;

// ✅ رخام — صفوف 25 سم بدون خطوط سوداء
export function createMarbleTexture(): THREE.Texture {
  const SIZE = 1024;
    const canvas = document.createElement('canvas');
      canvas.width = SIZE; canvas.height = SIZE;
        const ctx = canvas.getContext('2d')!;

          // خلفية بيضاء عاجية
            ctx.fillStyle = '#F5F0E8';
              ctx.fillRect(0, 0, SIZE, SIZE);

                // ضوضاء دقيقة
                  for (let i = 0; i < 2200; i++) {
                      const x = Math.random() * SIZE;
                          const y = Math.random() * SIZE;
                              ctx.fillStyle = `rgba(215, 210, 200, ${0.02 + Math.random() * 0.05})`;
                                  ctx.fillRect(x, y, 2, 2);
                                    }

                                      // 8 صفوف × 25 سم
                                        const ROWS = 8;
                                          const rowPx = SIZE / ROWS;
                                            const groovePx = Math.round(rowPx * (1 / 25));

                                              for (let r = 0; r < ROWS; r++) {
                                                  const y = r * rowPx;
                                                      const shade = 248 - Math.floor(Math.random() * 4);
                                                          ctx.fillStyle = `rgb(${shade}, ${shade - 2}, ${shade - 6})`;
                                                              ctx.fillRect(0, y, SIZE, rowPx - groovePx);

                                                                  // ✅ خط الفاصل — رمادي فاتح بدل الأسود
                                                                      ctx.fillStyle = 'rgba(180, 175, 165, 0.6)';
                                                                          ctx.fillRect(0, y + rowPx - groovePx, SIZE, groovePx);

                                                                              // لمعة
                                                                                  ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
                                                                                      ctx.fillRect(0, y + rowPx - groovePx - 1.5, SIZE, 1.5);
                                                                                        }

                                                                                          const tex = new THREE.CanvasTexture(canvas);
                                                                                            tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
                                                                                              tex.colorSpace = THREE.SRGBColorSpace;
                                                                                                tex.anisotropy = 8;
                                                                                                  return tex;
                                                                                                  }

                                                                                                  // ✅ بلوك — 40×20 سم مع مونة رمادية فاتحة
                                                                                                  export function createBlockTexture(): THREE.Texture {
                                                                                                    const SIZE = 1024;
                                                                                                      const canvas = document.createElement('canvas');
                                                                                                        canvas.width = SIZE; canvas.height = SIZE;
                                                                                                          const ctx = canvas.getContext('2d')!;

                                                                                                            ctx.fillStyle = '#8A8580';
                                                                                                              ctx.fillRect(0, 0, SIZE, SIZE);

                                                                                                                const cols = 5;
                                                                                                                  const rows = 10;
                                                                                                                    const bw = SIZE / cols;
                                                                                                                      const bh = SIZE / rows;
                                                                                                                        const mortar = 5;

                                                                                                                          for (let r = 0; r < rows; r++) {
                                                                                                                              const offset = (r % 2) * (bw / 2);
                                                                                                                                  for (let c = -1; c <= cols; c++) {
                                                                                                                                        const x = c * bw + offset;
                                                                                                                                              const y = r * bh;
                                                                                                                                                    const shade = 172 + Math.floor(Math.random() * 18);
                                                                                                                                                          ctx.fillStyle = `rgb(${shade}, ${shade - 2}, ${shade - 6})`;
                                                                                                                                                                ctx.fillRect(x + mortar / 2, y + mortar / 2, bw - mortar, bh - mortar);

                                                                                                                                                                      for (let i = 0; i < 45; i++) {
                                                                                                                                                                              const px = x + mortar + Math.random() * (bw - mortar * 2);
                                                                                                                                                                                      const py = y + mortar + Math.random() * (bh - mortar * 2);
                                                                                                                                                                                              const s = 1 + Math.random() * 1.5;
                                                                                                                                                                                                      ctx.fillStyle = `rgba(120, 118, 114, ${0.04 + Math.random() * 0.09})`;
                                                                                                                                                                                                              ctx.fillRect(px, py, s, s);
                                                                                                                                                                                                                    }

                                                                                                                                                                                                                          ctx.fillStyle = 'rgba(0, 0, 0, 0.15)';
                                                                                                                                                                                                                                ctx.fillRect(x + mortar / 2, y + bh - mortar - 2.5, bw - mortar, 2.5);
                                                                                                                                                                                                                                    }
                                                                                                                                                                                                                                      }

                                                                                                                                                                                                                                        const tex = new THREE.CanvasTexture(canvas);
                                                                                                                                                                                                                                          tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
                                                                                                                                                                                                                                            tex.colorSpace = THREE.SRGBColorSpace;
                                                                                                                                                                                                                                              tex.anisotropy = 8;
                                                                                                                                                                                                                                                return tex;
                                                                                                                                                                                                                                                }

                                                                                                                                                                                                                                                // ✅ حجر طبيعي
                                                                                                                                                                                                                                                export function createStoneTexture(): THREE.Texture {
                                                                                                                                                                                                                                                  const SIZE = 1024;
                                                                                                                                                                                                                                                    const canvas = document.createElement('canvas');
                                                                                                                                                                                                                                                      canvas.width = SIZE; canvas.height = SIZE;
                                                                                                                                                                                                                                                        const ctx = canvas.getContext('2d')!;

                                                                                                                                                                                                                                                          ctx.fillStyle = '#5a5045';
                                                                                                                                                                                                                                                            ctx.fillRect(0, 0, SIZE, SIZE);

                                                                                                                                                                                                                                                              for (let i = 0; i < 160; i++) {
                                                                                                                                                                                                                                                                  const x = Math.random() * SIZE;
                                                                                                                                                                                                                                                                      const y = Math.random() * SIZE;
                                                                                                                                                                                                                                                                          const w = 60 + Math.random() * 110;
                                                                                                                                                                                                                                                                              const h = 40 + Math.random() * 70;
                                                                                                                                                                                                                                                                                  const shade = 45 + Math.floor(Math.random() * 35);
                                                                                                                                                                                                                                                                                      ctx.fillStyle = `hsl(32, 12%, ${shade}%)`;
                                                                                                                                                                                                                                                                                          ctx.beginPath();
                                                                                                                                                                                                                                                                                              const n = 6;
                                                                                                                                                                                                                                                                                                  for (let j = 0; j < n; j++) {
                                                                                                                                                                                                                                                                                                        const angle = (j / n) * Math.PI * 2 + Math.random() * 0.3;
                                                                                                                                                                                                                                                                                                              const rx = (w / 2) * (0.7 + Math.random() * 0.5);
                                                                                                                                                                                                                                                                                                                    const ry = (h / 2) * (0.7 + Math.random() * 0.5);
                                                                                                                                                                                                                                                                                                                          const px = x + Math.cos(angle) * rx;
                                                                                                                                                                                                                                                                                                                                const py = y + Math.sin(angle) * ry;
                                                                                                                                                                                                                                                                                                                                      if (j === 0) ctx.moveTo(px, py);
                                                                                                                                                                                                                                                                                                                                            else ctx.lineTo(px, py);
                                                                                                                                                                                                                                                                                                                                                }
                                                                                                                                                                                                                                                                                                                                                    ctx.closePath();
                                                                                                                                                                                                                                                                                                                                                        ctx.fill();
                                                                                                                                                                                                                                                                                                                                                            ctx.strokeStyle = '#3a3227';
                                                                                                                                                                                                                                                                                                                                                                ctx.lineWidth = 2;
                                                                                                                                                                                                                                                                                                                                                                    ctx.stroke();
                                                                                                                                                                                                                                                                                                                                                                      }

                                                                                                                                                                                                                                                                                                                                                                        const tex = new THREE.CanvasTexture(canvas);
                                                                                                                                                                                                                                                                                                                                                                          tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
                                                                                                                                                                                                                                                                                                                                                                            tex.colorSpace = THREE.SRGBColorSpace;
                                                                                                                                                                                                                                                                                                                                                                              tex.anisotropy = 8;
                                                                                                                                                                                                                                                                                                                                                                                return tex;
                                                                                                                                                                                                                                                                                                                                                                                }

                                                                                                                                                                                                                                                                                                                                                                                export function getWallTexture(type: string): THREE.Texture | null {
                                                                                                                                                                                                                                                                                                                                                                                  switch (type) {
                                                                                                                                                                                                                                                                                                                                                                                      case 'marble': return createMarbleTexture();
                                                                                                                                                                                                                                                                                                                                                                                          case 'block': return createBlockTexture();
                                                                                                                                                                                                                                                                                                                                                                                              case 'stone': return createStoneTexture();
                                                                                                                                                                                                                                                                                                                                                                                                  default: return null;
                                                                                                                                                                                                                                                                                                                                                                                                    }
                                                                                                                                                                                                                                                                                                                                                                                                    }

                                                                                                                                                                                                                                                                                                                                                                                                    export function getTextureRepeatScale(): number {
                                                                                                                                                                                                                                                                                                                                                                                                      return 1 / TEXTURE_WORLD_SIZE;
                                                                                                                                                                                                                                                                                                                                                                                                      }