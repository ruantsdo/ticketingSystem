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
  const { currentUser, isAdmin } = useContext(AuthContext);
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
      console.log(response.data.videos);
      return response.data.videos;
    } catch (error) {
      toast.error(
        "Falha ao obter lista de videos. Tente novamente em alguns instantes!"
      );
      console.error("Falha ao obter lista de videos!");
      console.error(error);
    } finally {
      setProcessingFileStore(false);
    }
  };

  return {
    processingFileStore,
    getFullVideosList,
  };
};

export default useFileStore;
