//React
import React, { useContext } from "react";

//Components
import FullContainer from "../../components/fullContainer";

//NextUI
import {} from "@nextui-org/react";

//Contexts
import AuthContext from "../../contexts/auth";

function Home() {
  const { currentUser } = useContext(AuthContext);

  return <FullContainer>Bem-Vindo(a) {currentUser.name}</FullContainer>;
}

export default Home;
