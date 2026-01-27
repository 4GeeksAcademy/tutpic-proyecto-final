import { createBrowserRouter } from "react-router-dom";
import { Layout } from "./pages/Layout.jsx";
import { Home } from "./pages/Home.jsx";
import { Single } from "./pages/Single.jsx";
import { Demo } from "./pages/Demo.jsx";
import Register from "./pages/Register.jsx";
import Login from "./pages/Login.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import Signup from "./pages/Signup.jsx";
import ResetPassword from "./pages/ResetPassword.jsx";
import { BlogHome } from "./pages/BlogHome.jsx";
import { BlogArticulos } from "./pages/BlogArticulos.jsx";
import { BlogArticulo } from "./pages/BlogArticulo.jsx";
import { TiendaProductos } from "./pages/TiendaProductos.jsx";
import { TiendaCarrito } from "./pages/TiendaCarrito.jsx";
import { TiendaCheckout } from "./pages/TiendaCheckout.jsx";
import { TiendaOrdenes } from "./pages/TiendaOrdenes.jsx";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    errorElement: <h1>Not found!</h1>,
    children: [
      { index: true, element: <Home /> },
      { path: "home", element: <Home /> },
      { path: "signup", element: <Signup /> },
      { path: "register", element: <Register /> },
      { path: "login", element: <Login /> },
      { path: "reset-password", element: <ResetPassword /> },
      { path: "dashboard", element: <Dashboard /> },
      { path: "single/:theId", element: <Single /> },
      { path: "demo", element: <Demo /> },
      { path: "blog", element: <BlogHome /> },
      { path: "blog/articulos", element: <BlogArticulos /> },
      { path: "blog/articulo/:id", element: <BlogArticulo /> },
      { path: "tienda", element: <TiendaProductos /> },
      { path: "tienda/carrito", element: <TiendaCarrito /> },
      { path: "tienda/checkout/:ordenId", element: <TiendaCheckout /> },
      { path: "tienda/ordenes", element: <TiendaOrdenes /> },
    ],
  },
]);