//React
import { useContext } from "react";

//Services
import api from "../services/api";

//Contexts
import AuthContext from "../contexts/auth";

//Toast
import { toast } from "react-toastify";

//Utils
import useSocketUtils from "./socketUtils";

const useGetDataUtils = () => {
  const { currentUser } = useContext(AuthContext);
  const { usersUpdatedSignal } = useSocketUtils();

  const getPermissionLevels = async () => {
    try {
      const response = await api.get("/permissionsLevels");
      return response.data;
    } catch (error) {
      console.error("Falha ao obter lista de permissões!");
      console.error(error);
    }
  };

  return {
    getPermissionLevels,
  };
};

export default useGetDataUtils;
