"""
Blueprint para gestionar comentarios de artículos
"""
from flask import request, jsonify, Blueprint
from api.models import db, Comentario, Articulo, User
from flask_jwt_extended import jwt_required, get_jwt_identity

comentarios_bp = Blueprint('comentarios', __name__)


@comentarios_bp.route('/articulo/<int:articulo_id>', methods=['GET'])
def obtener_comentarios(articulo_id):
    """Obtener todos los comentarios de un artículo"""
    try:
        articulo = Articulo.query.get(articulo_id)

        if not articulo:
            return jsonify({"error": "Artículo no encontrado"}), 404

        comentarios = [comentario.serialize(include_autor=True) for comentario in articulo.comentarios]

        return jsonify({
            "message": "Comentarios obtenidos con éxito",
            "comentarios": comentarios,
            "total": len(comentarios)
        }), 200

    except Exception as e:
        return jsonify({"error": "Error al obtener comentarios"}), 500


@comentarios_bp.route('/crear', methods=['POST'])
@jwt_required()
def crear_comentario():
    """Crear un nuevo comentario (requiere autenticación)"""
    try:
        current_user_id = get_jwt_identity()
        data = request.get_json()

        if not data:
            return jsonify({"error": "No se recibieron datos"}), 400

        contenido = data.get("contenido")
        articulo_id = data.get("articulo_id")

        if not (contenido and articulo_id):
            return jsonify({"error": "Faltan datos obligatorios (contenido, articulo_id)"}), 400

        articulo = Articulo.query.get(articulo_id)
        if not articulo:
            return jsonify({"error": "Artículo no encontrado"}), 404

        if not articulo.publicado:
            return jsonify({"error": "No se pueden agregar comentarios a artículos no publicados"}), 403

        user = User.query.get(current_user_id)
        if not user:
            return jsonify({"error": "Usuario no encontrado"}), 404

        nuevo_comentario = Comentario(
            contenido=contenido,
            autor_id=current_user_id,
            articulo_id=articulo_id
        )

        db.session.add(nuevo_comentario)
        db.session.commit()

        return jsonify({
            "message": "Comentario creado con éxito",
            "comentario": nuevo_comentario.serialize()
        }), 201

    except Exception as e:
        db.session.rollback()
        return jsonify({"error": "Error al crear comentario", "details": str(e)}), 500


@comentarios_bp.route('/<int:comentario_id>', methods=['PUT'])
@jwt_required()
def modificar_comentario(comentario_id):
    """Modificar un comentario existente (solo el autor)"""
    try:
        current_user_id = get_jwt_identity()
        data = request.get_json()

        if not data:
            return jsonify({"error": "No se recibieron datos"}), 400

        comentario = Comentario.query.get(comentario_id)

        if not comentario:
            return jsonify({"error": "Comentario no encontrado"}), 404

        if comentario.autor_id != int(current_user_id):
            return jsonify({"error": "No tienes permiso para modificar este comentario"}), 403

        contenido = data.get("contenido")

        if not contenido:
            return jsonify({"error": "Debe proporcionar el contenido del comentario"}), 400

        comentario.contenido = contenido
        db.session.commit()

        return jsonify({
            "message": "Comentario modificado con éxito",
            "comentario": comentario.serialize()
        }), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({"error": "Error al modificar comentario"}), 500


@comentarios_bp.route('/<int:comentario_id>', methods=['DELETE'])
@jwt_required()
def eliminar_comentario(comentario_id):
    """Eliminar un comentario (solo el autor o admin)"""
    try:
        current_user_id = get_jwt_identity()
        comentario = Comentario.query.get(comentario_id)

        if not comentario:
            return jsonify({"error": "Comentario no encontrado"}), 404

        user = User.query.get(current_user_id)

        if comentario.autor_id != int(current_user_id) and not user.is_admin:
            return jsonify({"error": "No tienes permiso para eliminar este comentario"}), 403

        db.session.delete(comentario)
        db.session.commit()

        return jsonify({"message": "Comentario eliminado con éxito"}), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({"error": "Error al eliminar comentario"}), 500


@comentarios_bp.route('/mis-comentarios', methods=['GET'])
@jwt_required()
def obtener_mis_comentarios():
    """Obtener todos los comentarios del usuario autenticado"""
    try:
        current_user_id = get_jwt_identity()
        user = User.query.get(current_user_id)

        if not user:
            return jsonify({"error": "Usuario no encontrado"}), 404

        comentarios = [comentario.serialize(include_autor=False) for comentario in user.comentarios]

        return jsonify({
            "message": "Comentarios obtenidos con éxito",
            "comentarios": comentarios,
            "total": len(comentarios)
        }), 200

    except Exception as e:
        return jsonify({"error": "Error al obtener comentarios"}), 500
