import { NavbarItem, Link } from "@nextui-org/react";

function UserShortcuts() {
  return (
    <>
      <NavbarItem>
        <Link
          color="foreground"
          href="/queueRegistration"
          className="hover:underline"
        >
          Nova senha
        </Link>
      </NavbarItem>
      <NavbarItem>
        <Link
          href="/tokensList"
          color="foreground"
          aria-current="page"
          className="hover:underline"
        >
          Lista de senhas
        </Link>
      </NavbarItem>
    </>
  );
}

export default UserShortcuts;
