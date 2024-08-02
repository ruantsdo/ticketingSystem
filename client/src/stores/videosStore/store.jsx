//React
import { useContext, useState } from "react";
//Services
import api from "../../services/api";
//Contexts
import AuthContext from "../../contexts/auth";
//Toast
import { toast } from "react-toastify";
//Utils
import useSocketUtils from "../../utils/socketUtils";

const useFileStore = () => {
  const { isAdmin } = useContext(AuthContext);
  const { videoUpdateSignal } = useSocketUtils();

  const [processingFileStore, setProcessingFileStore] = useState(false);

  const getFullVideosList = async () => {
    if (!isAdmin) {
      toast.info("Você não tem privilégios para realizar essa ação!");
      return;
    }

    setProcessingFileStore(true);

    try {
      const response = await api.get(`/videoList`);
      return response.data.videos;
    } catch (error) {
      toast.error("Falha ao obter lista de videos!");
      console.error("Falha ao obter lista de videos!");
      console.error(error);
    } finally {
      setProcessingFileStore(false);
    }
  };

  const getVideoThumb = async (videoName) => {
    try {
      const response = await api.get(`/thumbnail/${videoName}`, {
        responseType: "blob",
      });
      const thumbnailUrl = URL.createObjectURL(response.data);
      return thumbnailUrl;
    } catch (error) {
      console.error(
        `Erro ao obter thumbnail para o vídeo ${videoName}:`,
        error
      );
      return null;
    }
  };

  const uploadVideo = async (file) => {
    setProcessingFileStore(true);

    const formData = new FormData();
    formData.append("video", file);
    formData.append("fileName", file.name);

    try {
      const response = await api.post("/uploadVideo", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      videoUpdateSignal();
      toast.success("Upload bem-sucedido!");
      return response.data;
    } catch (error) {
      console.error("Erro ao fazer upload do vídeo:", error);
      toast.error(
        "Falha ao fazer upload do vídeo. Tente novamente mais tarde."
      );
      return null;
    } finally {
      setProcessingFileStore(false);
    }
  };

  const deleteVideo = async (videoName) => {
    setProcessingFileStore(true);

    try {
      await api.delete(`/deleteVideo/${videoName}`);
      toast.info("Video removido");
      videoUpdateSignal();
    } catch (error) {
      console.log("Falha ao remover video");
      console.log(error);
      toast.error("Falha ao remover video. Tente novamente mais tarde!");
    } finally {
      setProcessingFileStore(false);
    }
  };

  return {
    processingFileStore,
    getFullVideosList,
    getVideoThumb,
    uploadVideo,
    deleteVideo,
  };
};

export default useFileStore;
