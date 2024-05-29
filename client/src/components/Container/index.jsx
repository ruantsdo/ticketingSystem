//Components
import { Notification } from "../";

function Container({ children, ...props }) {
  const { className, ...restProps } = props;
  const baseClasses = `flex flex-col w-full min-h-screen bg-background dark:bg-darkBackground text-textColor
                       dark:text-darkTextColor justify-center items-center transition-all overflow-auto`;
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
