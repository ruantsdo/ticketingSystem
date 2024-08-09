// React
import { useState, useContext, useEffect } from "react";
//NextUi
import {
  Navbar,
  NavbarBrand,
  NavbarContent,
  NavbarItem,
  Link,
  NavbarMenuToggle,
  NavbarMenu,
  NavbarMenuItem,
  Button,
  Tooltip,
} from "@nextui-org/react";
//Components
import { ThemeSwitcher } from "../";
import AdmShortcuts from "./components/admShortcuts";
import UserShortcuts from "./components/userShortcuts";
//Models
import menuItems from "./models/items";
//Contexts
import AuthContext from "../../contexts/auth";
//Toast
import { toast } from "react-toastify";
//Icons
import LogoutIcon from "@mui/icons-material/Logout";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
//Contexts
import { useWebSocket } from "../../contexts/webSocket";

export default function NavBar() {
  const { socket } = useWebSocket();
  const { wipeUserData, disconnectUser, currentUser } = useContext(AuthContext);

  const [isMenuOpen, setIsMenuOpen] = useState(false);

  function displayableName() {
    const fullName = currentUser.name.split(" ");

    if (fullName.length === 1) return fullName[0];

    if (fullName.length > 1) {
      const primeiroNome = fullName[0];
      const ultimoNome = fullName[fullName.length - 1];

      const visibleName = primeiroNome + " " + ultimoNome;

      return visibleName;
    } else {
      return "Usuário";
    }
  }

  const defineLevel = () => {
    if (currentUser.permission_level === 1) return "TELA";
    if (currentUser.permission_level === 2) return "FUNCIONÁRIO";
    if (currentUser.permission_level === 3) return "COORDENADOR";
    if (currentUser.permission_level === 4) return "ADMINISTRADOR";
    if (currentUser.permission_level === 5) return "MASTER";
  };

  const logout = () => {
    toast.warn("Você escolheu sair!");
    wipeUserData();
  };

  useEffect(() => {
    socket.on("disconnectUser", (id) => {
      disconnectUser(id);
    });

    socket.on("disconnectAllUsers", () => {
      toast.warn("Você foi desconectado pelo administrador...");
      wipeUserData();
    });

    return () => {
      socket.off("disconnectUser");
      socket.off("disconnectAllUsers");
    };
    // eslint-disable-next-line
  }, []);

  return (
    <Navbar
      shouldHideOnScroll
      isBordered
      onMenuOpenChange={setIsMenuOpen}
      maxWidth="full"
      height="3rem"
      className="bg-navBarBackground dark:bg-darkNavBarBackground items-center justify-evenly"
    >
      <NavbarContent justify="start">
        <NavbarMenuToggle
          aria-label={isMenuOpen ? "Close menu" : "Open menu"}
        />
        <NavbarBrand className="gap-1">
          <AccountCircleIcon fontSize="large" />
          <div className="flex flex-col justify-center min-h-full">
            <div className="text-[1.5rem] text-white">{displayableName()}</div>
            <div className="text-[0.5rem] dark:text-gray-400">
              {defineLevel()}
            </div>
          </div>
        </NavbarBrand>
      </NavbarContent>
      <NavbarContent justify="center" className="hidden sm:flex gap-3">
        {currentUser.permission_level > 3 ? (
          <AdmShortcuts />
        ) : (
          <UserShortcuts />
        )}
      </NavbarContent>
      <NavbarContent justify="end">
        <NavbarItem className="flex gap-5">
          <ThemeSwitcher />
          <Tooltip content="Sair do sistema">
            <Button
              isIconOnly
              onClick={() => logout()}
              className="flex rounded-md items-center justify-center hover:scale-105 bg-transparent"
              startContent={
                <LogoutIcon className="text-failed dark:text-darkFailed" />
              }
            />
          </Tooltip>
        </NavbarItem>
      </NavbarContent>
      <NavbarMenu className="w-screen sm:w-[40%] max-h-unit-8xl rounded-br-lg bg-background dark:bg-darkBackground shadow-xl ring-white border-r-1 border-b-1 border-darkBackground dark:border-background">
        {menuItems.map((item, index) =>
          currentUser.permission_level >= item.level ? (
            <NavbarMenuItem
              key={`${item}-${index}`}
              className="hover:cursor-pointer hover:scale-95 transition-all"
            >
              <Link
                color={item.color}
                href={item.address}
                className="w-full"
                size="lg"
              >
                {item.name}
              </Link>
            </NavbarMenuItem>
          ) : null
        )}
        <Button
          onClick={() => logout()}
          className="flex bg-failed dark:bg-darkFailed w-2/6 rounded-md text-lg items-center justify-center hover:scale-105"
          startContent={<LogoutIcon />}
        >
          Sair
        </Button>
      </NavbarMenu>
    </Navbar>
  );
}
