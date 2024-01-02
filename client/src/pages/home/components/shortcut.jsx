import { Button, Link } from "@nextui-org/react";

function ShortcutButton({ children, ...props }) {
  const defaultStyle = `flex flex-row justify-center items-center gap-1 w-48 h-20
  rounded-lg bg-darkBackground dark:bg-background text-darkTextColor dark:text-textColor
  shadow-lg hover:scale-105 hover:cursor-pointer transition-all`;

  return (
    <Button as={Link} className={defaultStyle} href={props?.address}>
      {children}
    </Button>
  );
}

export default ShortcutButton;
