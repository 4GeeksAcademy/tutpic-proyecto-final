import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { BackendURL } from '../components/BackendURL.jsx';

export const BlogArticulo = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [articulo, setArticulo] = useState(null);
    const [comentarios, setComentarios] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [nuevoComentario, setNuevoComentario] = useState('');
    const [enviandoComentario, setEnviandoComentario] = useState(false);
    const [mensajeComentario, setMensajeComentario] = useState(null);

    useEffect(() => {
        cargarArticulo();
    }, [id]);

    const cargarArticulo = async () => {
        try {
            const response = await fetch(`${BackendURL()}/api/blog/articulos/${id}`);
            const data = await response.json();

            if (response.ok) {
                setArticulo(data.articulo);
                setComentarios(data.articulo.comentarios || []);
            } else {
                setError(data.error || 'Error al cargar el artículo');
            }
        } catch (err) {
            setError('Error de conexión');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmitComentario = async (e) => {
        e.preventDefault();

        if (!nuevoComentario.trim()) {
            setMensajeComentario({ tipo: 'error', texto: 'El comentario no puede estar vacío' });
            return;
        }

        const token = localStorage.getItem('token');
        if (!token) {
            setMensajeComentario({ tipo: 'error', texto: 'Debes iniciar sesión para comentar' });
            setTimeout(() => navigate('/login'), 2000);
            return;
        }

        setEnviandoComentario(true);
        setMensajeComentario(null);

        try {
            const response = await fetch(`${BackendURL()}/api/comentarios/crear`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    contenido: nuevoComentario,
                    articulo_id: parseInt(id)
                })
            });

            const data = await response.json();

            if (response.ok) {
                setMensajeComentario({ tipo: 'success', texto: 'Comentario agregado con éxito' });
                setNuevoComentario('');
                cargarArticulo();
            } else {
                setMensajeComentario({ tipo: 'error', texto: data.error || 'Error al agregar comentario' });
            }
        } catch (err) {
            setMensajeComentario({ tipo: 'error', texto: 'Error de conexión' });
        } finally {
            setEnviandoComentario(false);
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

    if (error) {
        return (
            <div className="container mt-5">
                <div className="alert alert-danger" role="alert">
                    {error}
                </div>
                <Link to="/blog" className="btn btn-primary">
                    Volver al blog
                </Link>
            </div>
        );
    }

    if (!articulo) {
        return null;
    }

    return (
        <div className="container mt-4 mb-5">
            <Link to="/blog/articulos" className="btn btn-outline-secondary mb-3">
                <i className="fas fa-arrow-left"></i> Volver a artículos
            </Link>

            <article className="bg-white shadow-sm rounded p-4 mb-4">
                {articulo.imagen_url && (
                    <img
                        src={articulo.imagen_url}
                        className="img-fluid rounded mb-4"
                        alt={articulo.titulo}
                        style={{ maxHeight: '400px', width: '100%', objectFit: 'cover' }}
                    />
                )}

                <h1 className="display-5 fw-bold mb-3">{articulo.titulo}</h1>

                <div className="d-flex align-items-center mb-4 text-muted">
                    <div className="me-4">
                        <i className="fas fa-user"></i> Por {articulo.autor?.username || 'Anónimo'}
                    </div>
                    <div className="me-4">
                        <i className="fas fa-calendar"></i> {new Date(articulo.fecha_creacion).toLocaleDateString('es-ES', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                        })}
                    </div>
                    <div>
                        <i className="fas fa-comments"></i> {comentarios.length} comentarios
                    </div>
                </div>

                <div className="article-content" style={{ fontSize: '1.1rem', lineHeight: '1.8' }}>
                    {articulo.contenido.split('\n').map((parrafo, index) => (
                        <p key={index}>{parrafo}</p>
                    ))}
                </div>
            </article>

            <div className="bg-white shadow-sm rounded p-4">
                <h3 className="h4 mb-4">Comentarios ({comentarios.length})</h3>

                <form onSubmit={handleSubmitComentario} className="mb-4">
                    <div className="mb-3">
                        <label htmlFor="comentario" className="form-label fw-bold">
                            Agregar un comentario
                        </label>
                        <textarea
                            id="comentario"
                            className="form-control"
                            rows="4"
                            placeholder="Escribe tu comentario aquí..."
                            value={nuevoComentario}
                            onChange={(e) => setNuevoComentario(e.target.value)}
                            disabled={enviandoComentario}
                        ></textarea>
                    </div>

                    {mensajeComentario && (
                        <div className={`alert alert-${mensajeComentario.tipo === 'error' ? 'danger' : 'success'}`} role="alert">
                            {mensajeComentario.texto}
                        </div>
                    )}

                    <button
                        type="submit"
                        className="btn btn-primary"
                        disabled={enviandoComentario}
                    >
                        {enviandoComentario ? (
                            <>
                                <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                                Enviando...
                            </>
                        ) : (
                            <>
                                <i className="fas fa-paper-plane me-2"></i>
                                Publicar Comentario
                            </>
                        )}
                    </button>
                </form>

                <hr className="my-4" />

                {comentarios.length === 0 ? (
                    <p className="text-muted text-center py-4">
                        Sé el primero en comentar este artículo
                    </p>
                ) : (
                    <div className="comentarios-lista">
                        {comentarios.map((comentario) => (
                            <div key={comentario.id} className="border-bottom pb-3 mb-3">
                                <div className="d-flex align-items-center mb-2">
                                    <strong className="me-2">
                                        {comentario.autor?.username || 'Anónimo'}
                                    </strong>
                                    <small className="text-muted">
                                        {new Date(comentario.fecha_creacion).toLocaleDateString('es-ES', {
                                            year: 'numeric',
                                            month: 'short',
                                            day: 'numeric',
                                            hour: '2-digit',
                                            minute: '2-digit'
                                        })}
                                    </small>
                                </div>
                                <p className="mb-0">{comentario.contenido}</p>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};
