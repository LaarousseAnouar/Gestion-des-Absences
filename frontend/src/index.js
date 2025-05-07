import React from "react";
import ReactDOM from "react-dom/client";
import './index.css';
import App from './App';
import { BrowserRouter as Router } from "react-router-dom";  // Importation de BrowserRouter

// Créez un root pour React 18+
const root = ReactDOM.createRoot(document.getElementById('root'));

// Enveloppez toute l'application dans un seul BrowserRouter
root.render(
  <Router>
    <App />
  </Router>
);
