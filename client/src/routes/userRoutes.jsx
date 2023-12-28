//React
import React from "react";

//Router-DOM
import { BrowserRouter, Routes, Route } from "react-router-dom";

//Pages
import {
  Home,
  NewUserPage,
  UserManagement,
  QueueRegistration,
  TokensList,
} from "./routes";

//Contexts
import { WebSocketProvider } from "../contexts/webSocket";

const UserRoutes = () => {
  return (
    <WebSocketProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/home" index element={<Home />} />
          <Route path="/newUser" element={<NewUserPage />} />
          <Route path="/user/management" element={<UserManagement />} />
          <Route path="/queueRegistration" element={<QueueRegistration />} />
          <Route path="/tokensList" element={<TokensList />} />

          <Route path="*" element={<Home />} />
        </Routes>
      </BrowserRouter>
    </WebSocketProvider>
  );
};

export default UserRoutes;
