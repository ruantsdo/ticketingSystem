// React
import { useState, useContext } from "react";

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
import ExitToAppIcon from "@mui/icons-material/ExitToApp";

//Router Dom
import { redirect } from "react-router-dom";

export default function NavBar() {
  const { setCurrentUser, currentUser } = useContext(AuthContext);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const logout = () => {
    localStorage.clear();
    setCurrentUser(null);
    redirect("/login");
    toast.warn("Você escolheu sair!");
  };

  return (
    <Navbar
      shouldHideOnScroll
      isBordered
      onMenuOpenChange={setIsMenuOpen}
      height={"3rem"}
      className="w-full bg-navBarBackground dark:bg-darkNavBarBackground"
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
        {currentUser.permission_level > 3 ? (
          <AdmShortcuts />
        ) : (
          <UserShortcuts />
        )}
      </NavbarContent>
      <NavbarContent justify="end">
        <NavbarItem justify="end">
          <ThemeSwitcher />
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
          startContent={<ExitToAppIcon />}
        >
          Sair
        </Button>
      </NavbarMenu>
    </Navbar>
  );
}
