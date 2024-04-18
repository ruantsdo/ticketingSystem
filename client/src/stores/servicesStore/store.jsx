//React
import { useContext, useState } from "react";

//Services
import api from "../../services/api";

//Contexts
import AuthContext from "../../contexts/auth";

//Toast
import { toast } from "react-toastify";

//Utils
import useServicesUtils from "./utils";
import useSocketUtils from "../../utils/socketUtils";

const useServicesStore = () => {
  const { currentUser, isAdmin } = useContext(AuthContext);
  const { CheckNameAvailability } = useServicesUtils();
  const { servicesUpdatedSignal } = useSocketUtils();

  const [processingServicesStore, setProcessingServicesStore] = useState(false);

  const getAllServices = async () => {
    setProcessingServicesStore(true);
    try {
      const response = await api.get("/services/query");
      return response.data;
    } catch (error) {
      toast.error(
        "Falha ao obter lista de serviços. Tente novamente em alguns instantes!"
      );
      console.error("Falha ao obter lista de serviços!");
      console.error(error);
    } finally {
      setProcessingServicesStore(false);
    }
  };

  const createNewService = async (data) => {
    if (!isAdmin) {
      toast.info("Você não tem privilégios para realizar essa ação!");
      return;
    }
    setProcessingServicesStore(true);

    const { name, description, limit } = data;
    if (!CheckNameAvailability(name)) return;
    let isSuccess = false;

    try {
      await api
        .post("/service/registration", {
          name: name,
          description: description,
          limit: limit,
          created_by: currentUser.name,
        })
        .then((response) => {
          const resp = response.data;
          if (resp === "success") {
            toast.success("Serviço cadastrado!");
            servicesUpdatedSignal();
            isSuccess = true;
          } else if (resp === "failed") {
            toast.warn(
              "Falha ao cadastrar novo serviço. Tente novamente em alguns instantes!"
            );
          } else if (resp === "already exists") {
            toast.info("Já existe um serviço com esse nome!");
          }
        });
    } catch (error) {
      console.error("Falha interna no servidor!");
      console.error(error);
    } finally {
      setProcessingServicesStore(false);
      return isSuccess;
    }
  };

  const updateService = async (data) => {
    if (!isAdmin) {
      toast.info("Você não tem privilégios para realizar essa ação!");
      return;
    }
    setProcessingServicesStore(true);
    const { id, name, desc, limit } = data;

    if (!CheckNameAvailability(id, name)) return;
    let isSuccess = false;

    try {
      await api
        .post("/service/update", {
          id: id,
          name: name,
          desc: desc,
          limit: limit,
          updated_by: currentUser.name,
        })
        .then((response) => {
          if (response.data === "success") {
            toast.success("Serviço atualizado!");
            servicesUpdatedSignal();
            isSuccess = true;
          } else if (response.data === "failed") {
            toast.error("Falha ao atualizar o serviço!");
          }
        });
    } catch (error) {
      console.error("Falha ao atualizar serviço!");
      console.error(error);
    } finally {
      setProcessingServicesStore(false);
      return isSuccess;
    }
  };

  const deleteService = async (id) => {
    if (!isAdmin) {
      toast.info("Você não tem privilégios para realizar essa ação!");
      return;
    }

    setProcessingServicesStore(true);
    let isSuccess = false;
    try {
      const response = await api.get(`/token/query/${id}`);
      const data = response.data;

      if (data.length > 0) {
        toast.warn(
          "Existem senhas vinculadas a esse serviço! Remova as senhas para o serviço e tente novamente!"
        );
        return;
      }

      await api
        .post("/service/remove", {
          id: id,
        })
        .then((response) => {
          if (response.data === "success") {
            servicesUpdatedSignal();
            toast.success("O serviço foi removido!");
            isSuccess = true;
          } else if (response.data === "failed") {
            toast.error("Falha ao remover serviço!");
          }
        });
    } catch (error) {
      toast.error("Falha ao remover o serviço!");
      console.log("Falha ao remover o serviço!");
      console.error(error);
    } finally {
      setProcessingServicesStore(false);
      return isSuccess;
    }
  };

  return {
    getAllServices,
    createNewService,
    updateService,
    deleteService,
    processingServicesStore,
  };
};

export default useServicesStore;
