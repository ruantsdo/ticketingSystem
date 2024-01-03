//Components
import { NavBar } from "../../../components/";

function Container({ children }) {
  const defaultStyle = `flex flex-col w-full h-screen bg-background dark:bg-darkBackground
    text-textColor dark:text-darkTextColor transition-all overflow-hidden`;
  return (
    <>
      <NavBar />
      <div className={defaultStyle}>{children}</div>
    </>
  );
}

export default Container;
