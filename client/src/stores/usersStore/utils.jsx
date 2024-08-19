//React
import { useContext } from "react";

//Services
import api from "../../services/api";

//Contexts
import AuthContext from "../../contexts/auth";

//Utils
import useGetDataUtils from "../../utils/getDataUtils";

// Stores
import useUsersStore from "./store";

const useUsersUtils = () => {
  const { currentUser } = useContext(AuthContext);
  const { getUsersList, getUserServices } = useUsersStore();
  const { getPermissionLevels } = useGetDataUtils();

  const filterPermissionLevels = async () => {
    const permissionLevels = await getPermissionLevels();
    let filteredPermissionLevels = [];

    if (!currentUser) {
      filteredPermissionLevels = [
        { id: permissionLevels[1].id, name: permissionLevels[1].name },
        { id: permissionLevels[2].id, name: permissionLevels[2].name },
      ];

      return filteredPermissionLevels;
    }

    if (currentUser.permission_level === 3) {
      filteredPermissionLevels.push({
        id: permissionLevels[1].id,
        name: permissionLevels[1].name,
      });
    } else if (currentUser.permission_level === 4) {
      filteredPermissionLevels = [
        { id: permissionLevels[0].id, name: permissionLevels[0].name },
        { id: permissionLevels[1].id, name: permissionLevels[1].name },
        { id: permissionLevels[2].id, name: permissionLevels[2].name },
        { id: permissionLevels[3].id, name: permissionLevels[3].name },
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
  };
};

export default useUsersUtils;
