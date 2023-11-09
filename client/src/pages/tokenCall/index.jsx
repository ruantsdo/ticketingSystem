import NotificationAudio from "../../assets/audios/tokenNotification.mp3";

//React
import React, { useCallback, useEffect, useState, useRef } from "react";

//Components
import Container from "../../components/container";

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
  const [displaySubtitle, setDisplaySubTitle] = useState("");

  const speakText = useCallback(
    (text) => {
      const voices = window.speechSynthesis.getVoices();
      const ptBrVoice = voices.find((voice) => voice.lang === "pt-BR");
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.voice = voices[ptBrVoice];
      speechSynthesis.speak(utterance);
    },
    // eslint-disable-next-line
    [speechSynthesis]
  );

  const speakQueue = () => {
    if (currentIndex < queue.length) {
      setDisplayText(
        `SENHA: ${queue[currentIndex].sector} ${queue[currentIndex].position}`
      );
      setDisplaySubTitle(`${queue[currentIndex].table}`);

      speakText(
        `Atenção ${queue[currentIndex].requested_by}, senha ${queue[currentIndex].sector} ${queue[currentIndex].position}, por favor dirija-se ao setor de ${queue[currentIndex].sector}, ${queue[currentIndex].table}`
      );

      if (lastsTokens.length >= 9) {
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

  function playAudio() {
    const audio = document.getElementById("myAudio");

    return new Promise((resolve) => {
      // Código para iniciar a reprodução de áudio
      audio.play();
      audio.onended = resolve; // Resolva a promessa quando a reprodução terminar
    });
  }

  useEffect(() => {
    handleVideos();
    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    async function playAndSpeak() {
      if (queue.length > 0) {
        await playAudio();
      }
      speakQueue();
    }

    playAndSpeak();
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
    <Container className="justify-between">
      <section className="flex border-1 w-11/12 h-[30%] justify-center items-center">
        <p className="text-6xl text-red-700">{displayText}</p>
      </section>

      <div className="flex w-screen h-[66%] justify-around">
        <Table
          aria-label="Lista das últimas senhas que foram chamadas"
          isStriped
          className="w-5/12 h-full transition-all"
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

        <div className="flex items-center justify-center w-6/12 h-full border-1 bg-black">
          {videoLoaded === true ? (
            <video
              ref={videoRef}
              src={currentVideo}
              controls
              autoPlay
              muted
              className="w-full h-full"
            />
          ) : (
            <p>Carregando...</p>
          )}
        </div>
      </div>
      <audio id="myAudio" src={NotificationAudio}></audio>
    </Container>
  );
}

export default TokenCall;
