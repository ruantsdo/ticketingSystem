//React
import { useContext } from "react";

//Services
import api from "../../services/api";

//Contexts
import AuthContext from "../../contexts/auth";

//Toast
import { toast } from "react-toastify";

//Utils
import useGetDataUtils from "../../utils/getDataUtils";

// Stores
import useUsersStore from "./store";
import useServicesStore from "../servicesStore/store";

const useUsersUtils = () => {
  const { currentUser } = useContext(AuthContext);
  const { getUsersList, getUserServices } = useUsersStore();
  const { getAllServices } = useServicesStore();
  const { getPermissionLevels } = useGetDataUtils();

  const filterPermissionLevels = async () => {
    const permissionLevels = await getPermissionLevels();
    let filteredPermissionLevels = [];

    if (currentUser.permission_level === 3) {
      filteredPermissionLevels.push({
        id: permissionLevels[1].id,
        name: permissionLevels[1].name,
      });
    } else if (currentUser.permission_level === 4) {
      filteredPermissionLevels = [
        { id: permissionLevels[1].id, name: permissionLevels[1].name },
        { id: permissionLevels[2].id, name: permissionLevels[2].name },
      ];
    } else if (currentUser.permission_level === 5) {
      filteredPermissionLevels = permissionLevels;
    }
    return filteredPermissionLevels;
  };

  const getAllUsersServices = async () => {
    try {
      const response = await api.get("/user_services/query/full");
      return response.data;
    } catch (error) {
      console.error("Falha ao obter serviços dos usuários!");
      console.log(error);
    }
  };

  const filterUserServices = async (id) => {
    try {
      const services = await getAllServices();
      const userServices = await getUserServices(id);

      const filtered = userServices.map((userService) => {
        const foundService = services.find(
          (service) => service.id === userService.service_id
        );
        return foundService ? String(foundService.id) : null;
      });

      return filtered;
    } catch (error) {
      toast.error(
        "Falha ao obter serviços do usuário. Tente novamente am alguns instantes!"
      );
      console.error("Erro ao obter serviços do usuário.");
      console.error(error);
    }
  };

  const filterUsersList = async () => {
    const usersList = await getUsersList();

    if (currentUser.permission_level > 3) {
      return usersList;
    }

    const currentTargetServices = await getUserServices(currentUser.id);
    const allUsersServices = await getAllUsersServices();

    try {
      const filteredUsers = allUsersServices.filter((user) => {
        return currentTargetServices.some((service) => {
          return user.service_id === service.service_id;
        });
      });

      const uniqueUserIds = [
        ...new Set(filteredUsers.map((user) => user.user_id)),
      ];

      const filteredUsersList = usersList.filter((user) => {
        return uniqueUserIds.some((uniqueUser) => {
          return user.id === uniqueUser;
        });
      });

      return filteredUsersList;
    } catch (error) {
      console.log(error);
    }
  };

  return {
    filterPermissionLevels,
    filterUsersList,
    getAllUsersServices,
    filterUserServices,
  };
};

export default useUsersUtils;
