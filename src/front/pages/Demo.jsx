// Importar componentes necesarios de react-router-dom y otras partes de la aplicación.
import { Link } from "react-router-dom";
import useGlobalReducer from "../hooks/useGlobalReducer";  // Hook personalizado para acceder al estado global.

export const Demo = () => {
  // Acceder al estado global y la función dispatch usando el hook useGlobalReducer.
  const { store, dispatch } = useGlobalReducer()

  return (
    <div className="container">
      <ul className="list-group">
        {/* Mapear sobre el array 'todos' del store y renderizar cada item como un elemento de lista */}
        {store && store.todos?.map((item) => {
          return (
            <li
              key={item.id}  // React key para items de lista.
              className="list-group-item d-flex justify-content-between"
              style={{ background: item.background }}>

              {/* Enlace a la página de detalle de este todo. */}
              <Link to={"/single/" + item.id}>Enlace a: {item.title} </Link>

              <p>Abre el archivo ./store.js para ver el store global que contiene y actualiza la lista de colores</p>

              <button className="btn btn-warning"
                onClick={() => dispatch({
                  type: "add_task",
                  payload: { id: item.id, color: '#ffa500' }
                })}>
                Cambiar Color
              </button>
            </li>
          );
        })}
      </ul>
      <br />

      <Link to="/">
        <button className="btn btn-warning">Volver al inicio</button>
      </Link>
    </div>
  );
};
