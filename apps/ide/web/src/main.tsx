import React from 'react';
import ReactDOM from 'react-dom/client';
import { Workbench } from './workbench/Workbench.js';
import './styles/terminal.css';
import './styles/workbench.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Workbench />
  </React.StrictMode>
);
