"""
Blueprint para gestionar tags de recetas
"""
from flask import Flask, request, jsonify, url_for, Blueprint
from api.models import db, Receta, User, TagList
import datetime
from flask_bcrypt import Bcrypt
from flask_jwt_extended import JWTManager, jwt_required, get_jwt_identity

tags = Blueprint('tags', __name__)

jwt = JWTManager()
bcrypt = Bcrypt()

@tags.route('/<int:tags_id>', methods=['GET'])
def get_tags_by_id(tags_id):
    """Obtener tags por ID"""
    tags = TagList.query.get(tags_id)

    if not tags:
        return jsonify({"error":"Tags no encontrados"}), 404

    serialized = tags.serialize()

    return jsonify({"message":"Tags encontrados con éxito", "tags":serialized}), 200

@tags.route('/crear', methods=['POST'])
@jwt_required()
def crear_taglist():
    """Crear tags para una receta (requiere ser el autor)"""
    try:
        current_user_id = get_jwt_identity()
        data = request.get_json()

        if not data:
            return jsonify({"error":"No se recibieron datos"}), 400

        receta_id = data.get("receta_id")
        vegan = data.get("vegan")
        picante = data.get("picante")
        keto = data.get("keto")

        if not(receta_id and vegan!=None and picante!=None and keto!=None):
            return jsonify({"error":"Faltan datos obligatorios"}), 400

        receta = Receta.query.get(receta_id)

        if not receta:
            return jsonify({"error":"Receta no encontrada"}), 404

        # Verificar que el usuario es el autor
        if receta.autor_id != int(current_user_id):
            return jsonify({"error":"No tienes permiso para modificar esta receta"}), 403

        if receta.tags:
            return jsonify({"error":"Ya existen tags para esta receta"}), 400

        nueva_taglist = TagList(
            receta_id=receta_id,
            vegan=vegan,
            picante=picante,
            keto=keto
        )

        db.session.add(nueva_taglist)
        db.session.commit()

        return jsonify({
            "message":"Tags creados con éxito",
            "tags":nueva_taglist.serialize()
        }), 201

    except Exception as e:
        db.session.rollback()
        return jsonify({"error":"Error al crear tags"}), 500

@tags.route('/<int:receta_id>', methods=['DELETE'])
def borrar_taglist(receta_id):

    receta = Receta.query.get(receta_id)

    if not receta:
        return jsonify({"msg":"No se encontro receta con ese id"}),404
    
    taglist_id = receta.tags.id

    taglist = TagList.query.get(taglist_id)

    if not taglist:
        return jsonify({"msg":"No se encontraron tags en esta receta"}),404
    
    db.session.delete(taglist)
    db.session.commit()

    return jsonify({}) ,204

@tags.route('/modificar', methods=['PUT'])
@jwt_required()
def modificar_taglist():
    """Modificar tags de una receta (requiere ser el autor)"""
    try:
        current_user_id = get_jwt_identity()
        data = request.get_json()

        if not data:
            return jsonify({"error":"No se recibieron datos"}), 400

        receta_id = data.get("receta_id")
        vegan = data.get("vegan")
        picante = data.get("picante")
        keto = data.get("keto")

        if not receta_id:
            return jsonify({"error":"Debe especificar el id de la receta"}), 400

        receta = Receta.query.get(receta_id)

        if not receta:
            return jsonify({"error":"Receta no encontrada"}), 404

        # Verificar que el usuario es el autor
        if receta.autor_id != int(current_user_id):
            return jsonify({"error":"No tienes permiso para modificar esta receta"}), 403

        if not receta.tags:
            return jsonify({"error":"No se encontraron tags para esta receta"}), 404

        if not(vegan!=None or picante!=None or keto!=None):
            return jsonify({"error":"Debe especificar al menos un tag para modificar"}), 400

        taglist = receta.tags

        if vegan!=None:
            taglist.vegan = vegan

        if picante!=None:
            taglist.picante = picante

        if keto!=None:
            taglist.keto = keto

        db.session.commit()

        return jsonify({
            "message":"Tags modificados con éxito",
            "tags":taglist.serialize()
        }), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({"error":"Error al modificar tags"}), 500