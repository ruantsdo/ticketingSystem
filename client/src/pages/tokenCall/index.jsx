//React
import React, { useCallback, useEffect, useState } from "react";

//Components
import FullContainer from "../../components/fullContainer";

//NextUI
import {} from "@nextui-org/react";

//Contexts
import { useWebSocket } from "../../contexts/webSocket";

function TokenCall() {
  const { speechSynthesis, SpeechSynthesisUtterance } = window;
  const { socket } = useWebSocket();

  const [queue, setQueue] = useState([]);
  //const [lastsTokens, setLastsTokens] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [displayText, setDisplayText] = useState("TokenCall Page");

  const speakText = useCallback(
    (text) => {
      const voices = window.speechSynthesis.getVoices();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.voice = voices[0];
      speechSynthesis.speak(utterance);
    },
    // eslint-disable-next-line
    [speechSynthesis]
  );

  const speakQueue = () => {
    if (currentIndex < queue.length) {
      setDisplayText(
        `SENHA ${queue[currentIndex].sector} ${queue[currentIndex].position} - MESA 2`
      );
      speakText(
        `Atenção ${queue[currentIndex].requested_by}, senha ${queue[currentIndex].sector} ${queue[currentIndex].position}, por favor dirija-se ao setor de ${queue[currentIndex].sector}, Mesa 2`
      );
      setCurrentIndex(currentIndex + 1);
    }
  };

  useEffect(() => {
    socket.on("queued_update", (data) => {
      setQueue([...queue, data]);
    });

    return () => {
      socket.off("queued_update");
    };
  });

  useEffect(() => {
    speakQueue();
    // eslint-disable-next-line
  }, [queue]);

  return <FullContainer>{displayText}</FullContainer>;
}

export default TokenCall;
