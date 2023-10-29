//React
import React, { useEffect, useState } from "react";

//Components
import Container from "../../components/container";
import NavBar from "../../components/navbar";

//NextUI
import {} from "@nextui-org/react";

//Socket
import socketIOClient from "socket.io-client";

//API
// import api from "../../services/api";

function Home() {
  const [pageMounted, setPageMounted] = useState(null);
  //const [data, setData] = useState([]);

  useEffect(() => {
    const socket = socketIOClient(
      `http://${process.env.REACT_APP_SOCKET_SERVER_IP}:${process.env.REACT_APP_SOCKET_SERVER_PORT}`,
      {
        transports: ["websocket", "polling", "flashsocket"],
      }
    );
    socket.on("table_change", (data) => {
      console.log("Table changed:", data);
    });
  }, [pageMounted]);

  // const fetchData = async () => {
  //   console.log("Buscando novos dados");
  //   try {
  //     await api.get("/queue").then((response) => {
  //       setData(response.data);
  //     });
  //   } catch (error) {
  //     console.error("Erro ao buscar dados:", error);
  //   }
  // };

  // useEffect(() => {
  //   fetchData(); // Busque os dados inicialmente
  //   const intervalId = setInterval(fetchData, 5000);

  //   return () => {
  //     clearInterval(intervalId);
  //   };
  // }, [pageMounted]);

  useEffect(() => {
    setPageMounted(true);
  }, []);

  return (
    <>
      <NavBar />
      <Container>Home Page</Container>
    </>
  );
}
export default Home;
