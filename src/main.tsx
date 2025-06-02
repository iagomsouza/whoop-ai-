import React from 'react';
import ReactDOM from 'react-dom/client';
import ChatInterface from './components/ChatInterface';
import './index.css'; // We'll create this for basic global styles

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ChatInterface />
  </React.StrictMode>
);
