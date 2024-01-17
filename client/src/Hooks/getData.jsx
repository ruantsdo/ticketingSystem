//Services
import api from "../services/api";

const getDataHooks = () => {
  const getHistoric = async () => {
    try {
      const response = await api.get("/getHistoric");
      return response.data;
    } catch (error) {
      console.error("Get services error: " + error);
    }
  };

  return {
    getHistoric,
  };
};

export default getDataHooks;
