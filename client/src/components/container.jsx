function Container({ children, ...props }) {
  const { className, ...restProps } = props;
  const baseClasses = `flex w-full h-[94vh] bg-light-background dark:bg-dark-background justify-center items-center transition-all delay-0 overflow-auto`;
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
