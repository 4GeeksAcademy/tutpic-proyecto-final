from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from api.models import db, ItemCarrito, Producto, User
from api.utils import APIException

carrito_bp = Blueprint('carrito', __name__)


@carrito_bp.route('/', methods=['GET'])
@jwt_required()
def get_carrito():
    try:
        user_id = get_jwt_identity()

        items = ItemCarrito.query.filter_by(usuario_id=user_id).all()

        total = sum(item.producto.precio * item.cantidad for item in items if item.producto)

        return jsonify({
            "items": [item.serialize() for item in items],
            "total": float(total),
            "cantidad_items": len(items)
        }), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@carrito_bp.route('/agregar', methods=['POST'])
@jwt_required()
def agregar_al_carrito():
    try:
        user_id = get_jwt_identity()
        data = request.get_json()

        if not data.get('producto_id'):
            return jsonify({"error": "producto_id es requerido"}), 400

        producto = Producto.query.get(data['producto_id'])

        if not producto:
            return jsonify({"error": "Producto no encontrado"}), 404

        if not producto.activo:
            return jsonify({"error": "Producto no disponible"}), 400

        cantidad = data.get('cantidad', 1)

        if cantidad <= 0:
            return jsonify({"error": "Cantidad debe ser mayor a 0"}), 400

        if producto.stock < cantidad:
            return jsonify({"error": f"Stock insuficiente. Disponible: {producto.stock}"}), 400

        item_existente = ItemCarrito.query.filter_by(
            usuario_id=user_id,
            producto_id=producto.id
        ).first()

        if item_existente:
            nueva_cantidad = item_existente.cantidad + cantidad

            if producto.stock < nueva_cantidad:
                return jsonify({"error": f"Stock insuficiente. Disponible: {producto.stock}"}), 400

            item_existente.cantidad = nueva_cantidad
            db.session.commit()

            return jsonify(item_existente.serialize()), 200
        else:
            nuevo_item = ItemCarrito(
                usuario_id=user_id,
                producto_id=producto.id,
                cantidad=cantidad
            )

            db.session.add(nuevo_item)
            db.session.commit()

            return jsonify(nuevo_item.serialize()), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500


@carrito_bp.route('/actualizar/<int:item_id>', methods=['PUT'])
@jwt_required()
def actualizar_item_carrito(item_id):
    try:
        user_id = get_jwt_identity()
        data = request.get_json()

        item = ItemCarrito.query.filter_by(id=item_id, usuario_id=user_id).first()

        if not item:
            return jsonify({"error": "Item no encontrado"}), 404

        cantidad = data.get('cantidad')

        if cantidad is None or cantidad <= 0:
            return jsonify({"error": "Cantidad debe ser mayor a 0"}), 400

        if item.producto.stock < cantidad:
            return jsonify({"error": f"Stock insuficiente. Disponible: {item.producto.stock}"}), 400

        item.cantidad = cantidad
        db.session.commit()

        return jsonify(item.serialize()), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500


@carrito_bp.route('/eliminar/<int:item_id>', methods=['DELETE'])
@jwt_required()
def eliminar_item_carrito(item_id):
    try:
        user_id = get_jwt_identity()

        item = ItemCarrito.query.filter_by(id=item_id, usuario_id=user_id).first()

        if not item:
            return jsonify({"error": "Item no encontrado"}), 404

        db.session.delete(item)
        db.session.commit()

        return jsonify({"message": "Item eliminado del carrito"}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500


@carrito_bp.route('/vaciar', methods=['DELETE'])
@jwt_required()
def vaciar_carrito():
    try:
        user_id = get_jwt_identity()

        ItemCarrito.query.filter_by(usuario_id=user_id).delete()
        db.session.commit()

        return jsonify({"message": "Carrito vaciado correctamente"}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500
