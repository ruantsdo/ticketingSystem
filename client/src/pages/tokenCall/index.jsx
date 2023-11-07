//React
import React, { useCallback, useEffect, useState } from "react";

//Components
import FullContainer from "../../components/fullContainer";
import VideoJS from "../../components/videoPlayer";

//NextUI
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableCell,
  TableColumn,
} from "@nextui-org/react";

//Contexts
import { useWebSocket } from "../../contexts/webSocket";

function TokenCall() {
  //const playerRef = React.useRef(null);

  const { speechSynthesis, SpeechSynthesisUtterance } = window;
  const { socket } = useWebSocket();

  const [queue, setQueue] = useState([]);
  const [lastsTokens, setLastsTokens] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [displayText, setDisplayText] = useState("TokenCall Page");

  // const videoJsOptions = {
  //   autoplay: true,
  //   controls: true,
  //   responsive: true,
  //   width: "350",
  //   height: "350",
  //   //fluid: true,
  //   // playerVars: {
  //   //   listType: "playlist",
  //   //   list: "https://www.youtube.com/playlist?list=PLTHOGCUnYUS1auqvXd8uD1KAG-dqKEzIQ", // Substitua pelo ID da sua playlist
  //   // },
  //   // sources: [
  //   //   {
  //   //     type: "video/youtube",
  //   //     src: "https://www.youtube.com/watch?v=9_OnWhIST3A",
  //   //   },
  //   // ],
  //   // sources: [
  //   //   {
  //   //     src: "https://www.youtube.com/watch?v=9_OnWhIST3A",
  //   //     type: "video",
  //   //   },
  //   // ],
  // };

  // const handlePlayerReady = (player) => {
  //   playerRef.current = player;

  //   // You can handle player events here, for example:
  //   player.on("waiting", () => {
  //     console.log("player is waiting");
  //   });

  //   player.on("dispose", () => {
  //     console.log("player will dispose");
  //   });
  // };

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
        `SENHA ${queue[currentIndex].sector} ${queue[currentIndex].position} - ${queue[currentIndex].table}`
      );

      speakText(
        `Atenção ${queue[currentIndex].requested_by}, senha ${queue[currentIndex].sector} ${queue[currentIndex].position}, por favor dirija-se ao setor de ${queue[currentIndex].sector}, ${queue[currentIndex].table}`
      );

      if (lastsTokens.length >= 5) {
        setLastsTokens(lastsTokens.pop());
      }

      setLastsTokens([
        {
          id: `${queue[currentIndex].id}`,
          value: `SENHA ${queue[currentIndex].sector} ${queue[currentIndex].position} - ${queue[currentIndex].table}`,
        },
        ...lastsTokens,
      ]);

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

  // const defineLastsTokens = () => {
  //   setLastsTokens(lastsTokens.slice(-5));
  // };

  return (
    <FullContainer>
      {displayText}
      <Table
        aria-label="Lista das últimas senhas que foram chamadas"
        isStriped
        className="w-1/6"
      >
        <TableHeader>
          <TableColumn>Últimas Senhas</TableColumn>
        </TableHeader>
        <TableBody
          items={lastsTokens}
          emptyContent={"Nenhuma ficha foi chamada ainda..."}
        >
          {(item) => (
            <TableRow key={item.id}>
              <TableCell>{item.value}</TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      <VideoJS />
    </FullContainer>
  );
}

export default TokenCall;
