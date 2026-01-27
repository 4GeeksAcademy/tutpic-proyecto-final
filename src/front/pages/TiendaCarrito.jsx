import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { BackendURL } from "../components/BackendURL.jsx";

export const TiendaCarrito = () => {
    const [carrito, setCarrito] = useState(null);
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
        cargarCarrito();
    }, []);

    const cargarCarrito = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem("token");
            const response = await fetch(`${BackendURL()}/api/carrito/`, {
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            });

            const data = await response.json();

            if (response.ok) {
                setCarrito(data);
            } else {
                setError(data.error || "Error al cargar el carrito");
            }
        } catch (err) {
            setError("Error al conectar con el servidor");
        } finally {
            setLoading(false);
        }
    };

    const actualizarCantidad = async (itemId, nuevaCantidad) => {
        if (nuevaCantidad < 1) return;

        try {
            const token = localStorage.getItem("token");
            const response = await fetch(`${BackendURL()}/api/carrito/actualizar/${itemId}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({ cantidad: nuevaCantidad })
            });

            const data = await response.json();

            if (response.ok) {
                cargarCarrito();
            } else {
                setError(data.error || "Error al actualizar cantidad");
            }
        } catch (err) {
            setError("Error al conectar con el servidor");
        }
    };

    const eliminarItem = async (itemId) => {
        try {
            const token = localStorage.getItem("token");
            const response = await fetch(`${BackendURL()}/api/carrito/eliminar/${itemId}`, {
                method: "DELETE",
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            });

            const data = await response.json();

            if (response.ok) {
                setMensaje("Producto eliminado del carrito");
                cargarCarrito();
                setTimeout(() => setMensaje(null), 3000);
            } else {
                setError(data.error || "Error al eliminar producto");
            }
        } catch (err) {
            setError("Error al conectar con el servidor");
        }
    };

    const vaciarCarrito = async () => {
        if (!confirm("¿Estás seguro de que quieres vaciar el carrito?")) return;

        try {
            const token = localStorage.getItem("token");
            const response = await fetch(`${BackendURL()}/api/carrito/vaciar`, {
                method: "DELETE",
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            });

            const data = await response.json();

            if (response.ok) {
                setMensaje("Carrito vaciado correctamente");
                cargarCarrito();
                setTimeout(() => setMensaje(null), 3000);
            } else {
                setError(data.error || "Error al vaciar carrito");
            }
        } catch (err) {
            setError("Error al conectar con el servidor");
        }
    };

    const crearOrden = async () => {
        try {
            const token = localStorage.getItem("token");
            const response = await fetch(`${BackendURL()}/api/ordenes/crear`, {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            });

            const data = await response.json();

            if (response.ok) {
                navigate(`/tienda/checkout/${data.id}`);
            } else {
                setError(data.error || "Error al crear la orden");
            }
        } catch (err) {
            setError("Error al conectar con el servidor");
        }
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
                <h1>Mi Carrito</h1>
                <Link to="/tienda" className="btn btn-outline-primary">
                    Seguir Comprando
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

            {!carrito || carrito.items.length === 0 ? (
                <div className="alert alert-info">
                    Tu carrito está vacío.
                </div>
            ) : (
                <div className="row">
                    <div className="col-md-8">
                        {carrito.items.map(item => (
                            <div key={item.id} className="card mb-3">
                                <div className="card-body">
                                    <div className="row align-items-center">
                                        <div className="col-md-2">
                                            {item.producto.imagen_url && (
                                                <img
                                                    src={item.producto.imagen_url}
                                                    className="img-fluid"
                                                    alt={item.producto.nombre}
                                                />
                                            )}
                                        </div>
                                        <div className="col-md-4">
                                            <h5>{item.producto.nombre}</h5>
                                            <p className="text-muted">${item.producto.precio}</p>
                                        </div>
                                        <div className="col-md-3">
                                            <div className="input-group">
                                                <button
                                                    className="btn btn-outline-secondary"
                                                    onClick={() => actualizarCantidad(item.id, item.cantidad - 1)}
                                                    disabled={item.cantidad <= 1}
                                                >
                                                    -
                                                </button>
                                                <input
                                                    type="number"
                                                    className="form-control text-center"
                                                    value={item.cantidad}
                                                    readOnly
                                                />
                                                <button
                                                    className="btn btn-outline-secondary"
                                                    onClick={() => actualizarCantidad(item.id, item.cantidad + 1)}
                                                    disabled={item.cantidad >= item.producto.stock}
                                                >
                                                    +
                                                </button>
                                            </div>
                                        </div>
                                        <div className="col-md-2">
                                            <h5>${item.subtotal.toFixed(2)}</h5>
                                        </div>
                                        <div className="col-md-1">
                                            <button
                                                className="btn btn-danger"
                                                onClick={() => eliminarItem(item.id)}
                                            >
                                                ×
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}

                        <button
                            className="btn btn-outline-danger"
                            onClick={vaciarCarrito}
                        >
                            Vaciar Carrito
                        </button>
                    </div>

                    <div className="col-md-4">
                        <div className="card">
                            <div className="card-body">
                                <h5 className="card-title">Resumen de Compra</h5>
                                <hr />
                                <div className="d-flex justify-content-between mb-2">
                                    <span>Productos ({carrito.cantidad_items}):</span>
                                    <span>${carrito.total.toFixed(2)}</span>
                                </div>
                                <hr />
                                <div className="d-flex justify-content-between mb-3">
                                    <strong>Total:</strong>
                                    <strong>${carrito.total.toFixed(2)}</strong>
                                </div>
                                <button
                                    className="btn btn-primary w-100"
                                    onClick={crearOrden}
                                >
                                    Proceder al Pago
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};