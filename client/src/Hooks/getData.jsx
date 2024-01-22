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

  const getPermissionsLevels = async () => {
    try {
      const response = await api.get("/permissionsLevels");
      return response.data;
    } catch (error) {
      console.error("Get permissions levels error: " + error);
    }
  };

  return {
    getHistoric,
    getPermissionsLevels,
  };
};

export default getDataHooks;
