// frontend/App.js
import React from "react";
import { Route, Routes, useNavigate } from "react-router-dom";
import LoginPage from "./components/LoginPage";
import DashboardAdmin from "./components/DashboardAdmin";
import DashboardProf from "./components/DashboardProf";
import DashboardDirectionPedagogique from "./components/DashboardDirectionPedagogique";
import GestionGlobalPage from "./components/GestionGlobalPage";
import { isAuthenticated } from "./services/authService";

// Import react-toastify
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const App = () => {
  const navigate = useNavigate();
  const user = isAuthenticated();

  const renderDashboard = () => {
    if (!user) {
      navigate("/");
      return;
    }

    console.log("User", user);

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
    <>
      {/* ToastContainer placé ici, au sommet de l'app */}
      <ToastContainer position="top-right" autoClose={6000} hideProgressBar />

      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/dashboard-admin" element={renderDashboard()} />
        <Route path="/dashboard-prof" element={renderDashboard()} />
        <Route path="/dashboard-pedagogique" element={renderDashboard()} />
        <Route path="/gestion-global" element={<GestionGlobalPage />} />
        <Route path="/" element={<LoginPage />} />
      </Routes>
    </>
  );
};

export default App;
