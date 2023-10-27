//React
import React, { useEffect } from "react";

//Socket
import socketIOClient from "socket.io-client";

//Components
import Container from "../../components/container";
import NavBar from "../../components/navbar";

//NextUI
import {} from "@nextui-org/react";

function Home() {
  const socketServer = process.env.REACT_APP_SOCKET_SERVER;
  const socketServerPort = process.env.REACT_APP_SOCKET_SERVER_PORT;

  useEffect(() => {
    const socket = socketIOClient(
      `http://${socketServer}:${socketServerPort}`,
      {
        transports: ["websocket", "polling", "flashsocket"],
      }
    );

    socket.on("table_change", (data) => {
      console.log("Table changed:", data);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  return (
    <>
      <NavBar />
      <Container>Home Page</Container>
    </>
  );
}

export default Home;
