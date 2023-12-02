//React
import { useEffect, useState } from "react";

//NextUI
import { Button as NextButton } from "@nextui-org/react";

function Button({ children, ...props }) {
  const { className, ...restProps } = props;
  const [background, setBackground] = useState("");

  useEffect(() => {
    if (props.mode === "success") {
      setBackground("bg-success dark:bg-darkSuccess");
    } else if (props.mode === "failed") {
      setBackground("bg-failed dark:bg-darkFailed");
    } else {
      setBackground("");
    }
  }, [props.mode]);

  const baseClasses = `flex ${background} w-[40%] hover:scale-105 hover:shadow transition-all`;
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
