import { Button, Link, Tooltip } from "@nextui-org/react";

function RedirectButton({ children, ...props }) {
  const { address, isIconOnly, label } = props;

  const defaultStyle = `flex flex-row justify-center items-center gap-1 w-48 h-20
  rounded-lg bg-darkBackground dark:bg-background text-darkTextColor dark:text-textColor
  shadow-lg hover:scale-105 hover:cursor-pointer transition-all`;

  const iconOnlyStyle = `flex flex-row justify-center items-center bg-darkBackground dark:bg-background text-darkTextColor dark:text-textColor hover:scale-105 hover:cursor-pointer transition-all`;

  return (
    <Tooltip content={label} isDisabled={label ? false : true}>
      <Button
        as={Link}
        isIconOnly={isIconOnly}
        className={isIconOnly ? iconOnlyStyle : defaultStyle}
        href={address}
        alt={label}
      >
        {children}
      </Button>
    </Tooltip>
  );
}

export default RedirectButton;
