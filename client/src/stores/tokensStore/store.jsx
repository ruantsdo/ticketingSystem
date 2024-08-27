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

//Stores
import { useUsersStore } from "../";

const useTokensStore = () => {
  const { currentUser, isAdmin } = useContext(AuthContext);
  const { getUserServices } = useUsersStore();
  const { newTokenSignal } = useSocketUtils();

  const [processingTokensStore, setProcessingTokensStore] = useState(false);

  const getAllTokens = async () => {
    setProcessingTokensStore(true);
    try {
      const response = await api.get("/token/query");
      return response.data;
    } catch (error) {
      console.error("Falha ao obter as senhas disponíveis: " + error);
    } finally {
      setProcessingTokensStore(false);
    }
  };

  const getTokensByServiceId = async (serviceId) => {
    setProcessingTokensStore(true);
    try {
      const response = await api.get(`/token/query/${serviceId}`);
      return response;
    } catch (error) {
      toast.error("Falha ao recuperar tokens do serviço...");
      console.error("Falha ao recuperar tokens do serviço...");
      console.error(error);
    } finally {
      setProcessingTokensStore(false);
    }
  };

  const checkTokenAvailability = async (serviceId) => {
    try {
      const service = await api.get(`/services/query/${serviceId}`);
      const token = await api.get(`/token/query/${serviceId}`);

      if (service.data[0].limit === 0) return "infinity";
      return `${token.data.length}/${service.data[0].limit}`;
    } catch (error) {
      toast.error("Falha ao verificar disponibilidade da ficha!");
      console.error(
        "Falha ao verificar a disponibilidade da ficha ... " + error
      );
    }
  };

  const registerToken = async (data) => {
    setProcessingTokensStore(true);
    const { priority, service, requested_by } = data;
    const disposability = await checkTokenAvailability(service);

    if (!disposability || !isAdmin || disposability !== "infinity")
      return false;

    try {
      const response = await api.post("/token/registration", {
        priority,
        service,
        created: currentUser.name,
        requested_by,
      });
      const data = response.data;
      const tokenInfo = data.tokensData;
      const message = data.message;

      if (message === "success") {
        toast.success("Ficha registrada!");
        newTokenSignal();
        tokenInfo.disposability = disposability;
        return tokenInfo;
      } else if (message === "failed") {
        toast.warn(
          "Falha ao registrar nova ficha! Tente novamente em alguns instantes!"
        );
      }
    } catch (err) {
      toast.error(
        "Houve um problema ao cadastrar a nova ficha! Tente novamente em alguns instantes!"
      );
      console.log(err);
    } finally {
      setProcessingTokensStore(false);
    }
  };

  const filterTokensByUser = async (id) => {
    setProcessingTokensStore(true);

    try {
      const currentTokens = await getAllTokens();
      const userServices = await getUserServices(id);

      if (currentTokens && userServices) {
        if (
          currentUser.permission_level === 3 ||
          currentUser.permission_level === 2
        ) {
          const tokens = currentTokens.filter((token) => {
            return userServices.some(
              (userService) => userService.service_id === token.service
            );
          });

          tokens.sort((a, b) => {
            const statusA = a.status.toUpperCase();
            const statusB = b.status.toUpperCase();

            if (statusA === "CONCLUIDO" && statusB !== "CONCLUIDO") {
              return 1;
            } else if (statusA !== "CONCLUIDO" && statusB === "CONCLUIDO") {
              return -1;
            } else {
              return 0;
            }
          });

          return tokens;
        } else if (currentUser.permission_level >= 4) {
          currentTokens.sort((a, b) => {
            const statusA = a.status.toUpperCase();
            const statusB = b.status.toUpperCase();

            if (statusA === "CONCLUIDO" && statusB !== "CONCLUIDO") {
              return 1;
            } else if (statusA !== "CONCLUIDO" && statusB === "CONCLUIDO") {
              return -1;
            } else {
              return 0;
            }
          });

          return currentTokens;
        }
      }
    } catch (error) {
      toast.error("A filtragem de tokens falhou!");
      console.error("Falha ao filtrar tokens" + error);
    } finally {
      setProcessingTokensStore(false);
    }
  };

  return {
    processingTokensStore,
    filterTokensByUser,
    getTokensByServiceId,
    getAllTokens,
    registerToken,
  };
};

export default useTokensStore;
