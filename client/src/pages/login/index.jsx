//React
import { useEffect, useState } from "react";
//Components
import { ThemeSwitcher, Container } from "../../components";
import LoginForm from "./components/loginForm";
import RegisterForm from "./components/registerForm";
//Stores & Utils
import useServicesStore from "../../stores/servicesStore/store";
import useUsersUtils from "../../stores/usersStore/utils";
import useSettingsStore from "../../stores/settingsStore/store";
//Contexts
import { useWebSocket } from "../../contexts/webSocket";

function LoginPage() {
  const { getActiveServices } = useServicesStore();
  const { filterPermissionLevels } = useUsersUtils();
  const { getFullSettings } = useSettingsStore();

  const { socket } = useWebSocket();

  const [services, setServices] = useState([]);
  const [permissions, setPermissions] = useState([]);
  const [settings, setSettings] = useState([]);

  const [registerMode, setRegisterMode] = useState(false);

  const changeMode = async () => {
    setRegisterMode(!registerMode);
  };

  const getInitialData = async () => {
    const [services, permissions, settings] = await Promise.all([
      getActiveServices(),
      filterPermissionLevels(),
      getFullSettings(),
    ]);

    setServices(services);
    setPermissions(permissions);
    setSettings(settings);
  };

  const handleGetSettings = async () => {
    const response = await getFullSettings();
    setSettings(response);
  };

  useEffect(() => {
    getInitialData();
    //eslint-disable-next-line
  }, []);

  useEffect(() => {
    socket.on("services_updated", () => {
      getInitialData();
    });

    socket.on("settings_update", () => {
      handleGetSettings();
    });

    return () => {
      socket.off("services_updated");
      socket.off("settings_update");
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
          registerForm={settings.registerForm}
          autoAprove={settings.autoAprove}
        />
      ) : (
        <LoginForm
          changeMode={changeMode}
          registerForm={settings.registerForm}
          canLogin={settings.canLogin}
        />
      )}
    </Container>
  );
}

export default LoginPage;
