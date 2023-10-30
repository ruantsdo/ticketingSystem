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
      callToken(response.data);
    } catch (error) {
      console.error(error);
    }
  };

  const speakText = (text) => {
    if ("speechSynthesis" in window) {
      const synthesis = window.speechSynthesis;
      const utterance = new SpeechSynthesisUtterance(text);

      // Configurar a voz em português do Brasil, se disponível
      const voices = synthesis.getVoices();
      const ptBRVoice = voices.find((voice) => voice.lang === "pt-BR");
      if (ptBRVoice) {
        utterance.voice = ptBRVoice;
      }

      synthesis.speak(utterance);
    }
  };

  const callToken = (token) => {
    if (token.lengh !== 0) {
      token.forEach((sector) => {
        speakText(
          `Atenção ${token.service} ${token.id} dirija-se à sala do ${sector.sector}`
        );
      });
    }
  };

  useEffect(() => {
    handleTokens();
    // eslint-disable-next-line
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
