import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import LogoutButton from "../components/LogoutButton.jsx";

const Dashboard = () => {
  useEffect(() => {
      document.title = "Dashboard | Let's Cook!";
    }, []);
  const [user, setUser] = useState({});

  useEffect(() => {

    const getRestricted = async () => {
      try {
        const response = await fetch(
          "https://turbo-space-trout-5gpx5v4q5qqv2p4gv-3001.app.github.dev/api/restringido",
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("access_token")}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error("Error al obtener datos restringidos");
        }

        const data = await response.json();
        console.log("Datos restringidos obtenidos:", data.user);
        setUser(data.user);
      } catch (error) {
        console.error("Error al obtener datos restringidos:", error);
      }
    };

    getRestricted();
  }, []);

  return (
    <div className="container mt-5">
      <div className="text-center mb-5">
        <h1 className="display-4">Dashboard</h1>
        <h2>{user?.username}</h2>
        <p className="lead">Bienvenido al área privada.</p>
        <LogoutButton />
      </div>

      <div className="row g-4">
        <div className="col-md-6 col-lg-4">
          <div className="card h-100 shadow-sm">
            <div className="card-body text-center">
              <div className="mb-3">
                <i className="bi bi-newspaper" style={{ fontSize: "3rem", color: "#0d6efd" }}></i>
              </div>
              <h5 className="card-title">Blog Principal</h5>
              <p className="card-text">Explora todos los artículos del blog</p>
              <Link to="/blog" className="btn btn-primary">
                Ir al Blog
              </Link>
            </div>
          </div>
        </div>

        <div className="col-md-6 col-lg-4">
          <div className="card h-100 shadow-sm">
            <div className="card-body text-center">
              <div className="mb-3">
                <i className="bi bi-card-list" style={{ fontSize: "3rem", color: "#198754" }}></i>
              </div>
              <h5 className="card-title">Todos los Artículos</h5>
              <p className="card-text">Lista completa de artículos</p>
              <Link to="/blog/articulos" className="btn btn-success">
                Ver Artículos
              </Link>
            </div>
          </div>
        </div>

        <div className="col-md-6 col-lg-4">
          <div className="card h-100 shadow-sm">
            <div className="card-body text-center">
              <div className="mb-3">
                <i className="bi bi-file-earmark-text" style={{ fontSize: "3rem", color: "#ffc107" }}></i>
              </div>
              <h5 className="card-title">Mis Artículos</h5>
              <p className="card-text">Gestiona tus artículos del blog</p>
              <Link to="/blog/mis-articulos" className="btn btn-warning">
                Mis Artículos
              </Link>
            </div>
          </div>
        </div>

        <div className="col-md-6 col-lg-4">
          <div className="card h-100 shadow-sm">
            <div className="card-body text-center">
              <div className="mb-3">
                <i className="bi bi-plus-circle" style={{ fontSize: "3rem", color: "#0dcaf0" }}></i>
              </div>
              <h5 className="card-title">Crear Artículo</h5>
              <p className="card-text">Escribe un nuevo artículo</p>
              <Link to="/blog/crear" className="btn btn-info">
                Crear Artículo
              </Link>
            </div>
          </div>
        </div>

        <div className="col-md-6 col-lg-4">
          <div className="card h-100 shadow-sm">
            <div className="card-body text-center">
              <div className="mb-3">
                <i className="bi bi-chat-dots" style={{ fontSize: "3rem", color: "#6f42c1" }}></i>
              </div>
              <h5 className="card-title">Mis Comentarios</h5>
              <p className="card-text">Gestiona tus comentarios</p>
              <Link to="/blog/mis-comentarios" className="btn btn-purple" style={{ backgroundColor: "#6f42c1", borderColor: "#6f42c1", color: "white" }}>
                Ver Comentarios
              </Link>
            </div>
          </div>
        </div>

        <div className="col-md-6 col-lg-4">
          <div className="card h-100 shadow-sm">
            <div className="card-body text-center">
              <div className="mb-3">
                <i className="bi bi-search" style={{ fontSize: "3rem", color: "#6c757d" }}></i>
              </div>
              <h5 className="card-title">Buscar en el Blog</h5>
              <p className="card-text">Encuentra artículos específicos</p>
              <Link to="/blog" className="btn btn-secondary">
                Buscar
              </Link>
            </div>
          </div>
        </div>

        <div className="col-md-6 col-lg-4">
          <div className="card h-100 shadow-sm border-success">
            <div className="card-body text-center">
              <div className="mb-3">
                <i className="bi bi-shop" style={{ fontSize: "3rem", color: "#20c997" }}></i>
              </div>
              <h5 className="card-title">Tienda</h5>
              <p className="card-text">Explora nuestros productos</p>
              <Link to="/tienda" className="btn btn-outline-success">
                Ver Productos
              </Link>
            </div>
          </div>
        </div>

        <div className="col-md-6 col-lg-4">
          <div className="card h-100 shadow-sm border-primary">
            <div className="card-body text-center">
              <div className="mb-3">
                <i className="bi bi-cart3" style={{ fontSize: "3rem", color: "#0d6efd" }}></i>
              </div>
              <h5 className="card-title">Mi Carrito</h5>
              <p className="card-text">Ver carrito de compras</p>
              <Link to="/tienda/carrito" className="btn btn-outline-primary">
                Ver Carrito
              </Link>
            </div>
          </div>
        </div>

        <div className="col-md-6 col-lg-4">
          <div className="card h-100 shadow-sm border-warning">
            <div className="card-body text-center">
              <div className="mb-3">
                <i className="bi bi-receipt" style={{ fontSize: "3rem", color: "#ffc107" }}></i>
              </div>
              <h5 className="card-title">Mis Órdenes</h5>
              <p className="card-text">Historial de compras</p>
              <Link to="/tienda/ordenes" className="btn btn-outline-warning">
                Ver Órdenes
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
