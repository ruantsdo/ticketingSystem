//React
// eslint-disable-next-line
import React, { useState, useEffect } from "react";

//Socket
// eslint-disable-next-line
import socketIOClient from "socket.io-client";

//Components
import Container from "../../components/container";
import NavBar from "../../components/navbar";

//NextUI
import {} from "@nextui-org/react";

import dotenv from "dotenv";
dotenv.config({ path: "../../../../.env" });

//Env

function Home() {
  const socketServer = process.env.SOCKET_SERVER;
  const socketServerPort = process.env.SOCKET_SERVER_PORT;
  useEffect(() => {
    const socket = socketIOClient(
      `http://${socketServer}:${socketServerPort}`,
      {
        transports: ["websocket", "polling", "flashsocket"],
      }
    );

    socket.on("table_change", (data) => {
      // Handle the change in the table
      console.log("Table changed:", data);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  return (
    <>
      <NavBar />
      <Container>Home</Container>
    </>
  );
}

export default Home;
