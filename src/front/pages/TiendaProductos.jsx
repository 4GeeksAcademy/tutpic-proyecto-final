import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { BackendURL } from "../components/BackendURL.jsx";

export const TiendaProductos = () => {
    const [productos, setProductos] = useState([]);
    const [categorias, setCategorias] = useState([]);
    const [categoriaSeleccionada, setCategoriaSeleccionada] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [mensaje, setMensaje] = useState(null);

    useEffect(() => {
        cargarProductos();
        cargarCategorias();
    }, [categoriaSeleccionada]);

    const cargarProductos = async () => {
        try {
            setLoading(true);
            let url = `${BackendURL()}/api/productos/`;
            if (categoriaSeleccionada) {
                url += `?categoria_id=${categoriaSeleccionada}`;
            }

            const response = await fetch(url);
            const data = await response.json();

            if (response.ok) {
                setProductos(data);
            } else {
                setError(data.error || "Error al cargar productos");
            }
        } catch (err) {
            setError("Error al conectar con el servidor");
        } finally {
            setLoading(false);
        }
    };

    const cargarCategorias = async () => {
        try {
            const response = await fetch(`${BackendURL()}/api/productos/categorias`);
            const data = await response.json();

            if (response.ok) {
                setCategorias(data);
            }
        } catch (err) {
            console.error("Error al cargar categorías:", err);
        }
    };

    const agregarAlCarrito = async (productoId) => {
        const token = localStorage.getItem("token");

        if (!token) {
            setError("Debes iniciar sesión para agregar productos al carrito");
            return;
        }

        try {
            const response = await fetch(`${BackendURL()}/api/carrito/agregar`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({ producto_id: productoId, cantidad: 1 })
            });

            const data = await response.json();

            if (response.ok) {
                setMensaje("Producto agregado al carrito");
                setTimeout(() => setMensaje(null), 3000);
            } else {
                setError(data.error || "Error al agregar al carrito");
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
                <h1>Tienda</h1>
                <Link to="/tienda/carrito" className="btn btn-primary">
                    Ver Carrito
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

            <div className="mb-4">
                <button
                    className={`btn ${!categoriaSeleccionada ? 'btn-primary' : 'btn-outline-primary'} me-2`}
                    onClick={() => setCategoriaSeleccionada(null)}
                >
                    Todos
                </button>
                {categorias.map(categoria => (
                    <button
                        key={categoria.id}
                        className={`btn ${categoriaSeleccionada === categoria.id ? 'btn-primary' : 'btn-outline-primary'} me-2`}
                        onClick={() => setCategoriaSeleccionada(categoria.id)}
                    >
                        {categoria.nombre}
                    </button>
                ))}
            </div>

            {productos.length === 0 ? (
                <div className="alert alert-info">
                    No hay productos disponibles en esta categoría.
                </div>
            ) : (
                <div className="row">
                    {productos.map(producto => (
                        <div key={producto.id} className="col-md-4 mb-4">
                            <div className="card h-100">
                                {producto.imagen_url && (
                                    <img
                                        src={producto.imagen_url}
                                        className="card-img-top"
                                        alt={producto.nombre}
                                        style={{ height: "200px", objectFit: "cover" }}
                                    />
                                )}
                                <div className="card-body d-flex flex-column">
                                    <h5 className="card-title">{producto.nombre}</h5>
                                    {producto.categoria && (
                                        <span className="badge bg-secondary mb-2">
                                            {producto.categoria.nombre}
                                        </span>
                                    )}
                                    <p className="card-text">{producto.descripcion}</p>
                                    <div className="mt-auto">
                                        <div className="d-flex justify-content-between align-items-center mb-2">
                                            <h4 className="text-primary mb-0">
                                                ${producto.precio}
                                            </h4>
                                            <span className="text-muted">
                                                Stock: {producto.stock}
                                            </span>
                                        </div>
                                        <button
                                            className="btn btn-primary w-100"
                                            onClick={() => agregarAlCarrito(producto.id)}
                                            disabled={producto.stock === 0}
                                        >
                                            {producto.stock === 0 ? "Sin Stock" : "Agregar al Carrito"}
                                        </button>
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