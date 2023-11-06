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
          //className="sm:hidden"
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

      <NavbarContent className="hidden sm:flex gap-4" justify="center">
        <NavbarItem>
          <Link color="foreground" href="/queueRegistration">
            Criar nova ficha
          </Link>
        </NavbarItem>
        <NavbarItem>
          <Link href="/newUser" color="foreground" aria-current="page">
            Novo usuário
          </Link>
        </NavbarItem>
        <NavbarItem>
          <Link color="foreground" href="/tokensList">
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
            className="hover:cursor-pointer"
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
        <Button onClick={() => logout()} className="bg-failed w-3/6">
          Sair
        </Button>
      </NavbarMenu>
    </Navbar>
  );
}
