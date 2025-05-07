// frontend/App.js
import React, { useEffect, useState } from "react";
import { Route, Routes, BrowserRouter as Router, useNavigate } from "react-router-dom";
import LoginPage from "./components/LoginPage";  // Page de connexion
import DashboardAdmin from "./components/DashboardAdmin"; // Page du tableau de bord Administrateur
import DashboardProf from "./components/DashboardProf"; // Page du tableau de bord Professeur
import DashboardDirectionPedagogique from "./components/DashboardDirectionPedagogique"; // Page du tableau de bord Direction Pédagogique
import { isAuthenticated } from "./services/authService"; // Service pour vérifier l'authentification
import GestionGlobalPage from "./components/GestionGlobalPage"; // Page Gestion Global

const App = () => {
  // const user = isAuthenticated(); // Récupérer l'utilisateur depuis le localStorage
  const navigate = useNavigate();
  const user = isAuthenticated()
  
  const renderDashboard = () => {
    if (!user) {
      navigate("/");
      return
    }

    console.log('User', user)
    
    switch (user.role) {
      case "admin":
        return <DashboardAdmin />;
      case "professor":
        return <DashboardProf />;
      case "Direction Pédagogique":
        return <DashboardDirectionPedagogique />;
      default:
        return <LoginPage />;
    }
  };

  return (
    <div>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/dashboard-admin" element={renderDashboard()} />
        <Route path="/dashboard-prof" element={renderDashboard()} />
        <Route path="/dashboard-pedagogique" element={renderDashboard()} />
        <Route path="/gestion-global" element={<GestionGlobalPage />} />  
        <Route path="/" element={<LoginPage />} />
      </Routes>
    </div>
  );
};

export default App;
