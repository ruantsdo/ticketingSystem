//React
import React, { useEffect, useState } from "react";

//Components
import FullContainer from "../../components/fullContainer";

//NextUI
import {} from "@nextui-org/react";

//API
import api from "../../services/api";

function Home() {
  const [tokens, setTokens] = useState([]);
  const [speaking, setSpeaking] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  const handleTokens = async () => {
    try {
      const response = await api.get("/token/query");
      const newTokens = response.data;

      if (newTokens && newTokens.length > 0) {
        setTokens((prevTokens) => [...prevTokens, ...newTokens]);
      } else {
        setTimeout(() => {
          handleTokens();
        }, 5000);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const speak = (item) => {
    if (window.speechSynthesis) {
      const textToSpeak = `Atenção ${item.id}, dirija-se a ${item.sector}.`;
      const utterance = new SpeechSynthesisUtterance(textToSpeak);
      window.speechSynthesis.speak(utterance);
      setSpeaking(true);

      utterance.onend = () => {
        setSpeaking(false);

        if (currentIndex < tokens.length - 1) {
          setCurrentIndex(currentIndex + 1);
        }
      };
    }
  };

  useEffect(() => {
    handleTokens();
    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    if (currentIndex < tokens.length) {
      speak(tokens[currentIndex]);
    }
    // eslint-disable-next-line
  }, [currentIndex, tokens]);

  return <FullContainer>Home Page {tokens[0]?.service}</FullContainer>;
}

export default Home;
