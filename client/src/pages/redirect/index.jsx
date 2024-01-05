//React
import { useContext } from "react";

//Components
import { Container, Button, Divider } from "../../components";

//NextUi
import { Card, Link } from "@nextui-org/react";

//Contexts
import AuthContext from "../../contexts/auth";

function RedirectPage() {
  const { currentUser } = useContext(AuthContext);

  return (
    <Container>
      <Card className="flex flex-col items-center text-center w-[60%] gap-2 p-4">
        <h1 className="text-5xl"> Página não encontrada</h1>
        <h1 className="text-3xl">Erro 404</h1>
        <Divider />
        <h2 className="text-2xl">
          Parece que a página que você tentou acessar não existe ou não está
          disponível no momento!
        </h2>
        <Divider />
        <Button
          as={Link}
          href={
            currentUser.permission_level === 1 ? "/tokenCall/default" : "/home"
          }
          mode="success"
        >
          Voltar a navegação
        </Button>
      </Card>
    </Container>
  );
}

export default RedirectPage;
