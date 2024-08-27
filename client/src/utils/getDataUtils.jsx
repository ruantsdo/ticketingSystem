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

  const findIndexById = async (array, key) => {
    const index = array.findIndex((item) => Number(item.id) === Number(key));
    if (index !== -1) {
      return Number(index);
    }
    return false;
  };

  function removeAccents(text) {
    return text
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toUpperCase();
  }

  return {
    getPermissionLevels,
    findIndexById,
    removeAccents,
  };
};

export default useGetDataUtils;
