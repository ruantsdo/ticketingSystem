//React
import React, { useContext } from "react";

//Routes
// eslint-disable-next-line
import AuthRoutes from "./authRoutes";
import AppRoutes from "./appRoutes";

//Contexts
import AuthContext from "../contexts/auth";

//NextUi
import { CircularProgress } from "@nextui-org/react";

//Components
import Container from "../components/container";

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
    return <AppRoutes />;
  } else {
    return <AppRoutes />;
    //return <AuthRoutes />;
  }
};

export default Router;
