//React
import { useEffect, useMemo, useState } from "react";
//Stores
import useFileStore from "../../../../stores/videosStore/videos";
//Components
import VideoCard from "./videoCard";
import { Button } from "../../../../components";
//Icons
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import AddIcon from "@mui/icons-material/Add";
//Toast
import { toast } from "react-toastify";
//Contexts
import { useWebSocket } from "../../../../contexts/webSocket";
//NextUi
import {
  Modal,
  ModalContent,
  ModalBody,
  useDisclosure,
} from "@nextui-org/react";

function VideoManagement() {
  const { socket } = useWebSocket();
  const { getFullVideosList, uploadVideo, processingFileStore } =
    useFileStore();
  const { isOpen, onOpen, onOpenChange } = useDisclosure();

  const [videosList, setVideosList] = useState([]);
  const [file, setFile] = useState(null);

  const renderedVideos = useMemo(() => {
    if (!videosList.length) return null;

    return (
      <div className="w-[90%]">
        {videosList.map((item) => (
          <VideoCard videoName={item} key={item} />
        ))}
      </div>
    );
  }, [videosList]);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleUpload = async () => {
    if (!file) {
      toast.error("Por favor, selecione um arquivo primeiro.");
      return;
    }

    await uploadVideo(file);
  };

  const handleVideosList = async () => {
    const response = await getFullVideosList();
    setVideosList(response);
  };

  useEffect(() => {
    handleVideosList();
    //eslint-disable-next-line
  }, []);

  useEffect(() => {
    socket.on("video_update", () => {
      handleVideosList();
    });

    return () => {
      socket.off("video_update");
    };
  });

  return (
    <div className="flex flex-col w-full items-center">
      <Button
        mode="success"
        className="w-40 h-12 rounded-lg mb-5"
        onPress={() => onOpen()}
        isLoading={processingFileStore}
        isDisabled={processingFileStore}
      >
        <AddIcon fontSize="small" /> Enviar novo video
      </Button>
      {renderedVideos}
      <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
        <ModalContent>
          {(onClose) => (
            <ModalBody className="flex items-center justify-center bg-background dark:bg-darkBackground rounded-lg">
              <label htmlFor="videoFileInput" className="text-center">
                <p>Escolha um video para fazer upload.</p>
                <p className="text-sm">Formatos aceitos: mp4, webm e ogg</p>
              </label>
              <input
                id="videoFileInput"
                type="file"
                accept="video/mp4,video/webm,video/ogg"
                onChange={handleFileChange}
              />
              <Button mode="success" className="w-24" onClick={handleUpload}>
                <CloudUploadIcon />
                Enviar
              </Button>
            </ModalBody>
          )}
        </ModalContent>
      </Modal>
    </div>
  );
}

export default VideoManagement;
