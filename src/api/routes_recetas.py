"""
Blueprint para gestionar todas las operaciones relacionadas con recetas
"""
from flask import Flask, request, jsonify, url_for, Blueprint
from api.models import db, Receta, User
import datetime
from flask_bcrypt import Bcrypt
from flask_jwt_extended import JWTManager, jwt_required, get_jwt_identity

recetas = Blueprint('recetas', __name__)

jwt = JWTManager()
bcrypt = Bcrypt()

@recetas.route('/test', methods=['POST', 'GET'])
def handle_hello():

    response_body = {
        "message":"esto es recetas/test"
    }
    users = User.query.all()
    serialized = list(map(lambda x: x.serialize(),users))

    return jsonify(serialized), 200

@recetas.route('/lista', methods=['GET'])
def get_lista_recetas():
    """Obtener lista de recetas con filtros opcionales"""
    try:
        # Parámetros de búsqueda y filtro
        search = request.args.get('search', '').strip()
        autor_id = request.args.get('autor_id', type=int)
        vegan = request.args.get('vegan', type=lambda v: v.lower() == 'true')
        picante = request.args.get('picante', type=lambda v: v.lower() == 'true')
        keto = request.args.get('keto', type=lambda v: v.lower() == 'true')
        limit = request.args.get('limit', type=int, default=50)
        offset = request.args.get('offset', type=int, default=0)

        # Query base
        query = Receta.query

        # Filtro por autor
        if autor_id:
            query = query.filter(Receta.autor_id == autor_id)

        # Búsqueda por texto
        if search:
            search_filter = f"%{search}%"
            query = query.filter(
                (Receta.name.ilike(search_filter)) |
                (Receta.descripcion.ilike(search_filter)) |
                (Receta.ingredientes.ilike(search_filter))
            )

        # Filtros de tags
        if vegan is not None or picante is not None or keto is not None:
            from api.models import TagList
            query = query.join(TagList, Receta.id == TagList.receta_id)

            if vegan is not None:
                query = query.filter(TagList.vegan == vegan)
            if picante is not None:
                query = query.filter(TagList.picante == picante)
            if keto is not None:
                query = query.filter(TagList.keto == keto)

        # Ordenar por fecha (más recientes primero)
        query = query.order_by(Receta.date.desc())

        # Paginación
        total = query.count()
        recetas_result = query.offset(offset).limit(limit).all()

        serialized = [receta.serialize(include_autor=True) for receta in recetas_result]

        return jsonify({
            "message": "Lista de recetas obtenida con éxito",
            "recetas": serialized,
            "total": total,
            "limit": limit,
            "offset": offset
        }), 200

    except Exception as e:
        return jsonify({"error": "Error al obtener lista de recetas", "details": str(e)}), 500

@recetas.route('/<int:receta_id>', methods=['GET'])
def get_receta_by_id(receta_id):
    receta = Receta.query.get(receta_id)

    if not receta:
        return jsonify({"msg":"No se encontro receta con ese id"}),404
    
    serialized = receta.serialize()
    
    return jsonify({"msg":"Receta encontrada con éxito","receta":serialized}),200

@recetas.route('/crear', methods=['POST'])
@jwt_required()
def crear_receta():
    """Crear una nueva receta (requiere autenticación)"""
    try:
        current_user_id = get_jwt_identity()
        data = request.get_json()

        if not data:
            return jsonify({"error":"No se recibieron datos"}), 400

        name = data.get("name")
        descripcion = data.get("descripcion")
        ingredientes = data.get("ingredientes")
        instrucciones = data.get("instrucciones")
        foto_url = data.get("foto_url")

        if not(name and descripcion and ingredientes and instrucciones):
            return jsonify({"error":"Faltan datos obligatorios (name, descripcion, ingredientes, instrucciones)"}), 400

        user = User.query.get(current_user_id)
        if not user:
            return jsonify({"error":"Usuario no encontrado"}), 404

        nueva_receta = Receta(
            name=name,
            date=datetime.datetime.now(),
            descripcion=descripcion,
            ingredientes=ingredientes,
            instrucciones=instrucciones,
            foto_url=foto_url,
            autor_id=current_user_id
        )

        db.session.add(nueva_receta)
        db.session.commit()

        return jsonify({
            "message":"Receta creada con éxito",
            "receta":nueva_receta.serialize()
        }), 201

    except Exception as e:
        db.session.rollback()
        return jsonify({"error":"Error al crear la receta", "details": str(e)}), 500


@recetas.route('/<int:receta_id>', methods=['DELETE'])
@jwt_required()
def eliminar_receta(receta_id):
    """Eliminar una receta (solo el autor o admin)"""
    try:
        current_user_id = get_jwt_identity()
        receta = Receta.query.get(receta_id)

        if not receta:
            return jsonify({"error":"Receta no encontrada"}), 404

        user = User.query.get(current_user_id)

        # Solo el autor o un admin puede eliminar la receta
        if receta.autor_id != int(current_user_id) and not user.is_admin:
            return jsonify({"error":"No tienes permiso para eliminar esta receta"}), 403

        db.session.delete(receta)
        db.session.commit()

        return jsonify({"message":"Receta eliminada con éxito"}), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({"error":"Error al eliminar la receta"}), 500

@recetas.route('/<int:receta_id>', methods=['PUT'])
@jwt_required()
def modificar_receta(receta_id):
    """Modificar una receta existente (solo el autor)"""
    try:
        current_user_id = get_jwt_identity()
        data = request.get_json()

        if not data:
            return jsonify({"error":"No se recibieron datos"}), 400

        receta = Receta.query.get(receta_id)

        if not receta:
            return jsonify({"error":"Receta no encontrada"}), 404

        # Solo el autor puede modificar la receta
        if receta.autor_id != int(current_user_id):
            return jsonify({"error":"No tienes permiso para modificar esta receta"}), 403

        name = data.get("name")
        descripcion = data.get("descripcion")
        ingredientes = data.get("ingredientes")
        instrucciones = data.get("instrucciones")
        foto_url = data.get("foto_url")

        if not(name or descripcion or ingredientes or instrucciones or foto_url):
            return jsonify({"error":"No se especificaron modificaciones"}), 400

        if name:
            receta.name = name
        if descripcion:
            receta.descripcion = descripcion
        if ingredientes:
            receta.ingredientes = ingredientes
        if instrucciones:
            receta.instrucciones = instrucciones
        if foto_url:
            receta.foto_url = foto_url

        receta.date = datetime.datetime.now()
        db.session.commit()

        return jsonify({
            "message":"Receta modificada con éxito",
            "receta":receta.serialize()
        }), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({"error":"Error al modificar la receta"}), 500