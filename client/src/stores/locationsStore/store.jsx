//React
import { useContext, useState } from "react";

//Services
import api from "../../services/api";

//Contexts
import AuthContext from "../../contexts/auth";

//Toast
import { toast } from "react-toastify";

//Utils
import useSocketUtils from "../../utils/socketUtils";
import useLocationsUtils from "./utils";

const useLocationsStore = () => {
  const { currentUser, isAdmin } = useContext(AuthContext);

  const { locationsUpdatedSignal } = useSocketUtils();
  const { CheckNameAvailability } = useLocationsUtils();

  const [processingLocationsStore, setProcessingLocationsStore] =
    useState(false);

  const getLocationsList = async () => {
    setProcessingLocationsStore(true);
    try {
      const response = await api.get("/location/query");
      return response.data;
    } catch (error) {
      toast.error("Erro ao obter lista de locais!");
      console.error("Erro ao obter lista de locais!");
      console.error(error);
    } finally {
      setProcessingLocationsStore(false);
    }
  };

  const getActivesLocations = async () => {
    setProcessingLocationsStore(true);
    try {
      const response = await api.get("/location/query/actives");
      return response.data;
    } catch (error) {
      toast.error("Erro ao obter lista de locais!");
      console.error("Erro ao obter lista de locais!");
      console.error(error);
    } finally {
      setProcessingLocationsStore(false);
    }
  };

  const removeLocation = async (id) => {
    if (!isAdmin) {
      toast.info("Você não tem privilégios para realizar essa ação!");
      return;
    }

    setProcessingLocationsStore(true);
    try {
      await api
        .post("/location/remove", {
          id: id,
        })
        .then((response) => {
          if (response.data === "success") {
            toast.success("O local foi removido!");
            locationsUpdatedSignal();
          } else if (response.data === "failed") {
            toast.error("Falha ao remover local!");
          }
        });
    } catch (error) {
      console.error("Falha ao remover local designado!");
      console.error(error);
    } finally {
      setProcessingLocationsStore(false);
    }
  };

  const updateLocation = async (data) => {
    if (!isAdmin) {
      toast.info("Você não tem privilégios para realizar essa ação!");
      return;
    }

    setProcessingLocationsStore(true);
    const { id, name, description, tables, status } = data;
    if (!CheckNameAvailability(id, name)) return;
    let isSuccess = false;
    try {
      await api
        .post("/location/update", {
          id: id,
          name: name,
          description: description,
          tables: tables,
          updated_by: currentUser.name,
          status: status,
        })
        .then((response) => {
          if (response.data === "success") {
            toast.success("Local atualizado!");
            locationsUpdatedSignal();
            isSuccess = true;
          } else if (response.data === "failed") {
            toast.error("Falha ao atualizar o local!");
          }
        });
    } catch (error) {
      console.error(error);
    } finally {
      setProcessingLocationsStore(false);
      return isSuccess;
    }
  };

  const createNewLocation = async (data) => {
    if (!isAdmin) {
      toast.info("Você não tem privilégios para realizar essa ação!");
      return;
    }

    setProcessingLocationsStore(true);
    const { name, description, tables } = data;
    if (!CheckNameAvailability(name)) return;
    let isSuccess = false;
    try {
      await api
        .post("/location/registration", {
          name: name,
          description: description,
          tables: tables,
          created_by: currentUser.name,
        })
        .then((response) => {
          const resp = response.data;
          if (resp === "success") {
            toast.success("Local cadastrado!");
            locationsUpdatedSignal();
            isSuccess = true;
          } else if (resp === "failed") {
            toast.warn(
              "Falha ao cadastrar novo local. Tente novamente em alguns instantes!"
            );
          } else if (resp === "already exists") {
            toast.info("Já existe um local com esse nome!");
          } else {
            toast.error(
              "Falha interna no servidor. Tente novamente mais tarde!"
            );
          }
        });
    } catch (error) {
      console.error("Falha interna no servidor!");
      console.error(error);
    } finally {
      setProcessingLocationsStore(false);
      return isSuccess;
    }
  };

  return {
    processingLocationsStore,
    createNewLocation,
    getLocationsList,
    getActivesLocations,
    removeLocation,
    updateLocation,
  };
};

export default useLocationsStore;
