import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const ResetPassword = () => {
  useEffect(() => {
    document.title = "Restablecer Contraseña | Let's Cook!";
  }, []);

  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleResetPassword = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError(null);
      setSuccess(false);

      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/reset-password`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        setSuccess(true);
        setEmail("");
      } else {
        setError(data.error || "Error al enviar el correo de restablecimiento");
      }
    } catch (err) {
      console.error("Error durante restablecimiento:", err);
      setError("Error de conexión con el servidor");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h1 className="auth-title">Restablecer Contraseña</h1>
        <p className="auth-subtitle">
          Ingresa tu correo electrónico y te enviaremos instrucciones para restablecer tu contraseña
        </p>

        {success ? (
          <div>
            <div className="alert-custom alert-success-custom">
              Se ha enviado un correo con instrucciones para restablecer tu contraseña.
              Por favor revisa tu bandeja de entrada.
            </div>
            <button
              className="btn-orange-primary"
              onClick={() => navigate("/login")}
              style={{ marginTop: '20px' }}
            >
              Volver al Login
            </button>
          </div>
        ) : (
          <form onSubmit={handleResetPassword}>
            <div className="form-group-custom">
              <label htmlFor="email" className="form-label-custom">
                Correo electrónico
              </label>
              <input
                type="email"
                id="email"
                className="form-input-custom"
                placeholder="tu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="username"
              />
            </div>

            <button type="submit" className="btn-orange-primary" disabled={loading}>
              {loading ? "Enviando..." : "Enviar Instrucciones"}
            </button>
          </form>
        )}

        {error && (
          <div className="alert-custom alert-error-custom">
            {error}
          </div>
        )}

        <div style={{ textAlign: 'center', marginTop: '24px', color: '#636e72', fontSize: '14px' }}>
          ¿Recordaste tu contraseña?{' '}
          <a href="#" onClick={(e) => {
            e.preventDefault();
            navigate("/login");
          }} className="link-orange">
            Volver al login
          </a>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
