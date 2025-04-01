import React, { createContext, useState, useEffect } from "react";
import jwt_decode from "jwt-decode";
import { useNavigate } from "react-router-dom";
import authService from "../services/authService";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    // Check if token exists and is valid
    const verifyToken = async () => {
      if (token) {
        try {
          // Check token expiration
          const decodedToken = jwt_decode(token);
          const currentTime = Date.now() / 1000;

          if (decodedToken.exp < currentTime) {
            // Token expired
            logout();
          } else {
            // Token valid, get user info
            const userResponse = await authService.getCurrentUser(token);
            setCurrentUser(userResponse.data);
          }
        } catch (err) {
          console.error("Token verification failed:", err);
          logout();
        }
      }
      setLoading(false);
    };

    verifyToken();
  }, [token]);

  const login = async (credentials) => {
    try {
      setLoading(true);
      setError(null);
      const response = await authService.login(credentials);
      const { token, user } = response.data;

      localStorage.setItem("token", token);
      setToken(token);
      setCurrentUser(user);
      navigate("/dashboard");
      return true;
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
      return false;
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData) => {
    try {
      setLoading(true);
      setError(null);
      const response = await authService.register(userData);
      console.log("Registration response:", response);

      // Check if the response indicates success even if status code is not 200
      const isSuccess =
        response.status === 200 ||
        response.status === 201 ||
        (response.data && response.data.success);

      if (isSuccess) {
        navigate("/login", {
          state: {
            message:
              "Registration successful! Please login with your credentials.",
          },
        });
        return true;
      } else {
        setError("Registration failed. Please try again.");
        return false;
      }
    } catch (err) {
      console.error("Registration error details:", err);
      setError(
        err.response?.data?.message || "Registration failed. Please try again.",
      );
      return false;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    setToken(null);
    setCurrentUser(null);
    navigate("/login");
  };

  const value = {
    currentUser,
    token,
    loading,
    error,
    login,
    register,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
