import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { BackendURL } from "../components/BackendURL.jsx";

export const TiendaCheckout = () => {
    const { ordenId } = useParams();
    const [orden, setOrden] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [procesandoPago, setProcesandoPago] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token) {
            navigate("/login");
            return;
        }
        cargarOrden();
    }, [ordenId]);

    const cargarOrden = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem("token");
            const response = await fetch(`${BackendURL()}/api/ordenes/${ordenId}`, {
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            });

            const data = await response.json();

            if (response.ok) {
                setOrden(data);
            } else {
                setError(data.error || "Error al cargar la orden");
            }
        } catch (err) {
            setError("Error al conectar con el servidor");
        } finally {
            setLoading(false);
        }
    };

    const procesarPagoMercadoPago = async () => {
        try {
            setProcesandoPago(true);
            const token = localStorage.getItem("token");
            const response = await fetch(`${BackendURL()}/api/ordenes/mercadopago/preference`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({ orden_id: ordenId })
            });

            const data = await response.json();

            if (response.ok) {
                window.location.href = data.init_point;
            } else {
                setError(data.error || "Error al procesar el pago");
            }
        } catch (err) {
            setError("Error al conectar con el servidor");
        } finally {
            setProcesandoPago(false);
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

    if (!orden) {
        return (
            <div className="container mt-5">
                <div className="alert alert-danger">Orden no encontrada</div>
            </div>
        );
    }

    return (
        <div className="container mt-5">
            <div className="row justify-content-center">
                <div className="col-md-8">
                    <h1 className="mb-4">Checkout</h1>

                    {error && (
                        <div className="alert alert-danger alert-dismissible fade show" role="alert">
                            {error}
                            <button type="button" className="btn-close" onClick={() => setError(null)}></button>
                        </div>
                    )}

                    <div className="card mb-4">
                        <div className="card-header">
                            <h5>Resumen de la Orden #{orden.id}</h5>
                        </div>
                        <div className="card-body">
                            {orden.items.map(item => (
                                <div key={item.id} className="d-flex justify-content-between mb-2">
                                    <span>{item.producto.nombre} x {item.cantidad}</span>
                                    <span>${item.subtotal.toFixed(2)}</span>
                                </div>
                            ))}
                            <hr />
                            <div className="d-flex justify-content-between">
                                <strong>Total:</strong>
                                <strong>${orden.total.toFixed(2)}</strong>
                            </div>
                        </div>
                    </div>

                    <div className="card">
                        <div className="card-header">
                            <h5>Método de Pago</h5>
                        </div>
                        <div className="card-body">
                            <p>Selecciona tu método de pago preferido:</p>
                            <button
                                className="btn btn-primary w-100 mb-3"
                                onClick={procesarPagoMercadoPago}
                                disabled={procesandoPago || orden.estado !== 'pending'}
                            >
                                {procesandoPago ? (
                                    <>
                                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                        Procesando...
                                    </>
                                ) : (
                                    'Pagar con Mercado Pago'
                                )}
                            </button>

                            {orden.estado !== 'pending' && (
                                <div className="alert alert-info">
                                    Estado de la orden: {orden.estado}
                                </div>
                            )}

                            <button
                                className="btn btn-outline-secondary w-100"
                                onClick={() => navigate("/tienda/ordenes")}
                            >
                                Ver Mis Órdenes
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};