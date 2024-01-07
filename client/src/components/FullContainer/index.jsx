//Components
import { NavBar, Container } from "../";

function FullContainer({ children, ...props }) {
  return (
    <div className="flex flex-col h-screen">
      <NavBar />
      <Container {...props}>{children}</Container>
    </div>
  );
}

export default FullContainer;
