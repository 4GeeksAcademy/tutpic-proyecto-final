# Este archivo fue creado para ejecutar la aplicación en heroku usando gunicorn.
# Lee más sobre esto aquí: https://devcenter.heroku.com/articles/python-gunicorn

from app import app as application

if __name__ == "__main__":
    application.run()
