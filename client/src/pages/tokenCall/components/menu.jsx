//React
import React, { useContext } from "react";

//Contexts
import AuthContext from "../../../contexts/auth";

//RouterDom
import { redirect } from "react-router-dom";

//NextUi
import {
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  Button,
  DropdownSection,
} from "@nextui-org/react";
import { useTheme } from "next-themes";

//Components
import ThemeSwitcher from "../../../components/themeSwitch";

//Icons
import SettingsIcon from "@mui/icons-material/Settings";
import DashboardIcon from "@mui/icons-material/Dashboard";
import ViewComfyIcon from "@mui/icons-material/ViewComfy";
import ExitToAppIcon from "@mui/icons-material/ExitToApp";

//Toast
import { toast } from "react-toastify";

export default function Menu({ ...props }) {
  const { theme, setTheme } = useTheme();
  const { setCurrentUser } = useContext(AuthContext);

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
        <DropdownSection>
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
            onPress={() => {
              redirect("/tokenCall/default");
            }}
          >
            Layout Padrão
          </DropdownItem>
          <DropdownItem
            key="alternative"
            startContent={<ViewComfyIcon />}
            onPress={() => redirect("/tokenCall/alternative")}
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
