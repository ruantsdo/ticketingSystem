//React
import { useContext } from "react";

//Services
import api from "../services/api";

//Contexts
import AuthContext from "../contexts/auth";

const useGetRoutes = () => {
  const { currentUser } = useContext(AuthContext);

  const getAllServices = async () => {
    try {
      const response = await api.get("/services/query");
      return response.data;
    } catch (error) {
      console.error("Get services error: " + error);
    }
  };

  const getUserServices = async () => {
    try {
      const response = await api.get(`/user_services/query/${currentUser.id}`);
      return response.data;
    } catch (error) {
      console.log("Falha ao obter serviços do usuário!");
    }
  };

  const getTokens = async () => {
    try {
      const response = await api.get("/token/query");
      return response.data;
    } catch (error) {
      console.error("Falha ao obter as senhas disponíveis: " + error);
    }
  };

  const defineFilteredTokens = async () => {
    const currentTokens = await getTokens();
    const userServices = await getUserServices();

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
  };

  return {
    getAllServices,
    getUserServices,
    getTokens,
    defineFilteredTokens,
  };
};

export default useGetRoutes;
