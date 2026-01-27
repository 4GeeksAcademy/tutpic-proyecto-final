import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import AuthForm from "./AuthForm";

const Signup = () => {
  useEffect(() => {
    document.title = "Registro | Let's Cook!";
  }, []);

  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleSignup = async ({ email, password }) => {
    setLoading(true);
    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/signup`,
        {
          method: "POST",
          body: JSON.stringify({ email, password }),
          headers: { "Content-Type": "application/json" },
        }
      );

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem("access_token", data.access_token);
        navigate("/dashboard", { state: { message: "Registro exitoso" } });
      } else {
        throw new Error(data.error || "Error al registrarse");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthForm
      title="Crear Cuenta"
      subtitle="Regístrate para comenzar tu aventura culinaria"
      submitLabel="Crear Cuenta"
      onSubmit={handleSignup}
      loading={loading}
      footerText="¿Ya tienes cuenta?"
      footerLink="/login"
      footerLinkText="Inicia sesión aquí"
    />
  );
};

export default Signup;