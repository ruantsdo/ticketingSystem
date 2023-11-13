//Components
import NavBar from "./navbar";
import Container from "./container";

function FullContainer({ children, ...props }) {
  return (
    <div className="flex flex-col">
      <NavBar />
      <Container {...props}>{children}</Container>
    </div>
  );
}

export default FullContainer;
