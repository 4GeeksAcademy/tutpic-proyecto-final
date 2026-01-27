"""
Blueprint para gestionar favoritos de usuarios
"""
from flask import request, jsonify, Blueprint
from api.models import db, Receta, User
from flask_jwt_extended import jwt_required, get_jwt_identity

favoritos_bp = Blueprint('favoritos', __name__)


@favoritos_bp.route('/mis-favoritos', methods=['GET'])
@jwt_required()
def obtener_mis_favoritos():
    """Obtener todas las recetas favoritas del usuario autenticado"""
    try:
        current_user_id = get_jwt_identity()
        user = User.query.get(current_user_id)

        if not user:
            return jsonify({"error": "Usuario no encontrado"}), 404

        favoritos = [receta.serialize(include_autor=True) for receta in user.favorites]

        return jsonify({
            "message": "Favoritos obtenidos con éxito",
            "favoritos": favoritos,
            "total": len(favoritos)
        }), 200

    except Exception as e:
        return jsonify({"error": "Error al obtener favoritos", "details": str(e)}), 500


@favoritos_bp.route('/agregar/<int:receta_id>', methods=['POST'])
@jwt_required()
def agregar_favorito(receta_id):
    """Agregar una receta a favoritos"""
    try:
        current_user_id = get_jwt_identity()
        user = User.query.get(current_user_id)
        receta = Receta.query.get(receta_id)

        if not user:
            return jsonify({"error": "Usuario no encontrado"}), 404

        if not receta:
            return jsonify({"error": "Receta no encontrada"}), 404

        # Verificar si ya está en favoritos
        if receta in user.favorites:
            return jsonify({"error": "La receta ya está en favoritos"}), 400

        user.favorites.append(receta)
        db.session.commit()

        return jsonify({
            "message": "Receta agregada a favoritos",
            "receta": receta.serialize(include_autor=False)
        }), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({"error": "Error al agregar favorito", "details": str(e)}), 500


@favoritos_bp.route('/eliminar/<int:receta_id>', methods=['DELETE'])
@jwt_required()
def eliminar_favorito(receta_id):
    """Eliminar una receta de favoritos"""
    try:
        current_user_id = get_jwt_identity()
        user = User.query.get(current_user_id)
        receta = Receta.query.get(receta_id)

        if not user:
            return jsonify({"error": "Usuario no encontrado"}), 404

        if not receta:
            return jsonify({"error": "Receta no encontrada"}), 404

        # Verificar si está en favoritos
        if receta not in user.favorites:
            return jsonify({"error": "La receta no está en favoritos"}), 400

        user.favorites.remove(receta)
        db.session.commit()

        return jsonify({"message": "Receta eliminada de favoritos"}), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({"error": "Error al eliminar favorito"}), 500


@favoritos_bp.route('/verificar/<int:receta_id>', methods=['GET'])
@jwt_required()
def verificar_favorito(receta_id):
    """Verificar si una receta está en favoritos"""
    try:
        current_user_id = get_jwt_identity()
        user = User.query.get(current_user_id)
        receta = Receta.query.get(receta_id)

        if not user:
            return jsonify({"error": "Usuario no encontrado"}), 404

        if not receta:
            return jsonify({"error": "Receta no encontrada"}), 404

        es_favorito = receta in user.favorites

        return jsonify({
            "receta_id": receta_id,
            "es_favorito": es_favorito
        }), 200

    except Exception as e:
        return jsonify({"error": "Error al verificar favorito"}), 500
