//NextUI
import { Card as NextCard, CardBody as NextCardBody } from "@nextui-org/react";

function Card({ children, ...props }) {
  const { className, ...restProps } = props;

  const baseClasses = `flex bg-cardBackground dark:darkBackground sm:w-[50%] w-[95%] transition-all`;
  const combinedClassName = className
    ? `${baseClasses} ${className}`
    : baseClasses;

  return (
    <NextCard
      isBlurred
      shadow="md"
      className={combinedClassName}
      {...restProps}
    >
      <NextCardBody className="flex gap-3 justify-center items-center">
        {children}
      </NextCardBody>
    </NextCard>
  );
}

export default Card;
