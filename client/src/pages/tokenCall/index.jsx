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
  const [displayToken, setdisplayToken] = useState(
    "Nenhuma senha foi chamada ainda..."
  );
  const [displayLocation, setDisplayLocation] = useState("");
  const [displayTable, setDisplayTable] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [isSpeaking, setIsSpeaking] = useState(false);

  const [services, setServices] = useState([]);
  const [locations, setLocations] = useState([]);

  const speakText = useCallback(
    async (text) => {
      const audio = document.getElementById("notification");

      const voices = window.speechSynthesis.getVoices();
      const ptBrVoice = voices.find((voice) => voice.lang === "pt-BR");
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.voice = voices[ptBrVoice];

      utterance.addEventListener("start", () => {
        audio.volume = 0.05;
        if (videoRef.current) {
          videoRef.current.volume = 0;
        }
      });

      utterance.addEventListener("end", () => {
        audio.volume = 1.0;
        if (videoRef.current) {
          videoRef.current.volume = 0.7;
        }
      });

      await playAudio();

      speechSynthesis.speak(utterance);
    },
    // eslint-disable-next-line
    [speechSynthesis]
  );

  const handleServices = async () => {
    try {
      const response = await api.get("/services/query");
      setServices(response.data);
    } catch (error) {
      console.log(error);
    }
  };

  const handleLocations = async () => {
    try {
      const response = await api.get("/location/query");
      setLocations(response.data);
    } catch (error) {
      console.error(error);
    }
  };

  const speakQueue = async () => {
    if (isSpeaking || currentIndex >= queue.length) {
      return;
    }

    setIsSpeaking(true);

    setdisplayToken(
      `${services[queue[currentIndex].service - 1].name} ${
        queue[currentIndex].position
      }`
    );
    setDisplayLocation(
      "Dirija-se á " + locations[queue[currentIndex].location - 1].name
    );
    setDisplayTable(queue[currentIndex].table);
    setDisplayName(queue[currentIndex].requested_by);

    const textToSpeak = `Atenção ${queue[currentIndex].requested_by}, senha ${
      services[queue[currentIndex].service - 1].name
    } ${queue[currentIndex].position}, por favor dirija-se á ${
      locations[queue[currentIndex].location - 1].name
    }, ${queue[currentIndex].table}`;

    speakText(textToSpeak);

    if (lastsTokens.length >= 5) {
      setLastsTokens((prevTokens) => prevTokens.slice(1));
    }

    setLastsTokens((prevTokens) => [
      {
        id: `${queue[currentIndex].id}`,
        value: `${services[queue[currentIndex].service - 1].name} ${
          queue[currentIndex].position
        }`,
      },
      ...prevTokens,
    ]);

    setCurrentIndex((prevIndex) => prevIndex + 1);

    setIsSpeaking(false);
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

  const playAudio = () => {
    const audio = document.getElementById("notification");

    return new Promise((resolve) => {
      audio.play();
      audio.onended = resolve;
    });
  };

  useEffect(() => {
    handleServices();
    handleLocations();
    handleVideos();
    // eslint-disable-next-line
  }, []); //Handle Video List, Locations, Services

  useEffect(() => {
    speakQueue();
    // eslint-disable-next-line
  }, [queue]); //Speak Queue

  useEffect(() => {
    socket.on("queued_update", (data) => {
      setQueue([...queue, data]);
    });

    return () => {
      socket.off("queued_update");
    };
  }); //Socket Server Connection

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.addEventListener("ended", handleVideos);
      videoRef.current.volume = 0.8;
    }

    return () => {
      if (videoRef.current) {
        // eslint-disable-next-line
        videoRef.current.removeEventListener("ended", handleVideos);
        // eslint-disable-next-line
        videoRef.current.volume = 0.8;
      }
    };
    // eslint-disable-next-line
  }, [currentVideoIndex]); //Video PlayBack Observer

  return (
    <Container className="justify-between">
      <section className="flex border-1 w-11/12 h-[40%] justify-center items-center">
        <p className="text-6xl text-red-700">{displayToken}</p>
        <p className="text-3xl text-blue-700">
          {displayLocation} {displayTable}
        </p>
        <p className="text-3xl text-blue-700">{displayName}</p>
      </section>

      <div className="flex w-screen h-[60%] justify-around">
        <Table
          isStriped
          aria-label="Lista das últimas senhas que foram chamadas"
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

      <audio id="notification" src={NotificationAudio}></audio>
    </Container>
  );
}

export default TokenCall;
