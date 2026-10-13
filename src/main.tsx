import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

// ✅ مراقب الأخطاء العام (مؤقت للتشخيص)
window.addEventListener('error', (e) => {
  const root = document.getElementById('root');
    if (root) {
        root.innerHTML = `
              <div style="padding:20px;background:#fff;color:#c00;font-family:monospace;direction:ltr;font-size:14px;line-height:1.5">
                      <h2 style="margin:0 0 10px 0">🚨 Runtime Error</h2>
                              <div><b>Message:</b> ${e.message}</div>
                                      <div><b>File:</b> ${e.filename}</div>
                                              <div><b>Line:</b> ${e.lineno}:${e.colno}</div>
                                                      ${e.error?.stack ? `<pre style="background:#f5f5f5;padding:10px;overflow:auto;font-size:12px">${e.error.stack}</pre>` : ''}
                                                            </div>
                                                                `;
                                                                  }
                                                                  });
                                                                  window.addEventListener('unhandledrejection', (e) => {
                                                                    const root = document.getElementById('root');
                                                                      if (root) {
                                                                          root.innerHTML = `
                                                                                <div style="padding:20px;background:#fff;color:#c00;font-family:monospace;direction:ltr;font-size:14px">
                                                                                        <h2>🚨 Unhandled Promise</h2>
                                                                                                <pre>${JSON.stringify(e.reason, null, 2)}</pre>
                                                                                                      </div>
                                                                                                          `;
                                                                                                            }
                                                                                                            });
                                                                                                            ReactDOM.createRoot(document.getElementById('root')!).render(
                                                                                                              <React.StrictMode>
                                                                                                                  <App />
                                                                                                                    </React.StrictMode>
                                                                                                                    );