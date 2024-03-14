//React
import React from "react";

//Router-DOM
import { BrowserRouter, Routes, Route } from "react-router-dom";

//Pages
import { Home, QueueRegistration, TokensList, RedirectPage } from "./routes";

//Contexts
import { WebSocketProvider } from "../contexts/webSocket";

const UserRoutes = () => {
  return (
    <WebSocketProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/home" index element={<Home />} />
          <Route path="/queueRegistration" element={<QueueRegistration />} />
          <Route path="/tokensList" element={<TokensList />} />

          <Route path="*" element={<RedirectPage />} />
        </Routes>
      </BrowserRouter>
    </WebSocketProvider>
  );
};

export default UserRoutes;
