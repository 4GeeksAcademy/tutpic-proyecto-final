
import click
from api.models import db, User
from flask_bcrypt import Bcrypt

bcrypt = Bcrypt()

"""
En este archivo, puedes agregar tantos comandos como quieras usando el decorador @app.cli.command
Los comandos de Flask son útiles para ejecutar cronjobs o tareas fuera del API pero manteniendo la integración
con tu base de datos, por ejemplo: Importar el precio del bitcoin cada noche a las 12am
"""
def setup_commands(app):

    """
    Este es un comando de ejemplo "insert-test-users" que puedes ejecutar desde la línea de comandos
    escribiendo: $ flask insert-test-users 5
    Nota: 5 es el número de usuarios a agregar
    """
    @app.cli.command("insert-test-users") # nombre de nuestro comando
    @click.argument("count") # argumento de nuestro comando
    def insert_test_users(count):
        print("Creando usuarios de prueba")
        for x in range(1, int(count) + 1):
            user = User()
            user.username = "test_user" + str(x)
            user.email = "test_user" + str(x) + "@test.com"
            user.password = bcrypt.generate_password_hash("123456").decode('utf-8')
            user.is_active = True
            user.is_admin = False
            user.is_premium = False
            db.session.add(user)
            db.session.commit()
            print("Usuario: ", user.email, " creado.")

        print("Todos los usuarios de prueba fueron creados")

    @app.cli.command("insert-test-data")
    def insert_test_data():
        pass