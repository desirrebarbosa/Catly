import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './mobile/App';

// This file serves as a placeholder for web-rendering if needed, 
// though the primary focus is the 'mobile' directory for React Native.
const rootElement = document.getElementById('root');
if (rootElement) {
  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
}
