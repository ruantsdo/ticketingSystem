//Components
import { NavBar, Container, Notification } from "../";

function FullContainer({ children, ...props }) {
  return (
    <div className="flex flex-col min-h-screen">
      <Notification />
      <NavBar />
      <Container {...props}>{children}</Container>
    </div>
  );
}

export default FullContainer;
