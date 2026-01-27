import React, { Component } from "react";
import envFile from "../../../docs/assets/env-file.png"

const Dark = ({children}) => <span className="bg-dark text-white px-1 rounded">{children}</span>;
export const BackendURL = () => (
	<div className="mt-5 pt-5 w-50 mx-auto">
		<h2>Falta la variable de entorno BACKEND_URL</h2>
		<p>Aquí hay un video tutorial sobre <a target="_blank" href="https://www.awesomescreenshot.com/video/16498567?key=72dbf905fe4fa6d3224783d02a8b1b9c">cómo actualizar tu variable de entorno de URL del backend.</a></p>
		<p>Hay un archivo llamado <Dark>.env</Dark> que contiene las variables de entorno para tu proyecto.</p>
		<p>Hay una variable llamada <Dark>BACKEND_URL</Dark> que necesita ser configurada manualmente por ti.</p>
		<ol>
			<li>Asegúrate de que tu backend esté corriendo en el puerto 3001.</li>
			<li>Abre tu API y copia el host de la API.</li>
			<li>Abre el archivo .env (no abras el .env.example)</li>
			<li>Agrega una nueva variable VITE_BACKEND_URL=<Dark>tu host de api</Dark></li>
			<li>Reemplaza <Dark>tu host de api</Dark> con la URL pública de tu servidor backend de Flask corriendo en el puerto 3001</li>
		</ol>
		<div className="w-100">
		<img src={envFile} className="w-100"/>
		</div>
		<p>Nota: Si estás publicando tu sitio web en Heroku, Render.com o cualquier otro hosting, probablemente necesites seguir otros pasos.</p>
	</div>
);