//React
import { useEffect, useState } from "react";
//Components
import { ThemeSwitcher, Container } from "../../components";
import LoginForm from "./components/loginForm";
import RegisterForm from "./components/registerForm";
//Stores & Utils
import useServicesStore from "../../stores/servicesStore/store";
import useUsersUtils from "../../stores/usersStore/utils";

function LoginPage() {
  const { getAllServices } = useServicesStore();
  const { filterPermissionLevels } = useUsersUtils();

  const [services, setServices] = useState([]);
  const [permissions, setPermissions] = useState([]);

  const [registerMode, setRegisterMode] = useState(false);

  const changeMode = async () => {
    setRegisterMode(!registerMode);
  };

  const getInitialData = async () => {
    const [services, permissions] = await Promise.all([
      getAllServices(),
      filterPermissionLevels(),
    ]);

    setServices(services);
    setPermissions(permissions);
  };

  useEffect(() => {
    getInitialData();

    //eslint-disable-next-line
  }, []);

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
