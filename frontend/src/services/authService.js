// frontend/services/authService.js
import axios from "axios";

export const isAuthenticated = () => {
  const user = localStorage.getItem("user");
  return user ? JSON.parse(user) : null;
};

export const logout = () => {
  localStorage.removeItem("user");
};

export const login = async (email, password) => {
  try {
    const response = await axios.post(
      `${process.env.REACT_APP_API_URL}/api/login`, // ✅ lien dynamique
      {
        email,
        password,
      }
    );

    if (response.data.success) {
      localStorage.setItem("user", JSON.stringify(response.data.data));
    }

    return response.data;
  } catch (error) {
    console.error("Erreur de connexion", error);
    throw error;
  }
};
