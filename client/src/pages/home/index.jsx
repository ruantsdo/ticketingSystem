//React
import { useContext } from "react";

//Components
import { FullContainer } from "../../components/";

//Contexts
import AuthContext from "../../contexts/auth";

function Home() {
  const { currentUser } = useContext(AuthContext);

  return <FullContainer>Bem-Vindo(a) {currentUser.name}</FullContainer>;
}

export default Home;
