from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import String, Boolean, Time, Text, DateTime, Table, Column, ForeignKey, UniqueConstraint, Numeric, Integer
from sqlalchemy.orm import Mapped, mapped_column, relationship
from typing import List, Optional
import datetime

db = SQLAlchemy()

favoritos = Table(
    "favoritos",
    db.metadata,
    Column("user_id", ForeignKey("users.id"), primary_key=True),
    Column("receta_id", ForeignKey("recetas.id"), primary_key=True),
)


class User(db.Model):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(primary_key=True)
    username: Mapped[str] = mapped_column(String(20), unique=True, nullable=False)
    email: Mapped[str] = mapped_column(String(120), unique=True, nullable=False)
    password: Mapped[str] = mapped_column(nullable=False)
    is_admin: Mapped[bool] = mapped_column(Boolean(), nullable=False)
    is_premium: Mapped[bool] = mapped_column(Boolean(), nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean(), nullable=False)

    favorites: Mapped[List["Receta"]] = relationship(
        secondary=favoritos, back_populates="favorites")
    
    recetas: Mapped[List["Receta"]] = relationship(back_populates="autor")
    articulos: Mapped[List["Articulo"]] = relationship(back_populates="autor")
    comentarios: Mapped[List["Comentario"]] = relationship(back_populates="autor")

    def serialize(self):
        return {
            "id": self.id,
            "email": self.email,
            "username": self.username,
            "is_premium": self.is_premium,
            "is_admin": self.is_admin
            # no serializar la contraseña, es una brecha de seguridad
        }


class Receta(db.Model):
    __tablename__ = "recetas"

    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(100), nullable=False)
    date: Mapped[object] = mapped_column(Time(), nullable=False)
    descripcion: Mapped[str] = mapped_column(String(), nullable=False)
    ingredientes: Mapped[str] = mapped_column(String(), nullable=False)
    instrucciones: Mapped[str] = mapped_column(String(), nullable=False)
    foto_url: Mapped[str] = mapped_column(String(), nullable=True)

    favorites: Mapped[List["User"]] = relationship(
        secondary=favoritos, back_populates="favorites")

    autor_id: Mapped[int] = mapped_column(ForeignKey("users.id"))
    autor: Mapped["User"] = relationship(back_populates="recetas")

    tags: Mapped["TagList"] = relationship(back_populates="receta")

    def serialize(self, include_autor=True):
        if not self.tags:
            tags = None
        else:
            tags = self.tags.serialize()

        result = {
            "id": self.id,
            "name": self.name,
            "date": self.date.strftime("%Y-%m-%d %H:%M:%S") if self.date else None,
            "descripcion": self.descripcion,
            "ingredientes": self.ingredientes,
            "instrucciones": self.instrucciones,
            "foto_url": self.foto_url,
            "tags": tags,
            "autor_id": self.autor_id
        }

        if include_autor and self.autor:
            result["autor"] = self.autor.serialize()

        return result

class TagList(db.Model):
    __tablename__="taglists"

    id: Mapped[int] = mapped_column(primary_key=True)

    receta_id: Mapped[int] = mapped_column(ForeignKey("recetas.id"))
    receta: Mapped["Receta"] = relationship(back_populates="tags", single_parent=True)

    vegan: Mapped[bool] = mapped_column(Boolean(),nullable=False)
    picante: Mapped[bool] = mapped_column(Boolean(),nullable=False)
    keto: Mapped[bool] = mapped_column(Boolean(),nullable=False)

    __table_args__ = (UniqueConstraint("receta_id"),)

    def serialize(self):
        return {
            "id":self.id,
            "receta_id": self.receta_id,
            "vegan": self.vegan,
            "picante": self.picante,
            "keto": self.keto,
        }


