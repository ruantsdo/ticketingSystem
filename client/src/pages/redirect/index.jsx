//React
import { useContext, useState, useEffect } from "react";

//Components
import { Container, Button, Divider } from "../../components";

//NextUi
import { Card, Link } from "@nextui-org/react";

//Contexts
import AuthContext from "../../contexts/auth";

//Router Dom
import { useNavigate } from "react-router-dom";

function RedirectPage() {
  const { currentUser } = useContext(AuthContext);
  const navigate = useNavigate();

  const [timeLeft, setTimeLeft] = useState(5);

  useEffect(() => {
    const intervalId = setInterval(() => {
      if (timeLeft > 0) {
        setTimeLeft(timeLeft - 1);
      } else {
        navigate(defineRoute());
      }
    }, 1000);

    return () => clearInterval(intervalId);
    // eslint-disable-next-line
  }, [timeLeft]);

  const defineRoute = () => {
    return currentUser.permission_level === 1 ? "/tokenCall/default" : "/home";
  };

  return (
    <Container className="h-screen">
      <Card className="flex flex-col items-center text-center w-[60%] gap-2 p-4">
        <h1 className="text-3xl">Erro 404</h1>
        <h1 className="text-5xl"> Página não encontrada</h1>
        <Divider />
        <span className="text-2xl">
          Parece que a página que você tentou acessar não existe ou não está
          disponível no momento!
        </span>

        <span className="text-md">
          Você será redirecionado automaticamente em {timeLeft} segundos...
        </span>
        <Divider />
        <Button as={Link} href={defineRoute()} mode="success">
          Voltar a navegação agora mesmo
        </Button>
      </Card>
    </Container>
  );
}

export default RedirectPage;
