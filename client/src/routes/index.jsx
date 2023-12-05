//React
import React, { useContext } from "react";

//Routes
import AuthRoutes from "./authRoutes";
import AppRoutes from "./appRoutes";
import ScreenRoutes from "./screenRoutes";

//Contexts
import AuthContext from "../contexts/auth";

//NextUi
import { CircularProgress } from "@nextui-org/react";

//Components
import { Container } from "../components";

const Router = () => {
  const { currentUser, isLoading } = useContext(AuthContext);

  if (isLoading) {
    return (
      <Container>
        <CircularProgress
          size="lg"
          color="warning"
          aria-label="Carregando..."
          label="Carregando..."
        />
      </Container>
    );
  }

  if (currentUser) {
    if (currentUser.permission_level === 1) {
      return <ScreenRoutes />;
    } else if (currentUser.permission_level > 1) {
      return <AppRoutes />;
    }
  } else {
    return <AuthRoutes />;
  }
};

export default Router;
