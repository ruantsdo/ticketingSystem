//React
import React from "react";

//NextUI
import { Button as NextButton } from "@nextui-org/react";

function Button({ children, ...props }) {
  const { className, ...restProps } = props;
  const baseClasses = `flex hover:scale-105 hover:shadow transition-all`;
  const combinedClassName = className
    ? `${baseClasses} ${className}`
    : baseClasses;

  return (
    <NextButton className={combinedClassName} {...restProps}>
      {children}
    </NextButton>
  );
}

export default Button;
