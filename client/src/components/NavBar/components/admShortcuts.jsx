import { NavbarItem, Link } from "@nextui-org/react";

function AdmShortcuts() {
  return (
    <>
      <NavbarItem>
        <Link
          color="foreground"
          href="/user/management"
          className="hover:underline"
        >
          Gerenciar Usuários
        </Link>
      </NavbarItem>
      <NavbarItem>
        <Link
          href="/service/management"
          color="foreground"
          aria-current="page"
          className="hover:underline"
        >
          Gerenciar Serviços
        </Link>
      </NavbarItem>
      <NavbarItem>
        <Link
          color="foreground"
          href="/location/management"
          className="hover:underline"
        >
          Gerenciar Locais
        </Link>
      </NavbarItem>
    </>
  );
}

export default AdmShortcuts;
