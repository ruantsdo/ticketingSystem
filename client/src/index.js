import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';

//Providers
import NextProviders from "./providers/nextProviders"

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <NextProviders>
      <App />
    </NextProviders>
  </React.StrictMode>
);

