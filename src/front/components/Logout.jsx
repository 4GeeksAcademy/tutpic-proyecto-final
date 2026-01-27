import React from "react";
import { useNavigate } from "react-router-dom";

const Logout = () => {
  const navigate = useNavigate();

  const handlerLogout = () => {
    if (window.confirm("¿Seguro que quieres cerrar sesión?")) {
      localStorage.removeItem("access_token");
      navigate("/", { state: { message: "Sesión terminada correctamente ✅" } });
    }
  };

  return (
    <button className="btn btn-outline-danger" onClick={handlerLogout}>
      Logout
    </button>
  );
};

export default Logout;