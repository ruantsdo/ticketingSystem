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
//Components
import Clock from "./components/clock";
import Menu from "./components/menu";
//Icons
import LocationOnIcon from "@mui/icons-material/LocationOn";
import ReplayIcon from "@mui/icons-material/Replay";
//Toast
import { toast } from "react-toastify";
//Hooks
import getDataHooks from "../../Hooks/getData";
import useUtilsHooks from "../../Hooks/utilsHooks";
//Stores
import {
  useServicesStore,
  useLocationsStore,
  useSettingsStore,
} from "../../stores";
//Utils
import useSocketUtils from "../../utils/socketUtils";

function TokenCallAlternative() {
  const { socket } = useWebSocket();
  const { getAllServices } = useServicesStore();
  const { getLocationsList } = useLocationsStore();
  const { getVideosList } = getDataHooks();
  const { getTargetServiceName, getTargetLocationName } = useUtilsHooks();
  const { getFullSettings } = useSettingsStore();
  const { sendCurrentVolumeSignal } = useSocketUtils();

  const [callQueue, setCallQueue] = useState([]);
  const [lastsTokens, setLastsTokens] = useState([]);
  const [services, setServices] = useState([]);
  const [locations, setLocations] = useState([]);

  const videoRef = useRef(null);
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const [currentVideo, setCurrentVideo] = useState();
  const [videosList, setVideosList] = useState([]);
  const [videoLoaded, setVideoLoaded] = useState(false);

  const [defaultVolume, setDefaultVolume] = useState(0);
  const [currentVolume, setCurrentVolume] = useState(0);

  const [displayInfo, setDisplayInfo] = useState({
    token: "Nenhuma senha foi chamada ainda...",
    location: "",
    table: "",
    name: "",
  });

  const maxListLength = Math.ceil(window.innerHeight / 180); //Define how many rows the tables have based on screen resolution
  const delayBeforeSpeech = 5000; //Delay before start speak
  const initialVideoVolume = defaultVolume;

  const [isSpeaking, setIsSpeaking] = useState(false);

  const clearData = () => {
    videoRef.current.volume = 0;
    toast.info("A tela será limpa dentro de 5 segundos");
    setTimeout(() => {
      setDisplayInfo({
        token: "Nenhuma senha foi chamada ainda...",
        location: "",
        table: "",
        name: "",
      });
      setCurrentVolume(defaultVolume);
      setLastsTokens([]);
      setCallQueue([]);
      videoRef.current.volume = defaultVolume;
    }, 5000);
  };

  const handleVideosList = async () => {
    const data = await getVideosList();
    setVideosList(data);
    onVideoEnd(data);
  };

  const handleServicesList = async () => {
    const data = await getAllServices();
    setServices(data);
  };

  const handleLocationsList = async () => {
    const data = await getLocationsList();
    setLocations(data);
  };

  const handleSettings = async () => {
    const response = await getFullSettings();
    setDefaultVolume(response.defaultVolume);
    setCurrentVolume(response.defaultVolume);
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

  const speakText = useCallback(
    async (text) => {
      const voices = window.speechSynthesis.getVoices();
      const ptBrVoice = voices.find((voice) => voice.lang === "pt-BR");
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.voice = ptBrVoice;

      utterance.addEventListener("start", () => {
        setIsSpeaking(true);
        if (videoRef.current) {
          videoRef.current.volume = 0;
        }
      });

      utterance.addEventListener("end", () => {
        setIsSpeaking(false);
        if (videoRef.current) {
          videoRef.current.volume = initialVideoVolume;
        }
      });

      speechSynthesis.speak(utterance);
    },
    // eslint-disable-next-line
    [speechSynthesis]
  );

  const speakQueue = async (data) => {
    const currentService = await getTargetServiceName(services, data.service);
    const currentLocation = await getTargetLocationName(
      locations,
      data.location
    );

    const textToSpeak = `Atenção ${data.requested_by}, senha ${currentService} ${data.position},
      por favor dirija-se à ${currentLocation}, ${data.table}`;

    setDisplayInfo({
      token: `${currentService} - ${data.position}`,
      location: (
        <p className="text-4xl 2xl:text-5xl text-center">
          <span>Dirija-se à </span>
          <span className="text-blue-700 text-5xl 2xl:text-6xl animate-pulse">
            {currentLocation}
          </span>
        </p>
      ),
      table: `- ${data.table} -`,
      name: data.requested_by,
    });

    setLastsTokens((prevTokens) => {
      const newToken = {
        id: `${data.token_id}`,
        value: `${currentService} ${data.position}`,
        location: `${currentLocation}`,
      };

      const prevTokensArray = Array.isArray(prevTokens) ? prevTokens : [];

      const updatedTokens = [newToken, ...prevTokensArray];

      if (updatedTokens.length >= maxListLength + 1) {
        updatedTokens.pop();
      }

      return updatedTokens;
    });

    await speakText(textToSpeak);

    const updatedQueue = callQueue;
    updatedQueue.shift();
    setCallQueue(updatedQueue);
  };

  const playAudio = () => {
    const audio = document.getElementById("notification");

    return new Promise((resolve) => {
      audio.play();
      audio.onended = resolve;
    });
  };

  const getInitialData = async () => {
    await Promise.all([
      handleServicesList(),
      handleLocationsList(),
      handleVideosList(),
      handleSettings(),
    ]);
  };

  useEffect(() => {
    getInitialData();
    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    if (!videoRef || !currentVolume) return;
    videoRef.current.volume = currentVolume;
  }, [videoRef, currentVolume]);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.addEventListener("ended", handleVideosList);
      videoRef.current.volume = currentVolume || initialVideoVolume;
    }

    return () => {
      if (videoRef.current) {
        videoRef.current.removeEventListener("ended", handleVideosList);
        // eslint-disable-next-line
        videoRef.current.volume = currentVolume || initialVideoVolume;
      }
    };
    // eslint-disable-next-line
  }, [currentVideoIndex]); //Video PlayBack Observer

  useEffect(() => {
    socket.on("services_updated", async () => {
      handleServicesList();
    });

    socket.on("locations_updated", async () => {
      handleLocationsList();
    });

    socket.on("queued_update", (data) => {
      if (callQueue.length === 0 && !isSpeaking) {
        setCallQueue([data]);
        playAudio().then(() => {
          speakQueue(data);
        });
      } else {
        setCallQueue((prevQueue) => [...prevQueue, data]);
      }
    });

    socket.on("requireCurrentVolume", () => {
      sendCurrentVolumeSignal(currentVolume);
    });

    socket.on("video_update", () => {
      handleVideosList();
    });

    socket.on("adjustCurrentVolume", (currentVolume) => {
      videoRef.current.volume = currentVolume;
      setCurrentVolume(currentVolume);
    });

    socket.on("resetTokenCallScreen", () => {
      toast.warning(
        "As informações do display serão limpas dentro de 5 segundos!"
      );
      setTimeout(() => {
        clearData();
      }, 5000);
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
      socket.off("adjustCurrentVolume");
      socket.off("resetTokenCallScreen");
      socket.off("requireCurrentVolume");
      socket.off("video_update");
      socket.off("midNight");
    };
  }); //Initialize socket connections

  useEffect(() => {
    if (!isSpeaking) {
      if (callQueue.length >= 1) {
        setTimeout(() => {
          playAudio().then(() => {
            if (callQueue.length) {
              speakQueue(callQueue[0]);
            }
          });
        }, delayBeforeSpeech);
      } else if (callQueue.length === 0) {
        setTimeout(() => {
          if (callQueue.length) {
            speakQueue(callQueue[0]);
          }
        }, delayBeforeSpeech);
      }
    }
    // eslint-disable-next-line
  }, [isSpeaking]); //Speech observer

  return (
    <div className="flex flex-col p-1 gap-1 w-screen h-screen bg-background dark:bg-darkBackground transition-all delay-0">
      <div className="flex border-1 border-divider dark:darkDivider rounded justify-around w-full h-[40%] gap-1 font-mono">
        <Menu className="absolute mt-3 ml-[93%] z-50 opacity-20 hover:opacity-100" />
        <div className="flex flex-col justify-around w-full h-full border-1 rounded-lg">
          <section className="flex flex-col items-center">
            <p className="text-8xl 2xl:text-9xl text-center text-red-700 animate-pulse">
              {displayInfo.token}
            </p>
          </section>
          <section className="flex flex-col items-center">
            <p className="text-7xl 2xl:text-8xl text-blue-700">
              {displayInfo.name}
            </p>
            {displayInfo.location}
            <p className="text-2xl text-center">{displayInfo.table}</p>
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
              loop={videosList.length > 1 ? false : true}
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
