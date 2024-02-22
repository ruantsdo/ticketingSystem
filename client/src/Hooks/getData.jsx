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

  const getServicesList = async () => {
    try {
      const response = await api.get("/services/query");
      return response.data;
    } catch (error) {
      console.log("Failed to get services list: " + error);
    }
  };

  const getLocationsList = async () => {
    try {
      const response = await api.get("/location/query");
      return response.data;
    } catch (error) {
      console.error("Failed to get locations list: " + error);
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
    getPermissionsLevels,
    getServicesList,
    getLocationsList,
    getVideosList,
  };
};

export default getDataHooks;
