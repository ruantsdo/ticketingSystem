// React
import React, { useState, useContext } from "react";

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
} from "@nextui-org/react";

//Components
import ThemeSwitcher from "../components/themeSwitch";

//Models
import menuItems from "./models/navbarItems";

//Contexts
import AuthContext from "../contexts/auth";

//Toast
import { toast } from "react-toastify";

//Icons
import ExitToAppIcon from "@mui/icons-material/ExitToApp";

export default function NavBar() {
  const { setCurrentUser } = useContext(AuthContext);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const logout = () => {
    toast.warn("Você escolheu sair!");
    localStorage.clear();
    setCurrentUser(null);
  };

  return (
    <Navbar
      shouldHideOnScroll
      isBordered
      onMenuOpenChange={setIsMenuOpen}
      height={"3rem"}
      className="w-full bg-navBarBackground"
    >
      <NavbarContent>
        <NavbarMenuToggle
          aria-label={isMenuOpen ? "Close menu" : "Open menu"}
        />
        <NavbarBrand>
          <Link
            color="foreground"
            href="/home"
            className="font-bold text-inherit"
          >
            SISTEMA DE SENHAS
          </Link>
        </NavbarBrand>
      </NavbarContent>

      <NavbarContent className="hidden sm:flex gap-3" justify="center">
        <NavbarItem>
          <Link
            color="foreground"
            href="/queueRegistration"
            className="hover:underline"
          >
            Nova ficha
          </Link>
        </NavbarItem>
        <NavbarItem>
          <Link
            href="/newUser"
            color="foreground"
            aria-current="page"
            className="hover:underline"
          >
            Novo usuário
          </Link>
        </NavbarItem>
        <NavbarItem>
          <Link
            color="foreground"
            href="/tokensList"
            className="hover:underline"
          >
            Lista de Fichas
          </Link>
        </NavbarItem>
      </NavbarContent>
      <NavbarContent justify="end">
        <NavbarItem justify="end">
          <ThemeSwitcher />
        </NavbarItem>
      </NavbarContent>
      <NavbarMenu className="w-screen bg-containerBackground opacity-90">
        {menuItems.map((item, index) => (
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
        ))}
        <Button
          onClick={() => logout()}
          className="flex bg-failed w-1/6 rounded-md text-lg items-center justify-center hover:scale-105"
          startContent={<ExitToAppIcon />}
        >
          Sair
        </Button>
      </NavbarMenu>
    </Navbar>
  );
}
