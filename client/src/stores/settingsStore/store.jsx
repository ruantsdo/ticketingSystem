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

  const handleCreateBackup = async (tableName) => {
    setProcessingSettingsStore(true);

    try {
      const response = await api.get(`/backup/${tableName}`, {
        responseType: "blob",
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `${tableName}_backup.sql`);
      document.body.appendChild(link);
      link.click();
      link.remove();

      toast.success("Backup criado com sucesso");
    } catch (error) {
      toast.error("Falha ao criar backup");
      console.error("Falha ao criar backup!");
      console.error(error);
    } finally {
      setProcessingSettingsStore(false);
    }
  };

  const handleRestoreBackup = async (file) => {
    const formData = new FormData();
    formData.append("backup", file);

    try {
      await api.post("/restoreBackup", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      toast.success("Backup restaurado com sucesso!");
    } catch (error) {
      toast.error("Falha ao restaurar backup");
      console.error("Falha ao restaurar backup!", error);
    }
  };

  const handleClearTable = async (tableName) => {
    setProcessingSettingsStore(true);

    try {
      await api.get(`/clearTable/${tableName}`);
      toast.success("Os dados foram limpos!");
    } catch (error) {
      toast.error("Falha ao remover os dados!");
      console.error("Falha ao remover os dados!");
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
    handleCreateBackup,
    handleRestoreBackup,
    handleClearTable,
  };
};

export default useSettingsStore;
