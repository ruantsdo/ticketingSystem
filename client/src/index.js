import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
//Providers
import NextProviders from "./providers/nextProviders";
import { ConfirmIdentityProvider } from "./providers/confirmIdentity";
//Contexts
import { AuthProvider } from "./contexts/auth";
//Components
import AuthModal from "./components/AuthModal";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <NextProviders>
      <AuthProvider>
        <ConfirmIdentityProvider>
          <App />
          <AuthModal />
        </ConfirmIdentityProvider>
      </AuthProvider>
    </NextProviders>
  </React.StrictMode>
);
