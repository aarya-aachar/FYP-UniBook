/**
 * React Application Bootstrap
 * 
 * relative path: /src/index.js
 * 
 * This is the very first file that runs in the browser. It finds the 
 * "root" div in our HTML and injects the entire React application into it.
 */

import React from 'react';
import ReactDOM from 'react-dom/client';
import './tailwind.css'; // Global styles and Tailwind utilities
import App from './App';

const root = ReactDOM.createRoot(document.getElementById('root'));

/**
 * root.render
 * We wrap <App /> in <StrictMode> to catch common bugs during development.
 */
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
