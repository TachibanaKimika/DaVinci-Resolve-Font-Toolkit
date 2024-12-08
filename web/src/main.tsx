import React from 'react';
import ReactDOM from 'react-dom/client';

import App from './App';

import './main.scss'

const awaitReady = () => new Promise<void>(res => {
  const interval = setInterval(() => {
    if (typeof window.pywebview !== 'undefined') {
      clearInterval(interval);
      res();
    }
    console.log('waiting for pywebview');
  }, 50);
});

(async () => {
  await awaitReady();
  ReactDOM.createRoot(document.getElementById('root')!).render(<App />);
})();
