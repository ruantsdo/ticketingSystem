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
  TokenCallDefault,
  TokenCallAlternative,
  ServicesRegister,
  ServicesManagement,
  LocationRegister,
  LocationManagement,
  RedirectPage,
  Reports,
} from "./routes";

//Contexts
import { WebSocketProvider } from "../contexts/webSocket";

const AppRoutes = () => {
  return (
    <WebSocketProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/home" index element={<Home />} />
          <Route path="/newUser" element={<NewUserPage />} />
          <Route path="/user/management" element={<UserManagement />} />
          <Route path="/queueRegistration" element={<QueueRegistration />} />
          <Route path="/tokensList" element={<TokensList />} />
          <Route path="/tokenCall/default" element={<TokenCallDefault />} />
          <Route
            path="/tokenCall/alternative"
            element={<TokenCallAlternative />}
          />
          <Route path="/service/register" element={<ServicesRegister />} />
          <Route path="/service/management" element={<ServicesManagement />} />
          <Route path="/location/register" element={<LocationRegister />} />
          <Route path="/location/management" element={<LocationManagement />} />
          <Route path="/reports" element={<Reports />} />

          <Route path="*" element={<RedirectPage />} />
        </Routes>
      </BrowserRouter>
    </WebSocketProvider>
  );
};

export default AppRoutes;