class Articulo(db.Model):
    __tablename__ = "articulos"

    id: Mapped[int] = mapped_column(primary_key=True)
    titulo: Mapped[str] = mapped_column(String(200), nullable=False)
    contenido: Mapped[str] = mapped_column(Text, nullable=False)
    resumen: Mapped[str] = mapped_column(String(500), nullable=True)
    imagen_url: Mapped[str] = mapped_column(String(), nullable=True)
    fecha_creacion: Mapped[datetime.datetime] = mapped_column(DateTime, default=datetime.datetime.now)
    fecha_actualizacion: Mapped[datetime.datetime] = mapped_column(DateTime, default=datetime.datetime.now, onupdate=datetime.datetime.now)
    publicado: Mapped[bool] = mapped_column(Boolean(), default=False)

    autor_id: Mapped[int] = mapped_column(ForeignKey("users.id"))
    autor: Mapped["User"] = relationship(back_populates="articulos")

    comentarios: Mapped[List["Comentario"]] = relationship(back_populates="articulo", cascade="all, delete-orphan")

    def serialize(self, include_autor=True, include_comentarios=False):
        result = {
            "id": self.id,
            "titulo": self.titulo,
            "contenido": self.contenido,
            "resumen": self.resumen,
            "imagen_url": self.imagen_url,
            "fecha_creacion": self.fecha_creacion.strftime("%Y-%m-%d %H:%M:%S") if self.fecha_creacion else None,
            "fecha_actualizacion": self.fecha_actualizacion.strftime("%Y-%m-%d %H:%M:%S") if self.fecha_actualizacion else None,
            "publicado": self.publicado,
            "autor_id": self.autor_id,
            "total_comentarios": len(self.comentarios)
        }

        if include_autor and self.autor:
            result["autor"] = self.autor.serialize()

        if include_comentarios:
            result["comentarios"] = [comentario.serialize() for comentario in self.comentarios]

        return result


class Comentario(db.Model):
    __tablename__ = "comentarios"

    id: Mapped[int] = mapped_column(primary_key=True)
    contenido: Mapped[str] = mapped_column(Text, nullable=False)
    fecha_creacion: Mapped[datetime.datetime] = mapped_column(DateTime, default=datetime.datetime.now)

    autor_id: Mapped[int] = mapped_column(ForeignKey("users.id"))
    autor: Mapped["User"] = relationship(back_populates="comentarios")

    articulo_id: Mapped[int] = mapped_column(ForeignKey("articulos.id"))
    articulo: Mapped["Articulo"] = relationship(back_populates="comentarios")

    def serialize(self, include_autor=True):
        result = {
            "id": self.id,
            "contenido": self.contenido,
            "fecha_creacion": self.fecha_creacion.strftime("%Y-%m-%d %H:%M:%S") if self.fecha_creacion else None,
            "articulo_id": self.articulo_id,
            "autor_id": self.autor_id
        }

        if include_autor and self.autor:
            result["autor"] = self.autor.serialize()

        return result


class CategoriaProducto(db.Model):
    __tablename__ = "categorias_productos"

    id: Mapped[int] = mapped_column(primary_key=True)
    nombre: Mapped[str] = mapped_column(String(100), unique=True, nullable=False)
    descripcion: Mapped[str] = mapped_column(String(500), nullable=True)
    created_at: Mapped[datetime.datetime] = mapped_column(DateTime, default=datetime.datetime.now)

    productos: Mapped[List["Producto"]] = relationship(back_populates="categoria")

    def serialize(self):
        return {
            "id": self.id,
            "nombre": self.nombre,
            "descripcion": self.descripcion,
            "created_at": self.created_at.strftime("%Y-%m-%d %H:%M:%S") if self.created_at else None
        }


class Producto(db.Model):
    __tablename__ = "productos"

    id: Mapped[int] = mapped_column(primary_key=True)
    nombre: Mapped[str] = mapped_column(String(200), nullable=False)
    descripcion: Mapped[str] = mapped_column(Text, nullable=True)
    precio: Mapped[float] = mapped_column(Numeric(10, 2), nullable=False)
    stock: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    imagen_url: Mapped[str] = mapped_column(String(), nullable=True)
    activo: Mapped[bool] = mapped_column(Boolean(), default=True)
    created_at: Mapped[datetime.datetime] = mapped_column(DateTime, default=datetime.datetime.now)
    updated_at: Mapped[datetime.datetime] = mapped_column(DateTime, default=datetime.datetime.now, onupdate=datetime.datetime.now)

    categoria_id: Mapped[Optional[int]] = mapped_column(ForeignKey("categorias_productos.id"), nullable=True)
    categoria: Mapped[Optional["CategoriaProducto"]] = relationship(back_populates="productos")

    items_carrito: Mapped[List["ItemCarrito"]] = relationship(back_populates="producto", cascade="all, delete-orphan")
    items_orden: Mapped[List["ItemOrden"]] = relationship(back_populates="producto")

    def serialize(self, include_categoria=True):
        result = {
            "id": self.id,
            "nombre": self.nombre,
            "descripcion": self.descripcion,
            "precio": float(self.precio),
            "stock": self.stock,
            "imagen_url": self.imagen_url,
            "activo": self.activo,
            "categoria_id": self.categoria_id,
            "created_at": self.created_at.strftime("%Y-%m-%d %H:%M:%S") if self.created_at else None,
            "updated_at": self.updated_at.strftime("%Y-%m-%d %H:%M:%S") if self.updated_at else None
        }

        if include_categoria and self.categoria:
            result["categoria"] = self.categoria.serialize()

        return result


