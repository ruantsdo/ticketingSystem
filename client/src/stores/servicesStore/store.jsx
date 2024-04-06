//React
import { useContext } from "react";

//Services
import api from "../../services/api";

//Contexts
import AuthContext from "../../contexts/auth";

//Toast
import { toast } from "react-toastify";

const useServicesStore = () => {
  const { currentUser } = useContext(AuthContext);

  const getAllServices = async () => {
    try {
      const response = await api.get("/services/query");
      return response.data;
    } catch (error) {
      toast.error(
        "Falha ao obter lista de serviços. Tente novamente em alguns instantes!"
      );
      console.error("Falha ao obter lista de serviços!");
      console.error(error);
    }
  };

  return {
    getAllServices,
  };
};

export default useServicesStore;
