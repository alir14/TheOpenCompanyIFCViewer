import React from 'react';
import ReactDOM from 'react-dom';
import { createRoot } from 'react-dom/client';
import App from './App';

const appContainer = document.getElementById('root');
const root = createRoot(appContainer!);

root.render(<App />);
