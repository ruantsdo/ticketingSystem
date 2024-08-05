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

const useSettingsStore = () => {
  const { isAdmin, currentUser } = useContext(AuthContext);
  const { settingsUpdateSignal } = useSocketUtils();

  const [processingSettingsStore, setProcessingSettingsStore] = useState(false);

  const getFullSettings = async () => {
    setProcessingSettingsStore(true);

    try {
      const response = await api.get(`/verifySettings`);
      return response.data;
    } catch (error) {
      toast.error("Falha ao obter configurações");
      console.error("Falha ao obter configurações");
      console.error(error);
    } finally {
      setProcessingSettingsStore(false);
    }
  };

  const updateSettings = async (data) => {
    if (!isAdmin) {
      toast.info("Você não tem privilégios para realizar essa ação!");
      return;
    }

    setProcessingSettingsStore(true);
    const { autoAprove, forceDailyLogin, registerForm } = data;

    try {
      await api
        .post("/settings/update", {
          userId: currentUser.id,
          autoAprove: autoAprove,
          forceDailyLogin: forceDailyLogin,
          registerForm: registerForm,
        })
        .then((response) => {
          settingsUpdateSignal();
          toast.info(response.data);
        });
    } catch (error) {
      console.error("Falha ao atualizar configurações!");
      console.error(error);
    } finally {
      setProcessingSettingsStore(false);
    }
  };

  const updateDefaultVolume = async (defaultVolume) => {
    if (!isAdmin) {
      toast.info("Você não tem privilégios para realizar essa ação!");
      return;
    }

    setProcessingSettingsStore(true);

    try {
      await api
        .post("/settings/update/defaultVolume", {
          userId: currentUser.id,
          defaultVolume: defaultVolume,
        })
        .then((response) => {
          toast.info(response.data);
        });
    } catch (error) {
      console.error("Falha ao atualizar configurações!");
      console.error(error);
    } finally {
      setProcessingSettingsStore(false);
    }
  };

  return {
    processingSettingsStore,
    getFullSettings,
    updateSettings,
    updateDefaultVolume,
  };
};

export default useSettingsStore;
