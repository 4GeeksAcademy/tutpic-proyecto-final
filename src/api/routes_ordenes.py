from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from api.models import db, Orden, ItemOrden, ItemCarrito, Producto, User
from api.utils import APIException
import os

ordenes_bp = Blueprint('ordenes', __name__)


@ordenes_bp.route('/', methods=['GET'])
@jwt_required()
def get_ordenes():
    try:
        user_id = get_jwt_identity()

        ordenes = Orden.query.filter_by(usuario_id=user_id).order_by(Orden.created_at.desc()).all()

        return jsonify([orden.serialize() for orden in ordenes]), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@ordenes_bp.route('/<int:orden_id>', methods=['GET'])
@jwt_required()
def get_orden(orden_id):
    try:
        user_id = get_jwt_identity()

        orden = Orden.query.filter_by(id=orden_id, usuario_id=user_id).first()

        if not orden:
            return jsonify({"error": "Orden no encontrada"}), 404

        return jsonify(orden.serialize()), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@ordenes_bp.route('/crear', methods=['POST'])
@jwt_required()
def crear_orden():
    try:
        user_id = get_jwt_identity()

        items_carrito = ItemCarrito.query.filter_by(usuario_id=user_id).all()

        if not items_carrito:
            return jsonify({"error": "El carrito está vacío"}), 400

        for item in items_carrito:
            if not item.producto.activo:
                return jsonify({"error": f"El producto {item.producto.nombre} no está disponible"}), 400
            if item.producto.stock < item.cantidad:
                return jsonify({"error": f"Stock insuficiente para {item.producto.nombre}"}), 400

        total = sum(item.producto.precio * item.cantidad for item in items_carrito)

        nueva_orden = Orden(
            usuario_id=user_id,
            total=total,
            estado='pending'
        )

        db.session.add(nueva_orden)
        db.session.flush()

        for item in items_carrito:
            item_orden = ItemOrden(
                orden_id=nueva_orden.id,
                producto_id=item.producto_id,
                cantidad=item.cantidad,
                precio_unitario=item.producto.precio
            )
            db.session.add(item_orden)

            item.producto.stock -= item.cantidad

        ItemCarrito.query.filter_by(usuario_id=user_id).delete()

        db.session.commit()

        return jsonify(nueva_orden.serialize()), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500


@ordenes_bp.route('/mercadopago/preference', methods=['POST'])
@jwt_required()
def crear_preference_mercadopago():
    try:
        import mercadopago

        user_id = get_jwt_identity()
        data = request.get_json()

        if not data.get('orden_id'):
            return jsonify({"error": "orden_id es requerido"}), 400

        orden = Orden.query.filter_by(id=data['orden_id'], usuario_id=user_id).first()

        if not orden:
            return jsonify({"error": "Orden no encontrada"}), 404

        access_token = os.getenv('MERCADO_PAGO_ACCESS_TOKEN')

        if not access_token:
            return jsonify({"error": "Mercado Pago no está configurado"}), 500

        sdk = mercadopago.SDK(access_token)

        items = []
        for item in orden.items:
            items.append({
                "title": item.producto.nombre,
                "quantity": item.cantidad,
                "unit_price": float(item.precio_unitario),
                "currency_id": "ARS"
            })

        preference_data = {
            "items": items,
            "back_urls": {
                "success": f"{os.getenv('FRONTEND_URL', 'http://localhost:3000')}/tienda/orden/{orden.id}/success",
                "failure": f"{os.getenv('FRONTEND_URL', 'http://localhost:3000')}/tienda/orden/{orden.id}/failure",
                "pending": f"{os.getenv('FRONTEND_URL', 'http://localhost:3000')}/tienda/orden/{orden.id}/pending"
            },
            "auto_return": "approved",
            "external_reference": str(orden.id),
            "statement_descriptor": "Tu Tienda"
        }

        preference_response = sdk.preference().create(preference_data)
        preference = preference_response["response"]

        orden.preference_id = preference["id"]
        db.session.commit()

        return jsonify({
            "preference_id": preference["id"],
            "init_point": preference["init_point"]
        }), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500


@ordenes_bp.route('/mercadopago/webhook', methods=['POST'])
def webhook_mercadopago():
    try:
        import mercadopago

        data = request.get_json()

        if data.get('type') == 'payment':
            payment_id = data['data']['id']

            access_token = os.getenv('MERCADO_PAGO_ACCESS_TOKEN')

            if not access_token:
                return jsonify({"error": "Mercado Pago no está configurado"}), 500

            sdk = mercadopago.SDK(access_token)

            payment_info = sdk.payment().get(payment_id)
            payment = payment_info["response"]

            orden_id = int(payment.get('external_reference'))

            orden = Orden.query.get(orden_id)

            if orden:
                orden.mercado_pago_id = str(payment_id)

                if payment['status'] == 'approved':
                    orden.estado = 'approved'
                elif payment['status'] == 'rejected':
                    orden.estado = 'rejected'
                    for item in orden.items:
                        item.producto.stock += item.cantidad
                elif payment['status'] == 'pending':
                    orden.estado = 'pending'

                db.session.commit()

        return jsonify({"status": "ok"}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500


@ordenes_bp.route('/<int:orden_id>/cancelar', methods=['PUT'])
@jwt_required()
def cancelar_orden(orden_id):
    try:
        user_id = get_jwt_identity()

        orden = Orden.query.filter_by(id=orden_id, usuario_id=user_id).first()

        if not orden:
            return jsonify({"error": "Orden no encontrada"}), 404

        if orden.estado != 'pending':
            return jsonify({"error": "Solo se pueden cancelar órdenes pendientes"}), 400

        orden.estado = 'cancelled'

        for item in orden.items:
            item.producto.stock += item.cantidad

        db.session.commit()

        return jsonify(orden.serialize()), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500
