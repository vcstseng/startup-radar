import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.js';
import { LanguageProvider } from './lib/language.js';
import './styles.css';
createRoot(document.getElementById('root')!).render(<StrictMode><LanguageProvider><App /></LanguageProvider></StrictMode>);
