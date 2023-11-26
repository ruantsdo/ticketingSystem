//React
import React from "react";

//Router-DOM
import { BrowserRouter, Routes, Route } from "react-router-dom";

//Pages
import Home from "../pages/home";
import NewUserPage from "../pages/registerNewUser";
import QueueRegistration from "../pages/queue/register";
import TokensList from "../pages/tokenlist";
import TokenCallDefault from "../pages/tokenCall/default";
import TokenCallAlternative from "../pages/tokenCall/alternative";
import ServicesRegister from "../pages/services";
import LocationRegister from "../pages/locations";

//Contexts
import { WebSocketProvider } from "../contexts/webSocket";

const AppRoutes = () => {
  return (
    <WebSocketProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/home" index element={<Home />} />
          <Route path="/newUser" element={<NewUserPage />} />
          <Route path="/queueRegistration" element={<QueueRegistration />} />
          <Route path="/tokensList" element={<TokensList />} />
          <Route path="/tokenCall/default" element={<TokenCallDefault />} />
          <Route
            path="/tokenCall/alternative"
            element={<TokenCallAlternative />}
          />
          <Route path="/service/register" element={<ServicesRegister />} />
          <Route path="/location/register" element={<LocationRegister />} />

          <Route path="*" element={<Home />} />
        </Routes>
      </BrowserRouter>
    </WebSocketProvider>
  );
};

export default AppRoutes;
