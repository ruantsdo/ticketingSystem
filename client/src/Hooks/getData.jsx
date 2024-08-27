//Services
import api from "../services/api";

const getDataHooks = () => {
  const getHistoric = async () => {
    try {
      const response = await api.get("/getHistoric");
      return response.data;
    } catch (error) {
      console.error("Get historic error: " + error);
    }
  };

  const getVideosList = async () => {
    try {
      const response = await api.get("/videoList");
      const data = response.data.videos;

      return data;
    } catch (error) {
      console.error("Failed to get videos list: " + error);
    }
  };

  return {
    getHistoric,
    getVideosList,
  };
};

export default getDataHooks;
