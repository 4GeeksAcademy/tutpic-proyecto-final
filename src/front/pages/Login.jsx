import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import AuthForm from "./AuthForm";

const Login = () => {
  useEffect(() => {
    document.title = "Iniciar Sesión | Let's Cook!";
  }, []);

  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (token) {
      navigate("/dashboard", { replace: true });
    }
  }, [navigate]);

  const handleLogin = async ({ email, password }) => {
    setLoading(true);
    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/login`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem("access_token", data.access_token);
        navigate("/dashboard", { state: { message: "Sesión iniciada exitosamente" } });
      } else {
        throw new Error(data.error || "Error al iniciar sesión");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {location.state?.message && (
        <div style={{
          position: 'fixed',
          top: '20px',
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 1000,
          maxWidth: '400px',
          width: '90%'
        }}>
          <div className="alert-custom alert-success-custom">
            {location.state.message}
          </div>
        </div>
      )}
      <AuthForm
        title="Iniciar Sesión"
        subtitle="Ingresa a tu cuenta para continuar"
        submitLabel="Iniciar Sesión"
        onSubmit={handleLogin}
        loading={loading}
        showForgotPassword={true}
        footerText="¿No tienes cuenta?"
        footerLink="/register"
        footerLinkText="Regístrate aquí"
      />
    </>
  );
};

export default Login;