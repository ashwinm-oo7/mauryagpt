import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

const AuthRoute = () => {
  const { user, loading } = useAuth();

  if (loading) return null;

  return !user ? <Outlet /> : <Navigate to="/" />;
};

export default AuthRoute;
