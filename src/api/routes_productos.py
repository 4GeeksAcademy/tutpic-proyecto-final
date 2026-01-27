from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from api.models import db, Producto, CategoriaProducto, User
from api.utils import APIException

productos_bp = Blueprint('productos', __name__)


@productos_bp.route('/', methods=['GET'])
def get_productos():
    try:
        categoria_id = request.args.get('categoria_id', type=int)
        activo = request.args.get('activo', 'true').lower() == 'true'

        query = Producto.query

        if categoria_id:
            query = query.filter_by(categoria_id=categoria_id)

        if activo:
            query = query.filter_by(activo=True)

        productos = query.all()

        return jsonify([producto.serialize() for producto in productos]), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@productos_bp.route('/<int:producto_id>', methods=['GET'])
def get_producto(producto_id):
    try:
        producto = Producto.query.get(producto_id)

        if not producto:
            return jsonify({"error": "Producto no encontrado"}), 404

        return jsonify(producto.serialize()), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@productos_bp.route('/', methods=['POST'])
@jwt_required()
def create_producto():
    try:
        user_id = get_jwt_identity()
        user = User.query.get(user_id)

        if not user or not user.is_admin:
            return jsonify({"error": "No autorizado"}), 403

        data = request.get_json()

        if not data.get('nombre') or not data.get('precio'):
            return jsonify({"error": "Nombre y precio son requeridos"}), 400

        nuevo_producto = Producto(
            nombre=data['nombre'],
            descripcion=data.get('descripcion', ''),
            precio=data['precio'],
            stock=data.get('stock', 0),
            imagen_url=data.get('imagen_url', ''),
            categoria_id=data.get('categoria_id'),
            activo=data.get('activo', True)
        )

        db.session.add(nuevo_producto)
        db.session.commit()

        return jsonify(nuevo_producto.serialize()), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500


@productos_bp.route('/<int:producto_id>', methods=['PUT'])
@jwt_required()
def update_producto(producto_id):
    try:
        user_id = get_jwt_identity()
        user = User.query.get(user_id)

        if not user or not user.is_admin:
            return jsonify({"error": "No autorizado"}), 403

        producto = Producto.query.get(producto_id)

        if not producto:
            return jsonify({"error": "Producto no encontrado"}), 404

        data = request.get_json()

        if 'nombre' in data:
            producto.nombre = data['nombre']
        if 'descripcion' in data:
            producto.descripcion = data['descripcion']
        if 'precio' in data:
            producto.precio = data['precio']
        if 'stock' in data:
            producto.stock = data['stock']
        if 'imagen_url' in data:
            producto.imagen_url = data['imagen_url']
        if 'categoria_id' in data:
            producto.categoria_id = data['categoria_id']
        if 'activo' in data:
            producto.activo = data['activo']

        db.session.commit()

        return jsonify(producto.serialize()), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500


@productos_bp.route('/<int:producto_id>', methods=['DELETE'])
@jwt_required()
def delete_producto(producto_id):
    try:
        user_id = get_jwt_identity()
        user = User.query.get(user_id)

        if not user or not user.is_admin:
            return jsonify({"error": "No autorizado"}), 403

        producto = Producto.query.get(producto_id)

        if not producto:
            return jsonify({"error": "Producto no encontrado"}), 404

        db.session.delete(producto)
        db.session.commit()

        return jsonify({"message": "Producto eliminado correctamente"}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500


@productos_bp.route('/categorias', methods=['GET'])
def get_categorias():
    try:
        categorias = CategoriaProducto.query.all()
        return jsonify([categoria.serialize() for categoria in categorias]), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@productos_bp.route('/categorias', methods=['POST'])
@jwt_required()
def create_categoria():
    try:
        user_id = get_jwt_identity()
        user = User.query.get(user_id)

        if not user or not user.is_admin:
            return jsonify({"error": "No autorizado"}), 403

        data = request.get_json()

        if not data.get('nombre'):
            return jsonify({"error": "Nombre es requerido"}), 400

        nueva_categoria = CategoriaProducto(
            nombre=data['nombre'],
            descripcion=data.get('descripcion', '')
        )

        db.session.add(nueva_categoria)
        db.session.commit()

        return jsonify(nueva_categoria.serialize()), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500
