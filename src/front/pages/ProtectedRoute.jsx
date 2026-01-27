import React, { useEffect, useState } from "react";
import { Navigate, Outlet } from "react-router-dom";

const ProtectedRoute = () => {
  const token = localStorage.getItem("access_token");

  // Si no hay token, redirigir al login
  if (!token) {
    return (
      <Navigate
        to="/login"
        replace
        state={{ message: "Por favor inicia sesión primero" }}
      />
    );
  }

  // De lo contrario, renderizar la ruta hija
  return <Outlet />;
};

export default ProtectedRoute;