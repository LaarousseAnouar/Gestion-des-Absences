// frontend/components/LoginPage.js
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { login, logout } from "../services/authService"; // Service d'authentification
import './LoginPage.css';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!email || !password) {
      setError("Veuillez entrer un email et un mot de passe.");
      return;
    }

    try {
      const response = await login(email, password);

      if (response.success) {
        const { role } = response.data; // Récupérer le rôle de l'utilisateur depuis la réponse

        // Vérifier et rediriger en fonction du rôle
        if (role === "admin") {
          navigate("/dashboard-admin");
        } else if (role === "professor") {
          navigate("/dashboard-prof");
        } else if (role === "Direction Pédagogique") {
          navigate("/dashboard-pedagogique");
        } else {
          setError("Rôle inconnu.");
        }
      } else {
        setError("Email ou mot de passe incorrect.");
      }
    } catch (error) {
      setError("Une erreur est survenue, veuillez réessayer.");
    }
  };

  return (
    <div className="login-container">
      <div className="logo-container">
        <img src="/images/logo.webp" alt="Logo de l'école" className="school-logo" />
      </div>

      <div className="description-card">
        <h4>Bienvenue à ITEIP Fès</h4>
        <p>Nous formons des professionnels compétents dans les domaines de l'informatique et de l'économie. Rejoignez-nous pour un avenir prometteur !</p>
      </div>

      <div className="login-form">
        <form onSubmit={handleLogin}>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              placeholder="Entrez votre email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input-field"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Mot de passe</label>
            <input
              type="password"
              id="password"
              placeholder="Entrez votre mot de passe"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input-field"
              required
            />
          </div>

          {error && <p className="text-danger">{error}</p>}

          <button type="submit" className="login-btn">
            Se connecter
          </button>
        </form>

        <div className="forgot-password">
          <a href="#">Mot de passe oublié ?</a>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
