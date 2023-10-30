//Components
import NavBar from "./navbar";
import Container from "./container";

function FullContainer({ children, ...props }) {
  return (
    <div className="relative">
      <div className="top-0 left-0 right-0">
        <NavBar />
      </div>
      <Container {...props}>{children}</Container>
    </div>
  );
}

export default FullContainer;
