import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import { ErrorBoundary, GlobalErrorOverlay } from './ErrorBoundary.tsx';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <GlobalErrorOverlay />
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>,
);
