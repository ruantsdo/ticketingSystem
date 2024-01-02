//Services
import api from "../../services/api";

export const useGetRoutes = () => {
  const getAllServices = async () => {
    try {
      const response = await api.get("/services/query");
      return response.data;
    } catch (error) {
      console.error("Get services error: " + error);
    }
  };

  return {
    getAllServices,
  };
};
