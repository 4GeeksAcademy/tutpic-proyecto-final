import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const Register = () => {
  useEffect(() => {
    document.title = "Registro | Let's Cook!";
  }, []);

  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handlerRegister = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/create_user`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username, email, password }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        navigate("/login", { state: { message: "Usuario creado exitosamente. Por favor inicia sesión." } });
      } else {
        setError(data.error || "Error al crear usuario");
      }
    } catch (err) {
      console.error("Error durante registro:", err);
      setError("Error de conexión con el servidor");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h1 className="auth-title">Crear Cuenta</h1>
        <p className="auth-subtitle">Regístrate para comenzar tu aventura culinaria</p>

        <form onSubmit={handlerRegister}>
          <div className="form-group-custom">
            <label htmlFor="username" className="form-label-custom">
              Nombre de usuario
            </label>
            <input
              type="text"
              id="username"
              className="form-input-custom"
              placeholder="Tu nombre de usuario"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>

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
              autoComplete="new-password"
            />
          </div>

          <button type="submit" className="btn-orange-primary" disabled={loading}>
            {loading ? "Creando cuenta..." : "Crear Cuenta"}
          </button>
        </form>

        {error && (
          <div className="alert-custom alert-error-custom">
            {error}
          </div>
        )}

        <div style={{ textAlign: 'center', marginTop: '24px', color: '#636e72', fontSize: '14px' }}>
          ¿Ya tienes cuenta?{' '}
          <a href="#" onClick={(e) => {
            e.preventDefault();
            navigate("/login");
          }} className="link-orange">
            Inicia sesión aquí
          </a>
        </div>
      </div>
    </div>
  );
};

export default Register;