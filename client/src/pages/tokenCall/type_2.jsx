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

  const [services, setServices] = useState([]);
  const [locations, setLocations] = useState([]);

  const speakText = useCallback(
    async (text) => {
      await playAudio();
      const voices = window.speechSynthesis.getVoices();
      const ptBrVoice = voices.find((voice) => voice.lang === "pt-BR");
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.voice = voices[ptBrVoice];

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

  const speakQueue = () => {
    if (currentIndex < queue.length) {
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

      speakText(
        `Atenção ${queue[currentIndex].requested_by}, senha ${
          services[queue[currentIndex].service - 1].name
        } ${queue[currentIndex].position}, por favor dirija-se á ${
          locations[queue[currentIndex].location - 1].name
        }, ${queue[currentIndex].table}`
      );

      if (lastsTokens.length >= 5) {
        setLastsTokens(lastsTokens.pop());
      }

      setLastsTokens([
        {
          id: `${queue[currentIndex].id}`,
          value: `${services[queue[currentIndex].service - 1].name} ${
            queue[currentIndex].position
          }`,
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

  const playAudio = () => {
    const audio = document.getElementById("notification");

    return new Promise((resolve) => {
      audio.play();
      audio.onended = resolve;
    });
  };

  const playAndSpeak = async () => {
    if (queue.length > 0 && queue.length > currentIndex) {
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
    speakQueue();
    //playAndSpeak();
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
    }

    return () => {
      if (videoRef.current) {
        // eslint-disable-next-line
        videoRef.current.removeEventListener("ended", handleVideos);
      }
    };
    // eslint-disable-next-line
  }, [currentVideoIndex]); //Video PlayBack Observer

  return (
    <div className="flex flex-row p-3 gap-3 w-screen h-screen bg-containerBackground justify-evenly transition-all delay-0 overflow-auto">
      <div className="flex flex-col border-1 w-6/12 h-full justify-around items-center">
        <p className="text-6xl text-red-700 underline">SENHA</p>
        <p className="text-5xl text-center text-red-700">{displayToken}</p>
        <p className="text-3xl text-center text-blue-700">{displayName}</p>
        <p className="text-5xl text-center ">{displayLocation}</p>
        <p className="text-4xl text-center ">{displayTable}</p>
      </div>

      <div className="flex flex-col w-6/12 h-5/12 items-end">
        <Table
          aria-label="Lista das últimas senhas que foram chamadas"
          isStriped
          className="w-full h-full transition-all"
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

        <div className="flex items-center justify-center w-full h-[50%] bg-black">
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
    </div>
  );
}

export default TokenCall;