class ItemCarrito(db.Model):
    __tablename__ = "carrito"

    id: Mapped[int] = mapped_column(primary_key=True)
    cantidad: Mapped[int] = mapped_column(Integer, nullable=False, default=1)
    created_at: Mapped[datetime.datetime] = mapped_column(DateTime, default=datetime.datetime.now)

    usuario_id: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=False)
    usuario: Mapped["User"] = relationship()

    producto_id: Mapped[int] = mapped_column(ForeignKey("productos.id"), nullable=False)
    producto: Mapped["Producto"] = relationship(back_populates="items_carrito")

    __table_args__ = (UniqueConstraint("usuario_id", "producto_id", name="unique_usuario_producto"),)

    def serialize(self, include_producto=True):
        result = {
            "id": self.id,
            "cantidad": self.cantidad,
            "usuario_id": self.usuario_id,
            "producto_id": self.producto_id,
            "created_at": self.created_at.strftime("%Y-%m-%d %H:%M:%S") if self.created_at else None
        }

        if include_producto and self.producto:
            result["producto"] = self.producto.serialize()
            result["subtotal"] = float(self.producto.precio) * self.cantidad

        return result


class Orden(db.Model):
    __tablename__ = "ordenes"

    id: Mapped[int] = mapped_column(primary_key=True)
    total: Mapped[float] = mapped_column(Numeric(10, 2), nullable=False)
    estado: Mapped[str] = mapped_column(String(50), nullable=False, default="pending")
    mercado_pago_id: Mapped[str] = mapped_column(String(200), nullable=True)
    preference_id: Mapped[str] = mapped_column(String(200), nullable=True)
    created_at: Mapped[datetime.datetime] = mapped_column(DateTime, default=datetime.datetime.now)
    updated_at: Mapped[datetime.datetime] = mapped_column(DateTime, default=datetime.datetime.now, onupdate=datetime.datetime.now)

    usuario_id: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=False)
    usuario: Mapped["User"] = relationship()

    items: Mapped[List["ItemOrden"]] = relationship(back_populates="orden", cascade="all, delete-orphan")

    def serialize(self, include_items=True):
        result = {
            "id": self.id,
            "total": float(self.total),
            "estado": self.estado,
            "mercado_pago_id": self.mercado_pago_id,
            "preference_id": self.preference_id,
            "usuario_id": self.usuario_id,
            "created_at": self.created_at.strftime("%Y-%m-%d %H:%M:%S") if self.created_at else None,
            "updated_at": self.updated_at.strftime("%Y-%m-%d %H:%M:%S") if self.updated_at else None
        }

        if include_items:
            result["items"] = [item.serialize() for item in self.items]

        return result


class ItemOrden(db.Model):
    __tablename__ = "items_orden"

    id: Mapped[int] = mapped_column(primary_key=True)
    cantidad: Mapped[int] = mapped_column(Integer, nullable=False)
    precio_unitario: Mapped[float] = mapped_column(Numeric(10, 2), nullable=False)
    created_at: Mapped[datetime.datetime] = mapped_column(DateTime, default=datetime.datetime.now)

    orden_id: Mapped[int] = mapped_column(ForeignKey("ordenes.id"), nullable=False)
    orden: Mapped["Orden"] = relationship(back_populates="items")

    producto_id: Mapped[int] = mapped_column(ForeignKey("productos.id"), nullable=False)
    producto: Mapped["Producto"] = relationship(back_populates="items_orden")

    def serialize(self, include_producto=True):
        result = {
            "id": self.id,
            "cantidad": self.cantidad,
            "precio_unitario": float(self.precio_unitario),
            "orden_id": self.orden_id,
            "producto_id": self.producto_id,
            "subtotal": float(self.precio_unitario) * self.cantidad,
            "created_at": self.created_at.strftime("%Y-%m-%d %H:%M:%S") if self.created_at else None
        }

        if include_producto and self.producto:
            result["producto"] = self.producto.serialize(include_categoria=False)

        return result