import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

window.addEventListener("unhandledrejection", (event) => {
  const reason = event.reason?.message || event.reason?.toString?.() || '';
  if (
    reason.includes("WebSocket") ||
    reason.includes("websocket") ||
    reason.includes("vite") ||
    reason.includes("HMR") ||
    reason.includes("Failed to fetch dynamically imported module")
  ) {
    event.preventDefault();
  }
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
