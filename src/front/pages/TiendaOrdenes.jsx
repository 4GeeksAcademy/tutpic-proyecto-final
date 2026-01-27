import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { BackendURL } from "../components/BackendURL.jsx";

export const TiendaOrdenes = () => {
    const [ordenes, setOrdenes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [mensaje, setMensaje] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token) {
            navigate("/login");
            return;
        }
        cargarOrdenes();
    }, []);

    const cargarOrdenes = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem("token");
            const response = await fetch(`${BackendURL()}/api/ordenes/`, {
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            });

            const data = await response.json();

            if (response.ok) {
                setOrdenes(data);
            } else {
                setError(data.error || "Error al cargar órdenes");
            }
        } catch (err) {
            setError("Error al conectar con el servidor");
        } finally {
            setLoading(false);
        }
    };

    const cancelarOrden = async (ordenId) => {
        if (!confirm("¿Estás seguro de que quieres cancelar esta orden?")) return;

        try {
            const token = localStorage.getItem("token");
            const response = await fetch(`${BackendURL()}/api/ordenes/${ordenId}/cancelar`, {
                method: "PUT",
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            });

            const data = await response.json();

            if (response.ok) {
                setMensaje("Orden cancelada correctamente");
                cargarOrdenes();
                setTimeout(() => setMensaje(null), 3000);
            } else {
                setError(data.error || "Error al cancelar orden");
            }
        } catch (err) {
            setError("Error al conectar con el servidor");
        }
    };

    const getEstadoBadge = (estado) => {
        const badges = {
            pending: "warning",
            approved: "success",
            rejected: "danger",
            cancelled: "secondary"
        };

        const textos = {
            pending: "Pendiente",
            approved: "Aprobada",
            rejected: "Rechazada",
            cancelled: "Cancelada"
        };

        return (
            <span className={`badge bg-${badges[estado] || 'secondary'}`}>
                {textos[estado] || estado}
            </span>
        );
    };

    if (loading) {
        return (
            <div className="container mt-5 text-center">
                <div className="spinner-border" role="status">
                    <span className="visually-hidden">Cargando...</span>
                </div>
            </div>
        );
    }

    return (
        <div className="container mt-5">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h1>Mis Órdenes</h1>
                <Link to="/tienda" className="btn btn-primary">
                    Volver a la Tienda
                </Link>
            </div>

            {mensaje && (
                <div className="alert alert-success alert-dismissible fade show" role="alert">
                    {mensaje}
                    <button type="button" className="btn-close" onClick={() => setMensaje(null)}></button>
                </div>
            )}

            {error && (
                <div className="alert alert-danger alert-dismissible fade show" role="alert">
                    {error}
                    <button type="button" className="btn-close" onClick={() => setError(null)}></button>
                </div>
            )}

            {ordenes.length === 0 ? (
                <div className="alert alert-info">
                    No tienes órdenes aún. <Link to="/tienda">Comienza a comprar</Link>
                </div>
            ) : (
                <div className="row">
                    {ordenes.map(orden => (
                        <div key={orden.id} className="col-12 mb-4">
                            <div className="card">
                                <div className="card-header">
                                    <div className="d-flex justify-content-between align-items-center">
                                        <div>
                                            <strong>Orden #{orden.id}</strong>
                                            <span className="ms-3 text-muted">
                                                {new Date(orden.created_at).toLocaleDateString()}
                                            </span>
                                        </div>
                                        <div>
                                            {getEstadoBadge(orden.estado)}
                                        </div>
                                    </div>
                                </div>
                                <div className="card-body">
                                    <div className="row">
                                        <div className="col-md-8">
                                            <h6>Productos:</h6>
                                            {orden.items.map(item => (
                                                <div key={item.id} className="d-flex justify-content-between mb-2">
                                                    <span>
                                                        {item.producto.nombre} x {item.cantidad}
                                                    </span>
                                                    <span>${item.subtotal.toFixed(2)}</span>
                                                </div>
                                            ))}
                                        </div>
                                        <div className="col-md-4">
                                            <div className="text-end">
                                                <h5>Total: ${orden.total.toFixed(2)}</h5>
                                                {orden.estado === 'pending' && (
                                                    <div className="mt-3">
                                                        <Link
                                                            to={`/tienda/checkout/${orden.id}`}
                                                            className="btn btn-primary btn-sm me-2"
                                                        >
                                                            Pagar Ahora
                                                        </Link>
                                                        <button
                                                            className="btn btn-danger btn-sm"
                                                            onClick={() => cancelarOrden(orden.id)}
                                                        >
                                                            Cancelar
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};