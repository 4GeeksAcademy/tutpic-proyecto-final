import React from "react";

export const Footer = () => (
  <footer className="footer mt-auto py-3 text-center">
    <p>
      Check the{" "}
      <a
        target="_blank"
        rel="noopener noreferrer"
        href="https://4geeks.com/docs/start/react-flask-template"
      >
        template documentation
      </a>{" "}
      <i className="fa-solid fa-file" aria-hidden="true"></i> for help.
    </p>
    <p>
      Made with{" "}
      <i className="fa-solid fa-heart text-danger" aria-hidden="true"></i> by{" "}
      <a href="https://github.com/Effractarius">Effractarius</a>
    </p>
  </footer>
);