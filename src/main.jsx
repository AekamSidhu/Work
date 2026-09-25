import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import './styles/base.css';
import './styles/letter.css';
import './styles/editor.css';
import './styles/mobile.css';
import './styles/desktop.css';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
