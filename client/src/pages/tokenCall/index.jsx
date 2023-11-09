//React
import React, { useCallback, useEffect, useState, useRef } from "react";

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
  const { speechSynthesis, SpeechSynthesisUtterance } = window;
  const { socket } = useWebSocket();

  const videoRef = useRef(null);
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const [currentVideo, setCurrentVideo] = useState();
  const [videoLoaded, setVideoLoaded] = useState(false);

  const [queue, setQueue] = useState([]);
  const [lastsTokens, setLastsTokens] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [displayText, setDisplayText] = useState(
    "Nenhuma ficha foi chamada ainda..."
  );

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

  const onVideoEnd = (data) => {
    setVideoLoaded(false);

    if (currentVideoIndex < data.length - 1) {
      setCurrentVideo(
        `http://${process.env.REACT_APP_VIDEOS_SERVER_IP}:${process.env.REACT_APP_VIDEOS_SERVER_PORT}/${data[currentVideoIndex]}`
      );
      setCurrentVideoIndex(currentVideoIndex + 1);
    } else {
      setCurrentVideoIndex(0);
      setCurrentVideo(
        `http://${process.env.REACT_APP_VIDEOS_SERVER_IP}:${process.env.REACT_APP_VIDEOS_SERVER_PORT}/${data[currentVideoIndex]}`
      );
    }

    setVideoLoaded(true);
  };

  const handleVideos = async () => {
    try {
      const response = await api.get("/videoList");
      const data = response.data.videos;
      onVideoEnd(data);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    handleVideos();
    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    speakQueue();
    // eslint-disable-next-line
  }, [queue]);

  useEffect(() => {
    socket.on("queued_update", (data) => {
      setQueue([...queue, data]);
    });

    return () => {
      socket.off("queued_update");
    };
  });

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.addEventListener("ended", handleVideos);
    }

    return () => {
      if (videoRef.current) {
        // eslint-disable-next-line
        videoRef.current.removeEventListener("ended", handleVideos);
      }
    };
    // eslint-disable-next-line
  }, [currentVideoIndex]);

  return (
    <FullContainer>
      <section className="bg-red-700">{displayText}</section>

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
        <video
          ref={videoRef}
          src={currentVideo}
          controls
          autoPlay
          width="250"
          height="250"
          muted
        ></video>
      ) : (
        <p>Carregando...</p>
      )}
    </FullContainer>
  );
}

export default TokenCall;
