//Services
import api from "../../services/api";

//Toast
import { toast } from "react-toastify";

const useLocationsUtils = () => {
  const CheckNameAvailability = async (id, name) => {
    try {
      const response = await api.post(`/location/query/name/`, {
        name: name,
        id: id,
      });
      const data = response.data;
      if (data.length > 0) {
        toast.info("Já existe um local com esse nome!");
        return false;
      } else {
        return true;
      }
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

export default useLocationsUtils;
