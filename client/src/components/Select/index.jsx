import { Select as NextSelect } from "@nextui-org/react";

function Select({ children, ...props }) {
  const { className, ...restProps } = props;

  const baseClasses = `w-full rounded-2xl dark:border-darkNavBarBackground shadow`;
  const combinedClassName = className
    ? `${baseClasses} ${className}`
    : baseClasses;

  return (
    <NextSelect className={combinedClassName} variant="bordered" {...restProps}>
      {children}
    </NextSelect>
  );
}

export default Select;
