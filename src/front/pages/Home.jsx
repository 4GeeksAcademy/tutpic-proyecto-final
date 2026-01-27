import React, { useEffect, useState } from "react";
import logoImageUrl from "../assets/img/11.png";
import useGlobalReducer from "../hooks/useGlobalReducer.jsx";
import { useNavigate, useLocation } from "react-router-dom";

export const Home = () => {
  useEffect(() => {
    document.title = "Home | Let's Cook!";
  }, []);
  const { store, dispatch } = useGlobalReducer();
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadMessage = async () => {
    try {
      const backendUrl = import.meta.env.VITE_BACKEND_URL;
      if (!backendUrl) throw new Error("VITE_BACKEND_URL is not defined in .env file");

      const response = await fetch(`${backendUrl}/api/hello`);
      const data = await response.json();

      if (response.ok) {
        dispatch({ type: "set_hello", payload: data.message });
      } else {
        setError("Failed to load message from backend.");
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMessage();
  }, []);

  const token = localStorage.getItem("access_token");

  return (
    <div className="home-container">
      <div className="home-card">
        <h1 className="home-title">Bienvenido a Let's Cook</h1>

        <img src={logoImageUrl} className="home-logo" alt="Let's Cook Logo" />

        {location.state?.message && (
          <div className="alert-custom alert-success-custom">
            {location.state.message}
          </div>
        )}

        {error && (
          <div className="alert-custom alert-error-custom">
            {error}
          </div>
        )}

        {!loading && store?.message && (
          <p style={{ color: '#636e72', fontSize: '15px', marginTop: '16px' }}>
            {store.message}
          </p>
        )}

        <div className="home-buttons">
          {!token ? (
            <>
              <button
                className="btn-orange-primary"
                onClick={() => navigate("/register")}
              >
                Crear Cuenta
              </button>
              <button
                className="btn-orange-secondary"
                onClick={() => navigate("/login")}
              >
                Iniciar Sesión
              </button>
            </>
          ) : (
            <button
              className="btn-orange-primary"
              onClick={() => navigate("/dashboard")}
            >
              Ir al Dashboard
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Home;