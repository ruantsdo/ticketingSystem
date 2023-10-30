//React
import React, { useEffect, useState } from "react";

//Components
import FullContainer from "../../components/fullContainer";

//NextUI
import {} from "@nextui-org/react";

//Socket
// import socketIOClient from "socket.io-client";

//API
import api from "../../services/api";

function Home() {
  const [tokens, setTokens] = useState([]);

  const handleTokens = async () => {
    try {
      const response = await api.get("/token/query");
      await setTokens(response.data);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    handleTokens();
  }, []);

  return <FullContainer>Home Page {tokens[0]?.service}</FullContainer>;
}
export default Home;

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
