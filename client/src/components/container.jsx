//Components
import Notification from "./notification";

function Container({ children, ...props }) {
  const { className, ...restProps } = props;
  const baseClasses = `flex flex-col pt-3 pb-3 w-full min-h-screen max-h-fit bg-containerBackground justify-center items-center transition-all delay-0 overflow-hidden`;
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
