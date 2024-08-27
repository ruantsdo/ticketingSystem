//React
import React from "react";

//Router-DOM
import { BrowserRouter, Routes, Route } from "react-router-dom";

//Pages
import { LoginPage } from "./routes";
import { WebSocketProvider } from "../contexts/webSocket";

const AuthRoutes = () => {
  return (
    <BrowserRouter>
      <WebSocketProvider>
        <Routes>
          <Route index path="/login" element={<LoginPage />} />

          <Route path="*" element={<LoginPage />} />
        </Routes>
      </WebSocketProvider>
    </BrowserRouter>
  );
};

export default AuthRoutes;
