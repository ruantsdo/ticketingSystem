//Components
import { Notification } from "../";

function Container({ children, ...props }) {
  const { className, ...restProps } = props;
  const baseClasses = `flex flex-col pt-1 pb-1 w-full h-full max-h-fit bg-background dark:bg-darkBackground text-textColor dark:text-darkTextColor justify-center items-center transition-all overflow-hidden`;
  const combinedClassName = className
    ? `${baseClasses} ${className}`
    : baseClasses;

  return (
    <div className={combinedClassName} {...restProps}>
      <Notification />
      {children}
    </div>
  );
}

export default Container;
