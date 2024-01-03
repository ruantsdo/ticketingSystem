//React
import { useContext } from "react";

//Components
import { Container, AdmShortcuts, UserShortcuts } from "./components";

//Contexts
import AuthContext from "../../contexts/auth";

function Home() {
  const { currentUser } = useContext(AuthContext);

  return (
    <Container>
      <div className="p-4">
        <div className="mb-4">
          <h1 className="text-4xl">Olá, {currentUser.name}</h1>
        </div>
        <div className="mb-4">
          <h3 className="text-2xl mb-2">Atalhos</h3>
          <div className="flex flex-row gap-2">
            {currentUser.permission_level > 3 ? (
              <AdmShortcuts />
            ) : (
              <UserShortcuts />
            )}
          </div>
        </div>
        <div>Another Div</div>
      </div>
    </Container>
  );
}

export default Home;
