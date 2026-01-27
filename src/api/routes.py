"""
Este módulo se encarga de iniciar el servidor API, cargar la BD y agregar los endpoints
"""
from flask import Flask, request, jsonify, Blueprint
from api.models import db, User
from api.utils import generate_sitemap, APIException
from flask_cors import CORS
from flask_bcrypt import Bcrypt
from datetime import timedelta
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity

api = Blueprint('api', __name__)

# Permitir solicitudes CORS a esta API
CORS(api)
bcrypt = Bcrypt()
jwt = JWTManager()


@api.route('/hello', methods=['POST', 'GET'])
def handle_hello():
    response_body = {
        "message": "Hola!! Soy un mensaje del backend, Revisa la pestaña de red en el inspector de Google y verás la solicitud GET"
    }
    return jsonify(response_body), 200


@api.route('/create_user', methods=['POST'])
def create_user():
    try:
        data = request.get_json()
        username = data.get("username")
        email = data.get("email")
        password = data.get("password")

        if not username or not email or not password:
            return jsonify({"error": "Nombre de usuario, email y contraseña son obligatorios"}), 400

        existing_user = User.query.filter_by(email=email).first()
        if existing_user:
            return jsonify({"error": "El usuario ya existe"}), 409

        passhash = bcrypt.generate_password_hash(password).decode('utf-8')
        user = User(username=username, email=email, password=passhash, is_admin=False, is_premium=False, is_active=True)
        db.session.add(user)
        db.session.commit()

        return jsonify({"message": "Usuario creado exitosamente", "nuevo_usuario": user.serialize()}), 201

    except Exception as e:
        db.session.rollback()
        # Log the error for debugging
        print(f"Error interno: {e}")
        return jsonify({"error": "Error interno del servidor"}), 500


@api.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    if not data:
        return jsonify({"error": "No se recibió información"}), 400

    email = data.get("email")
    password = data.get("password")

    if not email or not password:
        return jsonify({"error": "Email y contraseña son obligatorios"}), 400

    user = User.query.filter_by(email=email).first()
    if not user:
        return jsonify({"error": "Usuario no encontrado"}), 404

    if not bcrypt.check_password_hash(user.password, password):
        return jsonify({"error": "Contraseña incorrecta"}), 401

    expires = timedelta(minutes=30)
    access_token = create_access_token(
        identity=str(user.id), expires_delta=expires)

    return jsonify({"access_token": access_token}), 200


@api.route('/restringido')
@jwt_required()
def restringido():
    current_user_id = get_jwt_identity()
    if not current_user_id:
        return jsonify({"error": "Usuario no autenticado"}), 401

    user = User.query.get(current_user_id)
    if not user:
        return jsonify({"error": "Usuario no encontrado"}), 404

    return jsonify({"user": user.serialize()}), 200


@api.route('/reset-password', methods=['POST'])
def reset_password():
    try:
        data = request.get_json()
        email = data.get("email")

        if not email:
            return jsonify({"error": "El correo electrónico es obligatorio"}), 400

        user = User.query.filter_by(email=email).first()
        if not user:
            return jsonify({"message": "Si el correo existe, recibirás instrucciones"}), 200

        return jsonify({"message": "Si el correo existe, recibirás instrucciones"}), 200

    except Exception as e:
        print(f"Error en reset-password: {e}")
        return jsonify({"error": "Error interno del servidor"}), 500
