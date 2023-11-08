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
  const [videos, setVideos] = useState([]);
  const [currentVideo, setCurrentVideo] = useState();
  const [videoLoaded, setVideoLoaded] = useState(false);

  const [queue, setQueue] = useState([]);
  const [lastsTokens, setLastsTokens] = useState([]);
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
      console.log("Video acabou...");
    } else {
      setCurrentVideoIndex(0);
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

  const importVideos = async (videoNames, videoRef) => {
    let currentVideoIndex = 0;

    const playNextVideo = () => {
      if (currentVideoIndex < videoNames.length) {
        const videoName = videoNames[currentVideoIndex];
        videoRef.current.src = require(`../../assets/videos/${videoName}`);
        currentVideoIndex++;
        videoRef.current.play();
      } else {
        currentVideoIndex = 0;
      }
    };

    videoRef.current.addEventListener("ended", playNextVideo);

    playNextVideo();
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
    handleVideos().then(() => {
      if (videoRef.current) {
        importVideos(videos, videoRef);
        setVideoLoaded(true);
      }
    });

    return () => {
      if (videoRef.current) {
        // eslint-disable-next-line
        videoRef.current.removeEventListener("ended", onVideoEnd);
      }
    };
    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    speakQueue();
    // eslint-disable-next-line
  }, [queue]);

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
        <video
          ref={videoRef}
          src={currentVideo}
          controls
          autoPlay
          width="500"
          muted
        ></video>
      ) : (
        <p>Carregando...</p>
      )}
    </FullContainer>
  );
}

export default TokenCall;
