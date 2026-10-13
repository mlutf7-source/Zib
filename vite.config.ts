import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
export default defineConfig({
  plugins: [react()],
    // ✅ لا تفحص هذه الحزم (لا تُستخدم في dev)
      optimizeDeps: {
          exclude: [
                '@capacitor/core',
                      '@capacitor/app',
                            '@capacitor/cli',
                                  '@capacitor/filesystem',
                                        '@capacitor/share',
                                              '@capacitor/android',
                                                  ],
                                                      include: [
                                                            'react',
                                                                  'react-dom',
                                                                        'react/jsx-runtime',
                                                                              'three',
                                                                                    '@react-three/fiber',
                                                                                          '@react-three/drei',
                                                                                              ],
                                                                                                  esbuildOptions: {
                                                                                                        target: 'es2020',
                                                                                                            },
                                                                                                              },
                                                                                                                server: {
                                                                                                                    fs: {
                                                                                                                          strict: false,
                                                                                                                              },
                                                                                                                                  hmr: {
                                                                                                                                        overlay: false,
                                                                                                                                            },
                                                                                                                                                // ✅ مراقبة ملفات أقل = تشغيل أسرع
                                                                                                                                                    watch: {
                                                                                                                                                          ignored: ['**/node_modules/**', '**/.git/**', '**/android/**', '**/ios/**'],
                                                                                                                                                              },
                                                                                                                                                                },
                                                                                                                                                                  build: {
                                                                                                                                                                      target: 'es2020',
                                                                                                                                                                          sourcemap: false,
                                                                                                                                                                              chunkSizeWarningLimit: 5000,
                                                                                                                                                                                },
                                                                                                                                                                                });