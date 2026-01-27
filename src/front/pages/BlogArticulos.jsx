import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { BackendURL } from '../components/BackendURL.jsx';

export const BlogArticulos = () => {
    const [articulos, setArticulos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [total, setTotal] = useState(0);
    const [limit] = useState(12);
    const [offset, setOffset] = useState(0);

    useEffect(() => {
        cargarArticulos();
    }, [offset, searchTerm]);

    const cargarArticulos = async () => {
        setLoading(true);
        try {
            const url = `${BackendURL()}/api/blog/articulos?limit=${limit}&offset=${offset}${searchTerm ? `&search=${searchTerm}` : ''}`;
            const response = await fetch(url);
            const data = await response.json();

            if (response.ok) {
                setArticulos(data.articulos || []);
                setTotal(data.total || 0);
            } else {
                setError(data.error || 'Error al cargar artículos');
            }
        } catch (err) {
            setError('Error de conexión');
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (e) => {
        e.preventDefault();
        setOffset(0);
        cargarArticulos();
    };

    const handlePreviousPage = () => {
        if (offset > 0) {
            setOffset(offset - limit);
        }
    };

    const handleNextPage = () => {
        if (offset + limit < total) {
            setOffset(offset + limit);
        }
    };

    const currentPage = Math.floor(offset / limit) + 1;
    const totalPages = Math.ceil(total / limit);

    return (
        <div className="container mt-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h1 className="h2 mb-0">Todos los Artículos</h1>
                <Link to="/blog" className="btn btn-outline-secondary">
                    Volver al inicio
                </Link>
            </div>

            <form onSubmit={handleSearch} className="mb-4">
                <div className="input-group">
                    <input
                        type="text"
                        className="form-control"
                        placeholder="Buscar artículos..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <button className="btn btn-primary" type="submit">
                        <i className="fas fa-search"></i> Buscar
                    </button>
                </div>
            </form>

            {error && (
                <div className="alert alert-danger" role="alert">
                    {error}
                </div>
            )}

            {loading ? (
                <div className="text-center my-5">
                    <div className="spinner-border" role="status">
                        <span className="visually-hidden">Cargando...</span>
                    </div>
                </div>
            ) : articulos.length === 0 ? (
                <div className="text-center py-5">
                    <p className="text-muted">No se encontraron artículos</p>
                </div>
            ) : (
                <>
                    <p className="text-muted mb-3">
                        Mostrando {offset + 1} - {Math.min(offset + limit, total)} de {total} artículos
                    </p>

                    <div className="row g-4">
                        {articulos.map((articulo) => (
                            <div key={articulo.id} className="col-md-6 col-lg-4">
                                <div className="card h-100 shadow-sm">
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
                                                {articulo.resumen.substring(0, 120)}
                                                {articulo.resumen.length > 120 ? '...' : ''}
                                            </p>
                                        )}
                                        <div className="mt-auto d-flex justify-content-between align-items-center">
                                            <Link
                                                to={`/blog/articulo/${articulo.id}`}
                                                className="btn btn-sm btn-primary"
                                            >
                                                Leer artículo
                                            </Link>
                                            <span className="text-muted small">
                                                <i className="fas fa-comments"></i> {articulo.total_comentarios}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {totalPages > 1 && (
                        <nav className="mt-5">
                            <ul className="pagination justify-content-center">
                                <li className={`page-item ${offset === 0 ? 'disabled' : ''}`}>
                                    <button
                                        className="page-link"
                                        onClick={handlePreviousPage}
                                        disabled={offset === 0}
                                    >
                                        Anterior
                                    </button>
                                </li>
                                <li className="page-item disabled">
                                    <span className="page-link">
                                        Página {currentPage} de {totalPages}
                                    </span>
                                </li>
                                <li className={`page-item ${offset + limit >= total ? 'disabled' : ''}`}>
                                    <button
                                        className="page-link"
                                        onClick={handleNextPage}
                                        disabled={offset + limit >= total}
                                    >
                                        Siguiente
                                    </button>
                                </li>
                            </ul>
                        </nav>
                    )}
                </>
            )}
        </div>
    );
};
