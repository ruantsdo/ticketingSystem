import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";

//Providers
import NextProviders from "./providers/nextProviders";

//Contexts
import { AuthProvider } from "./contexts/auth";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <NextProviders>
      <AuthProvider>
        <App />
      </AuthProvider>
    </NextProviders>
  </React.StrictMode>
);
