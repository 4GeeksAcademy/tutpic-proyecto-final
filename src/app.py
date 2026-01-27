"""
Este módulo se encarga de iniciar el servidor API, cargar la BD y agregar los endpoints
"""
import os
from flask import Flask, request, jsonify, url_for, send_from_directory
from flask_migrate import Migrate
from flask_swagger import swagger
from api.utils import APIException, generate_sitemap
from api.models import db
from api.routes import api
from api.admin import setup_admin
from api.commands import setup_commands
from flask_bcrypt import Bcrypt
from flask_jwt_extended import JWTManager
from api.routes_recetas import recetas
from api.routes_tags import tags
from flask_bcrypt import Bcrypt
from flask_jwt_extended import JWTManager, jwt_required, get_jwt_identity

ENV = "development" if os.getenv("FLASK_DEBUG") == "1" else "production"
static_file_dir = os.path.join(os.path.dirname(
    os.path.realpath(__file__)), '../dist/')
app = Flask(__name__)
app.url_map.strict_slashes = False

bcrypt = Bcrypt(app)
jwt = JWTManager(app)
jwt = JWTManager(app)
bcrypt = Bcrypt(app)

# configuración de la base de datos
db_url = os.getenv("DATABASE_URL")
if db_url is not None:
    app.config['SQLALCHEMY_DATABASE_URI'] = db_url.replace(
        "postgres://", "postgresql://")
else:
    app.config['SQLALCHEMY_DATABASE_URI'] = "sqlite:////tmp/test.db"

app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['JWT_SECRET_KEY'] = os.getenv('JWT_SECRET_KEY', 'super-secret-key-change-in-production')
MIGRATE = Migrate(app, db, compare_type=True)
db.init_app(app)

# agregar el admin
setup_admin(app)

# agregar los comandos
setup_commands(app)

# Agregar todos los endpoints del API con los prefijos correspondientes
app.register_blueprint(api, url_prefix='/api')
app.register_blueprint(recetas, url_prefix='/api/recetas')
app.register_blueprint(tags, url_prefix='/api/tags')

# Importar y registrar los nuevos blueprints
from api.routes_favoritos import favoritos_bp
from api.routes_usuarios import usuarios_bp
from api.routes_blog import blog_bp
from api.routes_comentarios import comentarios_bp
from api.routes_productos import productos_bp
from api.routes_carrito import carrito_bp
from api.routes_ordenes import ordenes_bp

app.register_blueprint(favoritos_bp, url_prefix='/api/favoritos')
app.register_blueprint(usuarios_bp, url_prefix='/api/usuarios')
app.register_blueprint(blog_bp, url_prefix='/api/blog')
app.register_blueprint(comentarios_bp, url_prefix='/api/comentarios')
app.register_blueprint(productos_bp, url_prefix='/api/productos')
app.register_blueprint(carrito_bp, url_prefix='/api/carrito')
app.register_blueprint(ordenes_bp, url_prefix='/api/ordenes')
# Manejar/serializar errores como un objeto JSON


@app.errorhandler(APIException)
def handle_invalid_usage(error):
    return jsonify(error.to_dict()), error.status_code

# generar sitemap con todos tus endpoints


@app.route('/')
def sitemap():
    if ENV == "development":
        return generate_sitemap(app)
    return send_from_directory(static_file_dir, 'index.html')

# cualquier otro endpoint intentará servirlo como un archivo estático


@app.route('/<path:path>', methods=['GET'])
def serve_any_other_file(path):
    if not os.path.isfile(os.path.join(static_file_dir, path)):
        path = 'index.html'
    response = send_from_directory(static_file_dir, path)
    response.cache_control.max_age = 0  # evitar memoria cache
    return response


# esto solo se ejecuta si se ejecuta `$ python src/main.py`
if __name__ == '__main__':
    PORT = int(os.environ.get('PORT', 3001))
    app.run(host='0.0.0.0', port=PORT, debug=True)
