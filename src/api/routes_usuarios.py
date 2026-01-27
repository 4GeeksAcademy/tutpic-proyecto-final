"""
Blueprint para gestionar operaciones de usuarios
"""
from flask import request, jsonify, Blueprint
from api.models import db, User, Receta
from flask_jwt_extended import jwt_required, get_jwt_identity
from flask_bcrypt import Bcrypt

usuarios_bp = Blueprint('usuarios', __name__)
bcrypt = Bcrypt()


@usuarios_bp.route('/perfil', methods=['GET'])
@jwt_required()
def obtener_perfil():
    """Obtener el perfil del usuario autenticado"""
    try:
        current_user_id = get_jwt_identity()
        user = User.query.get(current_user_id)

        if not user:
            return jsonify({"error": "Usuario no encontrado"}), 404

        # Contar recetas y favoritos
        total_recetas = len(user.recetas)
        total_favoritos = len(user.favorites)

        perfil = user.serialize()
        perfil["total_recetas"] = total_recetas
        perfil["total_favoritos"] = total_favoritos

        return jsonify({
            "message": "Perfil obtenido con éxito",
            "perfil": perfil
        }), 200

    except Exception as e:
        return jsonify({"error": "Error al obtener perfil"}), 500


@usuarios_bp.route('/perfil', methods=['PUT'])
@jwt_required()
def actualizar_perfil():
    """Actualizar el perfil del usuario"""
    try:
        current_user_id = get_jwt_identity()
        user = User.query.get(current_user_id)

        if not user:
            return jsonify({"error": "Usuario no encontrado"}), 404

        data = request.get_json()
        if not data:
            return jsonify({"error": "No se recibieron datos"}), 400

        username = data.get("username")
        email = data.get("email")

        # Verificar si el username ya existe (si se está cambiando)
        if username and username != user.username:
            existing_user = User.query.filter_by(username=username).first()
            if existing_user:
                return jsonify({"error": "El nombre de usuario ya existe"}), 400
            user.username = username

        # Verificar si el email ya existe (si se está cambiando)
        if email and email != user.email:
            existing_user = User.query.filter_by(email=email).first()
            if existing_user:
                return jsonify({"error": "El correo electrónico ya existe"}), 400
            user.email = email

        db.session.commit()

        return jsonify({
            "message": "Perfil actualizado con éxito",
            "perfil": user.serialize()
        }), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({"error": "Error al actualizar perfil"}), 500


@usuarios_bp.route('/mis-recetas', methods=['GET'])
@jwt_required()
def obtener_mis_recetas():
    """Obtener todas las recetas del usuario autenticado"""
    try:
        current_user_id = get_jwt_identity()
        user = User.query.get(current_user_id)

        if not user:
            return jsonify({"error": "Usuario no encontrado"}), 404

        recetas = [receta.serialize(include_autor=False) for receta in user.recetas]

        return jsonify({
            "message": "Recetas obtenidas con éxito",
            "recetas": recetas,
            "total": len(recetas)
        }), 200

    except Exception as e:
        return jsonify({"error": "Error al obtener recetas"}), 500


@usuarios_bp.route('/cambiar-contrasena', methods=['POST'])
@jwt_required()
def cambiar_contrasena():
    """Cambiar la contraseña del usuario"""
    try:
        current_user_id = get_jwt_identity()
        user = User.query.get(current_user_id)

        if not user:
            return jsonify({"error": "Usuario no encontrado"}), 404

        data = request.get_json()
        if not data:
            return jsonify({"error": "No se recibieron datos"}), 400

        current_password = data.get("current_password")
        new_password = data.get("new_password")

        if not current_password or not new_password:
            return jsonify({"error": "Se requieren la contraseña actual y la nueva"}), 400

        # Verificar la contraseña actual
        if not bcrypt.check_password_hash(user.password, current_password):
            return jsonify({"error": "Contraseña actual incorrecta"}), 401

        # Hashear y guardar la nueva contraseña
        user.password = bcrypt.generate_password_hash(new_password).decode('utf-8')
        db.session.commit()

        return jsonify({"message": "Contraseña cambiada con éxito"}), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({"error": "Error al cambiar contraseña"}), 500


@usuarios_bp.route('/<int:user_id>', methods=['GET'])
def obtener_usuario_publico(user_id):
    """Obtener información pública de un usuario"""
    try:
        user = User.query.get(user_id)

        if not user:
            return jsonify({"error": "Usuario no encontrado"}), 404

        # Información pública del usuario
        perfil_publico = {
            "id": user.id,
            "username": user.username,
            "is_premium": user.is_premium,
            "total_recetas": len(user.recetas)
        }

        return jsonify({
            "message": "Usuario obtenido con éxito",
            "usuario": perfil_publico
        }), 200

    except Exception as e:
        return jsonify({"error": "Error al obtener usuario"}), 500
