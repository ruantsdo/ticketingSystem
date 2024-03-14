//React
import React from "react";

//Router-DOM
import { BrowserRouter, Routes, Route } from "react-router-dom";

//Pages
import { LoginPage } from "./routes";

const AuthRoutes = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" index element={<LoginPage />} />

        <Route path="*" element={<LoginPage />} />
      </Routes>
    </BrowserRouter>
  );
};

export default AuthRoutes;
