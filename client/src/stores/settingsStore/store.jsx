//React
import { useContext, useState } from "react";
//Services
import api from "../../services/api";
//Contexts - Providers
import AuthContext from "../../contexts/auth";
import { useConfirmIdentity } from "../../providers/confirmIdentity";
//Toast
import { toast } from "react-toastify";
//Utils
import useSocketUtils from "../../utils/socketUtils";

const useSettingsStore = () => {
  const { isAdmin, currentUser } = useContext(AuthContext);
  const { requestAuth } = useConfirmIdentity();
  const {
    settingsUpdateSignal,
    disconnectAllUsersSignal,
    updateCurrentVolumeSignal,
  } = useSocketUtils();

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

    requestAuth(async (userLevel) => {
      if (userLevel < 4) {
        toast.warn("Esse usuário não tem as permissões necessárias");
        return;
      }

      setProcessingSettingsStore(true);
      const { autoAprove, forceDailyLogin, registerForm, canLogin } = data;

      try {
        await api
          .post("/settings/update", {
            userId: currentUser.id,
            autoAprove: autoAprove,
            forceDailyLogin: forceDailyLogin,
            registerForm: registerForm,
            canLogin: canLogin,
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
    });
  };

  const updateDefaultVolume = async (defaultVolume) => {
    if (!isAdmin) {
      toast.info("Você não tem privilégios para realizar essa ação!");
      return;
    }

    requestAuth(async (userLevel) => {
      if (userLevel < 4) {
        toast.warn("Esse usuário não tem as permissões necessárias");
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
    });
  };

  const handleCreateBackup = async (tableName) => {
    requestAuth(async (userLevel) => {
      if (userLevel < 4) {
        toast.warn("Esse usuário não tem as permissões necessárias");
        return;
      }

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
    });
  };

  const handleRestoreBackup = async (file) => {
    requestAuth(async (userLevel) => {
      if (userLevel < 5) {
        toast.warn("Esse usuário não tem as permissões necessárias");
        return;
      }

      setProcessingSettingsStore(true);

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
      } finally {
        setProcessingSettingsStore(false);
      }
    });
  };

  const handleClearTable = async (tableName) => {
    requestAuth(async (userLevel) => {
      if (userLevel < 5) {
        toast.warn("Esse usuário não tem as permissões necessárias");
        return;
      }

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
    });
  };

  const backupCurrentTokens = async () => {
    requestAuth(async (userLevel) => {
      if (userLevel < 4) {
        toast.warn("Esse usuário não tem as permissões necessárias");
        return;
      }

      setProcessingSettingsStore(true);

      try {
        await api.get(`/backupCurrentTokens`);
        toast.success("Backup concluído!");
        toast.info("Você pode encontra-los na tela de relatórios");
      } catch (error) {
        toast.error("Falha ao fazer o backup!");
        console.error("Falha ao fazer o backup!");
        console.error(error);
      } finally {
        setProcessingSettingsStore(false);
      }
    });
  };

  const restoreDatabase = async () => {
    requestAuth(async (userLevel) => {
      if (userLevel < 5) {
        toast.warn("Esse usuário não tem as permissões necessárias");
        return;
      }

      setProcessingSettingsStore(true);

      try {
        await api.get(`/restoreDatabase`);
        toast.success("Banco de dados restaurado!");
      } catch (error) {
        toast.error("Falha ao restaurar banco de dados.");
        console.error("Falha ao restaurar banco de dados.");
        console.error(error);
      } finally {
        setProcessingSettingsStore(false);
      }
    });
  };

  const disconnectAllUsers = async () => {
    requestAuth(async (userLevel) => {
      if (userLevel < 4) {
        toast.warn("Esse usuário não tem as permissões necessárias");
        return;
      }

      setProcessingSettingsStore(true);

      try {
        await disconnectAllUsersSignal;
        toast.success("Todos os usuários conectados serão desconectados!");
      } catch (error) {
        toast.error("Falha ao desconectar usuários.");
        console.error(error);
      } finally {
        setProcessingSettingsStore(false);
      }
    });
  };

  const updateCurrentVolume = (data) => {
    requestAuth(async (userLevel) => {
      if (userLevel < 4) {
        toast.warn("Esse usuário não tem as permissões necessárias");
        return;
      }

      setProcessingSettingsStore(true);

      try {
        await updateCurrentVolumeSignal(data);
        toast.success("volume ajustado!");
      } catch (error) {
        toast.error("Falha ao ajustar volume.");
        console.error(error);
      } finally {
        setProcessingSettingsStore(false);
      }
    });
  };

  return {
    processingSettingsStore,
    getFullSettings,
    updateSettings,
    updateDefaultVolume,
    handleCreateBackup,
    handleRestoreBackup,
    handleClearTable,
    backupCurrentTokens,
    restoreDatabase,
    disconnectAllUsers,
    updateCurrentVolume,
  };
};

export default useSettingsStore;
