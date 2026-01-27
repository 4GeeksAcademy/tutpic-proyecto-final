users_routes = Blueprint('users_routes', __name__)

# Permitir solicitudes CORS a esta API
CORS(users_routes)


@users_routes.route('/hello', methods=['POST', 'GET'])
def handle_hello():

    response_body = {
        "message": "Hola! Soy un mensaje del backend, revisa la pestaña de red en el inspector de Google y verás la solicitud GET"
    }

    return jsonify(response_body), 200

