"""
Blueprint para gestionar artículos del blog
"""
from flask import request, jsonify, Blueprint
from api.models import db, Articulo, User
from flask_jwt_extended import jwt_required, get_jwt_identity
import datetime

blog_bp = Blueprint('blog', __name__)


@blog_bp.route('/articulos', methods=['GET'])
def listar_articulos():
    """Obtener lista de artículos publicados con filtros"""
    try:
        search = request.args.get('search', '').strip()
        autor_id = request.args.get('autor_id', type=int)
        limit = request.args.get('limit', type=int, default=20)
        offset = request.args.get('offset', type=int, default=0)

        query = Articulo.query.filter(Articulo.publicado == True)

        if autor_id:
            query = query.filter(Articulo.autor_id == autor_id)

        if search:
            search_filter = f"%{search}%"
            query = query.filter(
                (Articulo.titulo.ilike(search_filter)) |
                (Articulo.contenido.ilike(search_filter)) |
                (Articulo.resumen.ilike(search_filter))
            )

        query = query.order_by(Articulo.fecha_creacion.desc())

        total = query.count()
        articulos = query.offset(offset).limit(limit).all()

        serialized = [articulo.serialize(include_autor=True, include_comentarios=False) for articulo in articulos]

        return jsonify({
            "message": "Artículos obtenidos con éxito",
            "articulos": serialized,
            "total": total,
            "limit": limit,
            "offset": offset
        }), 200

    except Exception as e:
        return jsonify({"error": "Error al obtener artículos", "details": str(e)}), 500


@blog_bp.route('/articulos/<int:articulo_id>', methods=['GET'])
def obtener_articulo(articulo_id):
    """Obtener un artículo por ID con sus comentarios"""
    try:
        articulo = Articulo.query.get(articulo_id)

        if not articulo:
            return jsonify({"error": "Artículo no encontrado"}), 404

        if not articulo.publicado:
            return jsonify({"error": "Artículo no disponible"}), 403

        return jsonify({
            "message": "Artículo obtenido con éxito",
            "articulo": articulo.serialize(include_autor=True, include_comentarios=True)
        }), 200

    except Exception as e:
        return jsonify({"error": "Error al obtener artículo"}), 500


@blog_bp.route('/articulos/crear', methods=['POST'])
@jwt_required()
def crear_articulo():
    """Crear un nuevo artículo (requiere autenticación)"""
    try:
        current_user_id = get_jwt_identity()
        data = request.get_json()

        if not data:
            return jsonify({"error": "No se recibieron datos"}), 400

        titulo = data.get("titulo")
        contenido = data.get("contenido")
        resumen = data.get("resumen")
        imagen_url = data.get("imagen_url")
        publicado = data.get("publicado", False)

        if not (titulo and contenido):
            return jsonify({"error": "Faltan datos obligatorios (titulo, contenido)"}), 400

        user = User.query.get(current_user_id)
        if not user:
            return jsonify({"error": "Usuario no encontrado"}), 404

        nuevo_articulo = Articulo(
            titulo=titulo,
            contenido=contenido,
            resumen=resumen,
            imagen_url=imagen_url,
            publicado=publicado,
            autor_id=current_user_id
        )

        db.session.add(nuevo_articulo)
        db.session.commit()

        return jsonify({
            "message": "Artículo creado con éxito",
            "articulo": nuevo_articulo.serialize()
        }), 201

    except Exception as e:
        db.session.rollback()
        return jsonify({"error": "Error al crear artículo", "details": str(e)}), 500


@blog_bp.route('/articulos/<int:articulo_id>', methods=['PUT'])
@jwt_required()
def modificar_articulo(articulo_id):
    """Modificar un artículo existente (solo el autor o admin)"""
    try:
        current_user_id = get_jwt_identity()
        data = request.get_json()

        if not data:
            return jsonify({"error": "No se recibieron datos"}), 400

        articulo = Articulo.query.get(articulo_id)

        if not articulo:
            return jsonify({"error": "Artículo no encontrado"}), 404

        user = User.query.get(current_user_id)

        if articulo.autor_id != int(current_user_id) and not user.is_admin:
            return jsonify({"error": "No tienes permiso para modificar este artículo"}), 403

        titulo = data.get("titulo")
        contenido = data.get("contenido")
        resumen = data.get("resumen")
        imagen_url = data.get("imagen_url")
        publicado = data.get("publicado")

        if titulo:
            articulo.titulo = titulo
        if contenido:
            articulo.contenido = contenido
        if resumen is not None:
            articulo.resumen = resumen
        if imagen_url is not None:
            articulo.imagen_url = imagen_url
        if publicado is not None:
            articulo.publicado = publicado

        articulo.fecha_actualizacion = datetime.datetime.now()
        db.session.commit()

        return jsonify({
            "message": "Artículo modificado con éxito",
            "articulo": articulo.serialize()
        }), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({"error": "Error al modificar artículo"}), 500


@blog_bp.route('/articulos/<int:articulo_id>', methods=['DELETE'])
@jwt_required()
def eliminar_articulo(articulo_id):
    """Eliminar un artículo (solo el autor o admin)"""
    try:
        current_user_id = get_jwt_identity()
        articulo = Articulo.query.get(articulo_id)

        if not articulo:
            return jsonify({"error": "Artículo no encontrado"}), 404

        user = User.query.get(current_user_id)

        if articulo.autor_id != int(current_user_id) and not user.is_admin:
            return jsonify({"error": "No tienes permiso para eliminar este artículo"}), 403

        db.session.delete(articulo)
        db.session.commit()

        return jsonify({"message": "Artículo eliminado con éxito"}), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({"error": "Error al eliminar artículo"}), 500


@blog_bp.route('/mis-articulos', methods=['GET'])
@jwt_required()
def obtener_mis_articulos():
    """Obtener todos los artículos del usuario autenticado"""
    try:
        current_user_id = get_jwt_identity()
        user = User.query.get(current_user_id)

        if not user:
            return jsonify({"error": "Usuario no encontrado"}), 404

        articulos = [articulo.serialize(include_autor=False, include_comentarios=False) for articulo in user.articulos]

        return jsonify({
            "message": "Artículos obtenidos con éxito",
            "articulos": articulos,
            "total": len(articulos)
        }), 200

    except Exception as e:
        return jsonify({"error": "Error al obtener artículos"}), 500
