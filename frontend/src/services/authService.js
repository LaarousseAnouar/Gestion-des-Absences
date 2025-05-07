// frontend/services/authService.js
import axios from "axios";

export const isAuthenticated = () => {
  const user = localStorage.getItem("user"); // Vérifie si l'utilisateur est dans localStorage
  return user ? JSON.parse(user) : null; // Retourne l'objet utilisateur avec le rôle s'il est connecté
};

export const logout = () => {
  localStorage.removeItem("user");
};

export const login = async (email, password) => {
  try {
    const response = await axios.post("http://localhost:3000/api/login", {
      email,
      password,
    });

    if (response.data.success) {
      localStorage.setItem("user", JSON.stringify(response.data.data)); // Enregistre les informations de l'utilisateur
    }

    return response.data; // Retourne les données de l'utilisateur (role, email, etc.)
  } catch (error) {
    console.error("Erreur de connexion", error);
    throw error;
  }
};
