import { Divider as NextDivider } from "@nextui-org/react";

function Divider({ children, ...props }) {
  const { className, ...restProps } = props;

  const baseClasses = `bg-divider dark:bg-darkDivider transition-all`;
  const combinedClassName = className
    ? `${baseClasses} ${className}`
    : baseClasses;

  return (
    <NextDivider className={combinedClassName} {...restProps}>
      {children}
    </NextDivider>
  );
}

export default Divider;
