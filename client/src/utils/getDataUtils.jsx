//Services
import api from "../services/api";

const useGetDataUtils = () => {
  const getPermissionLevels = async () => {
    try {
      const response = await api.get("/permissionsLevels");
      return response.data;
    } catch (error) {
      console.error("Falha ao obter lista de permissões!");
      console.error(error);
    }
  };

  const findIndexById = (array, key) => {
    const index = array.findIndex((item) => Number(item.id) === Number(key));
    if (index !== -1) {
      return Number(index);
    }
    return false;
  };

  return {
    getPermissionLevels,
    findIndexById,
  };
};

export default useGetDataUtils;
