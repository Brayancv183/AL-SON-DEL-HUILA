import { createContext, useContext, useState, useEffect } from "react";
import api from "../services/api";

const AuthContext = createContext(null);

// Hook personalizado para usar el contexto (exportamos 'useAuth' para consistencia)
// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Función para refrescar los datos del usuario desde el token actual
  const refreshUser = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      setUser(null);
      return null;
    }
    try {
      const response = await api.get("/perfil");
      // El backend devuelve { id, nombre, email, ... }
      setUser(response.data);
      // También guardamos en localStorage para rápido acceso (opcional)
      localStorage.setItem("user", JSON.stringify(response.data));
      return response.data;
    } catch (error) {
      console.error("Error al refrescar usuario:", error);
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      setUser(null);
      return null;
    }
  };

  // Al cargar la app, si hay token, pedir los datos del usuario
  useEffect(() => {
    let cancelled = false;
    const init = async () => {
      const token = localStorage.getItem("token");
      if (token) await refreshUser();
      if (!cancelled) setLoading(false);
    };
    init();
    return () => { cancelled = true; };
  }, []);

  // Registro normal (email + password)
  const register = async (nombre, email, password) => {
    try {
      const response = await api.post("/auth/register", {
        nombre,
        email,
        password,
      });
      const { user: userData, token } = response.data;
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(userData));
      setUser(userData);
      return userData;
    } catch (error) {
      console.error("Error en registro:", error);
      throw error;
    }
  };

  // Login normal (email + password)
  const login = async (email, password) => {
    try {
      const response = await api.post("/auth/login", {
        email,
        password,
      });
      const { user: userData, token } = response.data;
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(userData));
      setUser(userData);
      return userData;
    } catch (error) {
      console.error("Error en login:", error);
      throw error;
    }
  };

  // Cerrar sesión
  const logout = async () => {
    try {
      await api.post("/auth/logout");
    } catch (error) {
      console.error("Error en logout:", error);
    }
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    window.location.href = "/";
  };

  const value = {
    user,
    loading,
    register,
    login,
    logout,
    refreshUser,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};