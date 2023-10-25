//React
import React, { useContext } from "react";

//Routes
import AuthRoutes from "./authRoutes";
import AppRoutes from "./appRoutes";

//Contexts
import AuthContext from "../contexts/auth";

const Router = () => {
  const { currentUser } = useContext(AuthContext);

  if (currentUser) {
    return <AppRoutes />;
  } else {
    return <AuthRoutes />;
  }
};

export default Router;
