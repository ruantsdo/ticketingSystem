//React
import React, { useCallback, useEffect, useState } from "react";

//Components
import FullContainer from "../../components/fullContainer";

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

//Services
import api from "../../services/api";

function TokenCall() {
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const [videos, setVideos] = useState([]);
  const [currentVideo, setCurrentVideo] = useState();

  const { speechSynthesis, SpeechSynthesisUtterance } = window;
  const { socket } = useWebSocket();

  const [queue, setQueue] = useState([]);
  const [lastsTokens, setLastsTokens] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [displayText, setDisplayText] = useState("TokenCall Page");
  const [videoLoaded, setVideoLoaded] = useState(false);

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

  const onVideoEnd = () => {
    if (currentVideoIndex < videos.length - 1) {
      setCurrentVideoIndex(currentVideoIndex + 1);
      // videoRef.current.load();
      // videoRef.current.play();
    } else {
      setCurrentVideoIndex(0);
      // videoRef.current.load();
      // videoRef.current.play();
    }
  };

  const handleVideos = async () => {
    try {
      const response = await api.get("/videoList");
      const data = response.data.videos;
      setVideos(data);
      importVideos(data);
    } catch (error) {
      console.error(error);
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
    handleVideos().then(() => setVideoLoaded(true));
    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    speakQueue();
    // eslint-disable-next-line
  }, [queue]);

  const importVideos = async (videoNames) => {
    for (const videoName of videoNames) {
      setCurrentVideo(require("../../assets/videos/" + videoName));
    }

    onVideoEnd();
  };

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

      {videoLoaded === true ? (
        <video src={currentVideo} controls autoPlay width="500" muted></video>
      ) : (
        <p>Carregando...</p>
      )}
    </FullContainer>
  );
}

export default TokenCall;
