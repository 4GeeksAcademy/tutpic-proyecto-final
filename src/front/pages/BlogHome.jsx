import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { BackendURL } from '../components/BackendURL.jsx';

export const BlogHome = () => {
    const [articulos, setArticulos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        cargarArticulosDestacados();
    }, []);

    const cargarArticulosDestacados = async () => {
        try {
            const response = await fetch(`${BackendURL()}/api/blog/articulos?limit=6`);
            const data = await response.json();

            if (response.ok) {
                setArticulos(data.articulos || []);
            } else {
                setError(data.error || 'Error al cargar artículos');
            }
        } catch (err) {
            setError('Error de conexión');
        } finally {
            setLoading(false);
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
        <div className="container mt-4">
            <div className="text-center mb-5">
                <h1 className="display-4 fw-bold mb-3">Bienvenido al Blog</h1>
                <p className="lead text-muted">
                    Descubre artículos sobre cocina, recetas y mucho más
                </p>
            </div>

            {error && (
                <div className="alert alert-danger" role="alert">
                    {error}
                </div>
            )}

            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2 className="h4 mb-0">Artículos Recientes</h2>
                <Link to="/blog/articulos" className="btn btn-primary">
                    Ver Todos
                </Link>
            </div>

            {articulos.length === 0 ? (
                <div className="text-center py-5">
                    <p className="text-muted">No hay artículos publicados aún</p>
                </div>
            ) : (
                <div className="row g-4">
                    {articulos.map((articulo) => (
                        <div key={articulo.id} className="col-md-6 col-lg-4">
                            <div className="card h-100 shadow-sm hover-shadow transition">
                                {articulo.imagen_url && (
                                    <img
                                        src={articulo.imagen_url}
                                        className="card-img-top"
                                        alt={articulo.titulo}
                                        style={{ height: '200px', objectFit: 'cover' }}
                                    />
                                )}
                                <div className="card-body d-flex flex-column">
                                    <h5 className="card-title">{articulo.titulo}</h5>
                                    <p className="card-text text-muted small mb-2">
                                        Por {articulo.autor?.username || 'Anónimo'} • {new Date(articulo.fecha_creacion).toLocaleDateString()}
                                    </p>
                                    {articulo.resumen && (
                                        <p className="card-text">
                                            {articulo.resumen.substring(0, 100)}
                                            {articulo.resumen.length > 100 ? '...' : ''}
                                        </p>
                                    )}
                                    <div className="mt-auto">
                                        <Link
                                            to={`/blog/articulo/${articulo.id}`}
                                            className="btn btn-sm btn-outline-primary"
                                        >
                                            Leer más
                                        </Link>
                                        <span className="text-muted small ms-3">
                                            {articulo.total_comentarios} comentarios
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <div className="text-center mt-5 mb-4">
                <Link to="/blog/articulos" className="btn btn-lg btn-primary">
                    Explorar Todos los Artículos
                </Link>
            </div>

            <style>{`
                .hover-shadow {
                    transition: box-shadow 0.3s ease;
                }
                .hover-shadow:hover {
                    box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.15) !important;
                }
                .transition {
                    transition: transform 0.3s ease;
                }
                .transition:hover {
                    transform: translateY(-5px);
                }
            `}</style>
        </div>
    );
};
