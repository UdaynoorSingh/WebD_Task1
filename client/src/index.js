import React from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App';

const rootEl = document.getElementById('root');
const root = createRoot(rootEl);

// Apply initial theme class to <html>
const initialTheme = localStorage.getItem('theme') || 'dark';
if (initialTheme === 'light') document.documentElement.classList.add('light');

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

