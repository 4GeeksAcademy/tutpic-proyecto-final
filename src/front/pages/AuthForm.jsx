import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const AuthForm = ({
  title,
  subtitle,
  onSubmit,
  submitLabel = "Enviar",
  loading = false,
  initialValues = { email: "", password: "" },
  showForgotPassword = false,
  footerText,
  footerLink,
  footerLinkText
}) => {
  const [email, setEmail] = useState(initialValues.email);
  const [password, setPassword] = useState(initialValues.password);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      await onSubmit({ email, password });
    } catch (err) {
      setError(err.message || "Error inesperado");
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h1 className="auth-title">{title}</h1>
        {subtitle && <p className="auth-subtitle">{subtitle}</p>}

        <form onSubmit={handleSubmit}>
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

          <div className="form-group-custom">
            <label htmlFor="password" className="form-label-custom">
              Contraseña
            </label>
            <input
              type="password"
              id="password"
              className="form-input-custom"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
            />
          </div>

          {showForgotPassword && (
            <div className="forgot-password-link">
              <a href="#" onClick={(e) => {
                e.preventDefault();
                navigate("/reset-password");
              }} className="link-orange">
                ¿Olvidaste tu contraseña?
              </a>
            </div>
          )}

          <button type="submit" className="btn-orange-primary" disabled={loading}>
            {loading ? "Procesando..." : submitLabel}
          </button>
        </form>

        {error && (
          <div className="alert-custom alert-error-custom">
            {error}
          </div>
        )}

        {footerText && footerLink && (
          <div style={{ textAlign: 'center', marginTop: '24px', color: '#636e72', fontSize: '14px' }}>
            {footerText}{' '}
            <a href="#" onClick={(e) => {
              e.preventDefault();
              navigate(footerLink);
            }} className="link-orange">
              {footerLinkText}
            </a>
          </div>
        )}
      </div>
    </div>
  );
};

export default AuthForm;