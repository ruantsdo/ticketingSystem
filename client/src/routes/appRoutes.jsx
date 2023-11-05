//React
import React from "react";

//Router-DOM
import { BrowserRouter, Routes, Route } from "react-router-dom";

//Pages
import Home from "../pages/home";
import NewUserPage from "../pages/registerNewUser";
import QueueRegistration from "../pages/queue/register";
import TokensList from "../pages/tokenlist";

const AppRoutes = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/home" index element={<Home />} />
        <Route path="/newUser" index element={<NewUserPage />} />
        <Route path="/queueRegistration" element={<QueueRegistration />} />
        <Route path="/tokensList" element={<TokensList />} />

        <Route path="*" element={<Home />} />
      </Routes>
    </BrowserRouter>
  );
};

export default AppRoutes;
