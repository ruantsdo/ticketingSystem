//React
import { useEffect, useState, useContext } from "react";
//Stores
import useFileStore from "../../../../stores/videosStore/videos";
//Components
import { Card } from "@nextui-org/react";
import { Button } from "../../../../components/";
import {
  Modal,
  ModalContent,
  ModalBody,
  useDisclosure,
} from "@nextui-org/react";

//Contexts
import AuthContext from "../../../../contexts/auth";
//Icons
import DeleteForeverIcon from "@mui/icons-material/DeleteForever";
import VisibilityIcon from "@mui/icons-material/Visibility";
import HideImageIcon from "@mui/icons-material/HideImage";

const VideoCard = ({ videoName }) => {
  const { isAdmin } = useContext(AuthContext);
  const { getVideoThumb, processingFileStore, deleteVideo } = useFileStore();
  const { isOpen, onOpen, onOpenChange } = useDisclosure();

  const [imageUrl, setImageUrl] = useState("");

  const currentVideo = `http://${process.env.REACT_APP_VIDEOS_SERVER_IP}:${process.env.REACT_APP_VIDEOS_SERVER_PORT}/${videoName}`;

  const handleThumbVideo = async () => {
    const response = await getVideoThumb(videoName);
    setImageUrl(response);
  };

  function cleanName(name) {
    const partes = name.split(".");
    if (partes.length > 1) {
      return partes.slice(0, -1).join(".");
    } else {
      return name;
    }
  }

  useEffect(() => {
    handleThumbVideo();
    //eslint-disable-next-line
  }, []);

  return (
    <Card className="flex flex-row w-[80%] h-36 gap-2 pl-5 pr-5 bg-transparent justify-around items-center border-1 rounded-lg border-darkBackground dark:border-background">
      <div className="flex items-center justify-around rounded-lg w-[30%] h-[90%]">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={videoName}
            className="w-fit h-fit max-w-full max-h-full rounded-lg"
          />
        ) : (
          <HideImageIcon
            fontSize="large"
            className="text-white dark:text-black"
          />
        )}
      </div>
      <div className="flex items-center w-[60%] h-[90%] text-black dark:text-white">
        <p className="font-semibold">{cleanName(videoName)}</p>
      </div>
      <div className="flex h-[90%] items-center gap-5">
        <Button
          mode="success"
          className="w-5 h-[60%] rounded-lg"
          onPress={() => onOpen()}
          isLoading={processingFileStore}
          isDisabled={processingFileStore || !isAdmin}
        >
          <VisibilityIcon fontSize="small" />
        </Button>
        <Button
          mode="failed"
          className="w-5 h-[60%] rounded-lg"
          onPress={() => {
            deleteVideo(videoName);
          }}
          isLoading={processingFileStore}
          isDisabled={processingFileStore || !isAdmin}
        >
          <DeleteForeverIcon fontSize="small" />
        </Button>
      </div>

      <Modal
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        className="w-[80%] h-[90%]"
      >
        <ModalContent>
          {(onClose) => (
            <ModalBody className="flex items-center justify-center w-full h-[50%] bg-black rounded-lg">
              <video
                src={currentVideo}
                controls
                className="w-[99.9%] h-[99.9%]"
              />
            </ModalBody>
          )}
        </ModalContent>
      </Modal>
    </Card>
  );
};

export default VideoCard;
