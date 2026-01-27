import os
import inspect
from flask_admin import Admin
from . import models
from .models import db
from flask_admin.contrib.sqla import ModelView
from flask_admin.theme import Bootstrap4Theme


def setup_admin(app):
    app.secret_key = os.environ.get('FLASK_APP_KEY', 'sample key')
    admin = Admin(app, name='4Geeks Admin', theme=Bootstrap4Theme(swatch='cerulean'))

    # Agregar dinámicamente todos los modelos a la interfaz de administración
    for name, obj in inspect.getmembers(models):
        # Verificar que el objeto sea un modelo SQLAlchemy antes de agregarlo al admin
        if inspect.isclass(obj) and issubclass(obj, db.Model):
            admin.add_view(ModelView(obj, db.session))