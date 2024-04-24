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
import { useUserStore } from "../";

const useTokensStore = () => {
  const { currentUser, isAdmin } = useContext(AuthContext);
  const { getUserServices } = useUserStore();
  const {} = useSocketUtils();

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

  const FilterTokensByUser = async (id) => {
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
    FilterTokensByUser,
    getAllTokens,
  };
};

export default useTokensStore;
