//React
import { useContext, useEffect, useState } from "react";

//Contexts
import AuthContext from "../../../contexts/auth";

//NextUi
import {
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  DropdownSection,
  Link,
  Button,
} from "@nextui-org/react";

//Components
import { ThemeSwitcher } from "../../../components/";

//Icons
import SettingsIcon from "@mui/icons-material/Settings";
import DashboardIcon from "@mui/icons-material/Dashboard";
import ViewComfyIcon from "@mui/icons-material/ViewComfy";
import ExitToAppIcon from "@mui/icons-material/ExitToApp";
import HomeIcon from "@mui/icons-material/Home";

//Toast
import { toast } from "react-toastify";

export default function Menu({ ...props }) {
  const currentTheme = JSON.parse(localStorage.getItem("currentTheme"));
  if (!currentTheme) {
    localStorage.setItem("currentTheme", JSON.stringify("light"));
  }

  const [theme, setTheme] = useState(currentTheme);
  const { currentUser, setCurrentUser } = useContext(AuthContext);

  useEffect(() => {
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
      localStorage.setItem("currentTheme", JSON.stringify("dark"));
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("currentTheme", JSON.stringify("light"));
    }
  }, [theme]);

  const logout = () => {
    toast.warn("Você escolheu sair!");
    localStorage.clear();
    setCurrentUser(null);
  };

  return (
    <Dropdown backdrop="opaque">
      <DropdownTrigger className={props.className}>
        <Button isIconOnly variant="bordered" aria-label="Open Menu">
          <SettingsIcon />
        </Button>
      </DropdownTrigger>
      <DropdownMenu variant="faded" aria-label="Dropdown menu with icons">
        {currentUser.permission_level > 1 ? (
          <DropdownSection>
            <DropdownItem
              key="home"
              startContent={<HomeIcon />}
              as={Link}
              href="/home"
              showDivider
            >
              Ir para a Home
            </DropdownItem>
          </DropdownSection>
        ) : null}
        <DropdownSection showDivider>
          <DropdownItem
            key="theme"
            onPress={() => setTheme(theme === "light" ? "dark" : "light")}
            startContent={<ThemeSwitcher />}
          >
            Alterar Tema
          </DropdownItem>
          <DropdownItem
            key="default"
            startContent={<DashboardIcon />}
            as={Link}
            href="/tokenCall/default"
          >
            Layout Padrão
          </DropdownItem>
          <DropdownItem
            key="alternative"
            startContent={<ViewComfyIcon />}
            as={Link}
            href="/tokenCall/alternative"
          >
            Layout Alternativo
          </DropdownItem>
        </DropdownSection>
        <DropdownSection>
          <DropdownItem
            key="exit"
            className="text-danger"
            color="danger"
            startContent={<ExitToAppIcon />}
            onPress={() => {
              logout();
            }}
          >
            Sair
          </DropdownItem>
        </DropdownSection>
      </DropdownMenu>
    </Dropdown>
  );
}
