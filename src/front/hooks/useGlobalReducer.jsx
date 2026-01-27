// Importar hooks y funciones necesarias de React.
import { useContext, useReducer, createContext } from "react";
import storeReducer, { initialStore } from "../store"  // Importar el reducer y el estado inicial.

// Crear un contexto para mantener el estado global de la aplicación
// Llamaremos a este estado global "store" para evitar confusión al usar estados locales
const StoreContext = createContext()

// Definir un componente proveedor que encapsula el store y lo envuelve en un context provider para
// transmitir la información a través de todas las páginas y componentes de la app.
export function StoreProvider({ children }) {
    // Inicializar el reducer con el estado inicial.
    const [store, dispatch] = useReducer(storeReducer, initialStore())
    // Proporcionar el store y el método dispatch a todos los componentes hijos.
    return <StoreContext.Provider value={{ store, dispatch }}>
        {children}
    </StoreContext.Provider>
}

// Hook personalizado para acceder al estado global y la función dispatch.
export default function useGlobalReducer() {
    const { dispatch, store } = useContext(StoreContext)
    return { dispatch, store };
}