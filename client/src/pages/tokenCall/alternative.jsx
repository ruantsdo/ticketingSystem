import NotificationAudio from "../../assets/audios/tokenNotification.mp3";

//React
import { useCallback, useEffect, useState, useRef } from "react";

//NextUI
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableCell,
  TableColumn,
  Spinner,
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

//Toast
import { toast } from "react-toastify";

function TokenCallAlternative() {
  const { speechSynthesis, SpeechSynthesisUtterance } = window;
  const { socket } = useWebSocket();

  const videoRef = useRef(null);
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const [currentVideo, setCurrentVideo] = useState();
  const [videoLoaded, setVideoLoaded] = useState(false);
  const [videosLength, setVideosLength] = useState();

  const [queue, setQueue] = useState([]);
  const [lastsTokens, setLastsTokens] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [displayToken, setDisplayToken] = useState(
    "Nenhuma senha foi chamada ainda..."
  );
  const [displayLocation, setDisplayLocation] = useState("");
  const [displayTable, setDisplayTable] = useState("");
  const [displayName, setDisplayName] = useState("");

  const [services, setServices] = useState([]);
  const [locations, setLocations] = useState([]);

  const maxListLength = Math.ceil(window.innerHeight / 130);

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
    if (currentIndex >= 0 && currentIndex < queue.length) {
      const textToSpeak = `Atenção ${
        queue[currentIndex].requested_by
      }, senha ${getTargetServiceName(queue[currentIndex].service)} ${
        queue[currentIndex].position
      },
      por favor dirija-se á ${getTargetLocationName(
        queue[currentIndex].location
      )}, ${queue[currentIndex].table}`;

      await speakText(textToSpeak);

      setTimeout(async () => {
        await updateText(currentIndex);
      }, 1000);

      setCurrentIndex((prevIndex) => prevIndex + 1);
    } else {
      console.error("currentIndex is not a valid index in the queue array.");
    }
  };

  const updateText = async (currentIndex) => {
    if (currentIndex >= 0 && currentIndex < queue.length) {
      setDisplayToken(
        `${getTargetServiceName(queue[currentIndex].service)} ${
          queue[currentIndex].position
        }`
      );
      setDisplayLocation(
        <p className="text-4xl text-center ">
          <span>Dirija-se á </span>
          <span className="text-blue-700 text-5xl animate-pulse">
            {getTargetLocationName(queue[currentIndex].location)}
          </span>
        </p>
      );

      if (queue[currentIndex].table) {
        setDisplayTable(" - " + queue[currentIndex].table + " - ");
      } else {
        setDisplayTable("");
      }

      setDisplayName(queue[currentIndex].requested_by);

      setLastsTokens((prevTokens) => {
        const newToken = {
          id: `${queue[currentIndex].token_id}`,
          value: `${getTargetServiceName(queue[currentIndex].service)} ${
            queue[currentIndex].position
          }`,
          location: `${getTargetLocationName(queue[currentIndex].location)}`,
        };

        const prevTokensArray = Array.isArray(prevTokens) ? prevTokens : [];

        const updatedTokens = [newToken, ...prevTokensArray];

        if (updatedTokens.length >= maxListLength + 1) {
          updatedTokens.pop();
        }

        return updatedTokens;
      });
    } else {
      console.error("currentIndex is not a valid index in the queue array.");
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
      setVideosLength(data.length);
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
    if (queue.length > 0) {
      await speakQueue();
    }
  };

  const getTargetServiceName = (id) => {
    const currentService = services.find((service) => service.id === id);

    return currentService.name;
  };

  const getTargetLocationName = (id) => {
    const currentLocation = locations.find((location) => location.id === id);

    return currentLocation.name;
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

  useEffect(() => {
    socket.on("services_updated", () => {
      handleServices();
    });

    socket.on("locations_updated", () => {
      handleLocations();
    });

    socket.on("queued_update", (data) => {
      setQueue([...queue, data]);
    });

    socket.on("midNight", () => {
      toast.warning("A sessão atual será limpa e atualizada em 5 segundos!");
      setTimeout(() => {
        window.location.reload(true);
      }, 5000);
    });

    return () => {
      socket.off("services_updated");
      socket.off("locations_updated");
      socket.off("queued_update");
      socket.off("midNight");
    };
    // eslint-disable-next-line
  }); //Socket Server Connection for Services Updates, Locations Updates, Queue and Reload observer

  return (
    <div className="flex flex-col p-1 gap-1 w-screen h-screen bg-background dark:bg-darkBackground transition-all delay-0">
      <div className="flex border-1 border-divider dark:darkDivider rounded justify-around w-full h-[40%] gap-1 font-mono">
        <Menu className="absolute mt-3 ml-[93%] z-50 opacity-20 hover:opacity-100" />
        <div className="flex flex-col justify-around w-full h-full border-1 rounded-lg">
          <section className="flex flex-col items-center">
            <p className="text-8xl 2xl:text-9xl text-center text-red-700 animate-pulse">
              {displayToken}
            </p>
          </section>
          <section className="flex flex-col items-center">
            <p className="text-7xl 2xl:text-8xl text-blue-700">{displayName}</p>
            {displayLocation}
            <p className="text-2xl text-center">{displayTable}</p>
          </section>
        </div>
      </div>

      <div className="flex flex-row w-full h-[60%] gap-1">
        <div className="flex flex-col w-[50%] h-full justify-around">
          <Table
            aria-label="Lista das últimas senhas que foram chamadas"
            isStriped
            className="w-full h-full"
          >
            <TableHeader>
              <TableColumn className="text-lg font-bold">
                <ReplayIcon className="mr-1 mb-1" />
                Últimas Senhas
              </TableColumn>
              <TableColumn className="text-lg font-bold">
                <LocationOnIcon className="mr-1 mb-1" />
                Local
              </TableColumn>
            </TableHeader>
            <TableBody
              items={lastsTokens}
              emptyContent={"Nenhuma ficha foi chamada ainda..."}
            >
              {(item) => (
                <TableRow
                  key={`${item.id}_${new Date().getTime()}`}
                  className="animate-appearance-in"
                >
                  <TableCell className="text-lg font-bold">
                    {item.value}
                  </TableCell>
                  <TableCell className="text-lg font-bold">
                    {item.location}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
          <Clock />
        </div>
        <div className="flex items-center justify-center w-[50%] h-full bg-black rounded-lg">
          {videoLoaded === true ? (
            <video
              ref={videoRef}
              src={currentVideo}
              controls
              autoPlay
              loop={videosLength > 1 ? false : true}
              className="w-[99.9%] h-[99.9%] rounded-lg"
            />
          ) : (
            <Spinner size="sm" color="success" label="Carregando..." />
          )}
        </div>
      </div>
      <audio id="notification" src={NotificationAudio}></audio>
    </div>
  );
}

export default TokenCallAlternative;
