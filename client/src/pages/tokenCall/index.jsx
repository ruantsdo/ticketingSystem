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

  return (
    <FullContainer>
      TokenCall Page
      {queue.length > 0 ? queue[queue.length - 1].sector : null}
    </FullContainer>
  );
}

export default TokenCall;
