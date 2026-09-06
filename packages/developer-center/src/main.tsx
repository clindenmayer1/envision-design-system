import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';

// THE production artifacts, not copies: the same token CSS and the same custom elements the
// Envision product ships. Every live example on this site is therefore the real component.
import '@envision/tokens/css';
import '@envision/components';
import './styles/app.css';

import { App } from './App';

createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>,
);
