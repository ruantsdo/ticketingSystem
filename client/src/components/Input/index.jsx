import { Input as NextInput } from "@nextui-org/react";

function Input({ children, ...props }) {
  const { className, ...restProps } = props;

  const baseClasses = `w-full rounded-2xl dark:border-darkNavBarBackground shadow`;
  const combinedClassName = className
    ? `${baseClasses} ${className}`
    : baseClasses;

  return (
    <NextInput className={combinedClassName} variant="bordered" {...restProps}>
      {children}
    </NextInput>
  );
}

export default Input;
