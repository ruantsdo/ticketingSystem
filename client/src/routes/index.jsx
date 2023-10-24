//React
import React from "react";

//Router-DOM
import { BrowserRouter, Routes, Route } from "react-router-dom"

//Pages
import LoginPage from "../pages/login";
import Home from "../pages/home"
import NewUserPage from "../pages/registerNewUser"

const AppRoutes = () => {

    return(
        <BrowserRouter>
            <Routes>
                <Route path="/" index element={<LoginPage />} />
                <Route path="/login" index element={<LoginPage />} />
                <Route path="/home" index element={<Home />} />
                <Route path="/newUser" index element={<NewUserPage />} />

                <Route path="*" element={<Home />} />
            </Routes>
        </BrowserRouter>
    )
}

export default AppRoutes