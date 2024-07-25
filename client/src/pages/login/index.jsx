//React
import { useEffect, useState } from "react";
//Components
import { ThemeSwitcher, Container } from "../../components";
import LoginForm from "./components/loginForm";
import RegisterForm from "./components/registerForm";
//Stores & Utils
import useServicesStore from "../../stores/servicesStore/store";
import useUsersUtils from "../../stores/usersStore/utils";
//Contexts
import { useWebSocket } from "../../contexts/webSocket";

function LoginPage() {
  const { getActiveServices } = useServicesStore();
  const { filterPermissionLevels } = useUsersUtils();

  const { socket } = useWebSocket();

  const [services, setServices] = useState([]);
  const [permissions, setPermissions] = useState([]);

  const [registerMode, setRegisterMode] = useState(false);

  const changeMode = async () => {
    setRegisterMode(!registerMode);
  };

  const getInitialData = async () => {
    const [services, permissions] = await Promise.all([
      getActiveServices(),
      filterPermissionLevels(),
    ]);

    setServices(services);
    setPermissions(permissions);
  };

  useEffect(() => {
    getInitialData();
    //eslint-disable-next-line
  }, []);

  useEffect(() => {
    socket.on("services_updated", () => {
      getInitialData();
    });

    return () => {
      socket.off("services_updated");
    };
  });

  return (
    <Container className="h-screen bg-login-background bg-cover">
      <ThemeSwitcher className="absolute top-5 right-3 z-50" />
      {registerMode ? (
        <RegisterForm
          services={services}
          permissions={permissions}
          changeMode={changeMode}
        />
      ) : (
        <LoginForm changeMode={changeMode} />
      )}
    </Container>
  );
}

export default LoginPage;
