//Services
import api from "../../services/api";

//Toast
import { toast } from "react-toastify";

const useServicesUtils = () => {
  const CheckNameAvailability = async (name, id) => {
    try {
      const response = await api.post("/services/query/name", {
        name: name,
        id: id ? id : null,
      });
      const data = response.data;
      if (data.length > 0) {
        toast.info("Já existe um serviço com esse nome!");
        return false;
      }
      return true;
    } catch (error) {
      toast.error("Falha ao checar a disponibilidade do nome!");
      console.error("Falha ao checar a disponibilidade do nome!");
      console.error(error);
    }
  };

  return {
    CheckNameAvailability,
  };
};

export default useServicesUtils;
