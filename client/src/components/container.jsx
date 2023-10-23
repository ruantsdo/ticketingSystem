function Container({ children, ...props }){
    const { className, ...restProps } = props;
    const baseClasses = `flex w-screen h-screen bg-light-background dark:bg-dark-background justify-center items-center transition-all delay-0`;
    const combinedClassName = className ? `${baseClasses} ${className}` : baseClasses;

    return (
            <div className={combinedClassName} {...restProps}>
                {children}
            </div>
    );
}

export default Container