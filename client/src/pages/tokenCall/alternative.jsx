import NotificationAudio from "../../assets/audios/tokenNotification.mp3";

//React
import React, { useCallback, useEffect, useState, useRef } from "react";

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

//Components
import Clock from "./components/clock";
import Menu from "./components/menu";

//Icons
import LocationOnIcon from "@mui/icons-material/LocationOn";
import ReplayIcon from "@mui/icons-material/Replay";

function TokenCallAlternative() {
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

    const textToSpeak = `Atenção ${queue[currentIndex].requested_by}, senha ${
      services[queue[currentIndex].service - 1].name
    } ${queue[currentIndex].position}, por favor dirija-se á ${
      locations[queue[currentIndex].location - 1].name
    }, ${queue[currentIndex].table}`;

    await speakText(textToSpeak);

    setTimeout(async () => {
      await updateText();
    }, 1000);
  };

  const updateText = async () => {
    setdisplayToken(
      `${services[queue[currentIndex].service - 1].name} ${
        queue[currentIndex].position
      }`
    );
    setDisplayLocation(
      <p className="text-4xl text-center ">
        <span>Dirija-se á </span>
        <span className="text-blue-700 animate-pulse">
          {locations[queue[currentIndex].location - 1].name}
        </span>
      </p>
    );

    if (queue[currentIndex].table) {
      setDisplayTable(" - " + queue[currentIndex].table + " - ");
    } else {
      setDisplayTable("");
    }

    setDisplayName(queue[currentIndex].requested_by);

    if (lastsTokens.length >= 6) {
      setLastsTokens((prevTokens) => prevTokens.slice(1));
    }

    setLastsTokens((prevTokens) => [
      {
        id: `${queue[currentIndex].id}`,
        value: `${services[queue[currentIndex].service - 1].name} ${
          queue[currentIndex].position
        }`,
        location: `${locations[queue[currentIndex].location - 1].name}`,
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

  const playAndSpeak = async () => {
    if (queue.length > 0) {
      await playAudio();
    }
    await speakQueue();
  };

  useEffect(() => {
    handleServices();
    handleLocations();
    handleVideos();
    // eslint-disable-next-line
  }, []); //Handle Video List, Locations, Services

  useEffect(() => {
    playAndSpeak();
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
    <div className="flex flex-col justify-around p-1 gap-3 w-screen h-screen bg-containerBackground transition-all delay-0 overflow-auto">
      <div className="flex justify-around w-full h-3/6 gap-1 font-mono">
        <Menu className="absolute mt-2 ml-[95%] z-50 opacity-20 hover:opacity-100" />
        <div className="flex flex-col justify-around w-full h-full border-1 rounded-lg">
          <section className="flex flex-col items-center">
            <p className="text-6xl text-center text-red-700 animate-pulse">
              {displayToken}
            </p>
          </section>
          <section className="flex flex-col items-center">
            <p className="text-6xl text-center text-blue-700">{displayName}</p>
            {displayLocation}
            <p className="text-2xl text-center">{displayTable}</p>
          </section>
        </div>
      </div>

      <div className="flex flex-row w-full h-[60%] justify-around items-center gap-2">
        <div className="flex flex-col w-[50%] h-full">
          <Table
            aria-label="Lista das últimas senhas que foram chamadas"
            isStriped
            className="w-full h-full"
          >
            <TableHeader>
              <TableColumn>
                <ReplayIcon className="mr-1 mb-1" />
                Últimas Senhas
              </TableColumn>
              <TableColumn>
                <LocationOnIcon className="mr-1 mb-1" />
                Local
              </TableColumn>
            </TableHeader>
            <TableBody
              items={lastsTokens}
              emptyContent={"Nenhuma ficha foi chamada ainda..."}
            >
              {(item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-bold">{item.value}</TableCell>
                  <TableCell className="font-bold">{item.location}</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
          <Clock />
        </div>
        <div className="flex items-center justify-center w-6/12 h-full bg-black rounded-lg">
          {videoLoaded === true ? (
            <video
              ref={videoRef}
              src={currentVideo}
              controls
              autoPlay
              className="w-full h-full overflow-hidden rounded-lg"
            />
          ) : (
            <p>Carregando...</p>
          )}
        </div>
      </div>
      <audio id="notification" src={NotificationAudio}></audio>
    </div>
  );
}

export default TokenCallAlternative;
