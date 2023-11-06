function Container({ children, ...props }) {
  const { className, ...restProps } = props;
  const baseClasses = `flex flex-col pt-3 pb-3 w-full min-h-screen bg-containerBackground justify-center items-center transition-all delay-0 overflow-auto`;
  const combinedClassName = className
    ? `${baseClasses} ${className}`
    : baseClasses;

  return (
    <div className={combinedClassName} {...restProps}>
      {children}
    </div>
  );
}

export default Container;
