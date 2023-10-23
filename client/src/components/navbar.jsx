// React
import React from "react";

//NextUi
import {Navbar, NavbarBrand, NavbarContent, NavbarItem, Link, NavbarMenuToggle, NavbarMenu, NavbarMenuItem} from "@nextui-org/react";

//Components
import ThemeSwitcher from "../components/themeSwitch"

export default function NavBar() {
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);

  const menuItems = [
    "Gerenciar usuários",
    "Gerenciar serviços",
    "Gerenciar setores",
    "Adicionar uma nova senha",
    "Senhas",
    "Serviços",
    "Sair",
  ];

  return (
    <Navbar isBordered onMenuOpenChange={setIsMenuOpen} height={'3rem'} className="w-screen bg-light-navBarBackground dark:bg-dark-navBarBackground">
      <NavbarContent>
        <NavbarMenuToggle
          aria-label={isMenuOpen ? "Close menu" : "Open menu"}
          className="sm:hidden"
        />
        <NavbarBrand>
          <p className="font-bold text-inherit">SISTEMA DE SENHAS</p>
        </NavbarBrand>
      </NavbarContent>

      <NavbarContent className="hidden sm:flex gap-4" justify="center">
        <NavbarItem>
          <Link color="foreground" href="#">
            Senhas
          </Link>
        </NavbarItem>
        <NavbarItem isActive>
          <Link href="#" aria-current="page">
            Gerência
          </Link>
        </NavbarItem>
        <NavbarItem>
          <Link color="foreground" href="#">
            Serviços
          </Link>
        </NavbarItem>
      </NavbarContent>
      <NavbarContent justify="end">
        <NavbarItem justify="end">
          <ThemeSwitcher />
        </NavbarItem>
      </NavbarContent>
      <NavbarMenu className="w-screen">
        {menuItems.map((item, index) => (
          <NavbarMenuItem key={`${item}-${index}`}>
            <Link
              color={
                index === 2 ? "primary" : index === menuItems.length - 1 ? "danger" : "foreground"
              }
              className="w-full"
              href="#"
              size="lg"
            >
              {item}
            </Link>
          </NavbarMenuItem>
        ))}
      </NavbarMenu>
    </Navbar>
  );
}
