import ReactDOM from 'react-dom/client'
import './index.css'
import { getOrCreateSessionId } from './utils/session.ts';
import { initAPI } from './apis/base.ts';
import React from 'react';
import { RouterProvider } from 'react-router-dom';
import { router } from './app/router';

getOrCreateSessionId();
initAPI()

ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
      <RouterProvider router={router} />
    </React.StrictMode>
  );
