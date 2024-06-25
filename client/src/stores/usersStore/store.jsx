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

const useUsersStore = () => {
  const { currentUser, isAdmin } = useContext(AuthContext);
  const { usersUpdatedSignal, disconnectUserSignal } = useSocketUtils();

  const [processingUserStore, setProcessingUserStore] = useState(false);

  const getUsersList = async () => {
    setProcessingUserStore(true);
    try {
      const response = await api.get("/users/query/full");
      return response.data;
    } catch (error) {
      toast.error(
        "Erro ao obter lista de usuários!. Tente novamente em alguns instantes!"
      );
      console.error("Erro ao obter lista de usuários!");
      console.error(error);
    } finally {
      setProcessingUserStore(false);
    }
  };

  const getUserByEmail = async (email) => {
    try {
      const response = await api.get(`/users/query/email/${email}`);
      return response.data;
    } catch (error) {
      toast.error(
        "Falha ao checar email. Tente novamente em alguns instantes!"
      );
      console.error("Falha ao checar disponibilidade do email!");
      console.error(error);
    }
  };

  const getUserByCPF = async (cpf) => {
    setProcessingUserStore(true);
    try {
      const response = await api.get(`/users/query/cpf/${cpf}`);
      return response.data;
    } catch (error) {
      toast.error(
        "Falha ao verificar cpf. Tente novamente em alguns instantes!"
      );
      console.error("Falha ao verificar disponibilidade do cpf!");
      console.error(error);
    }
  };

  const getUserServices = async (id) => {
    setProcessingUserStore(true);
    try {
      const response = await api.get(`/user_services/query/${id}`);
      return response.data;
    } catch (error) {
      toast.error(
        "Falha ao obter serviços do usuário. Tente novamente em alguns instantes!"
      );
      console.error("Falha ao obter serviços do usuário!");
      console.error(error);
    } finally {
      setProcessingUserStore(false);
    }
  };

  const createNewUser = async (data) => {
    if (!isAdmin) {
      toast.info("Você não tem privilégios para realizar essa ação!");
      return;
    }

    setProcessingUserStore(true);

    if (
      !data.cpf ||
      !data.name ||
      !data.password ||
      !data.permission ||
      !data.services
    ) {
      toast.info(`Campos com * são obrigatórios!`);
      setProcessingUserStore(false);
      return;
    }

    if (data.email) {
      const result = await getUserByEmail(data.email);
      const users = result.some((user) => {
        return user.cpf !== data.cpf;
      });
      if (users) {
        toast.info("Este email já está em uso!");
        setProcessingUserStore(false);
        return;
      }
    }

    try {
      await api
        .post("/user/registration", {
          name: data.name,
          email: data.email,
          cpf: data.cpf,
          services: data.services,
          permissionLevel: data.permission,
          password: data.password,
          created_by: currentUser.name,
          status: 1,
        })
        .then((response) => {
          if (response.data === "New user created") {
            usersUpdatedSignal();
            toast.success("Novo usuário cadastrado!");
          } else if (response.data === "User already exists") {
            toast.info("Já existe um cadastrado usuário com esse CPF!");
          } else {
            toast.error(
              "Houve um problema ao cadastrar o novo usuário! Tente novamente em alguns instantes!"
            );
          }
        });
      return true;
    } catch (error) {
      toast.error(
        "Falha ao cadastrar novo usuário. Tente novamente em alguns instantes"
      );
      console.error("Falha ao criar usuário");
      console.error(error);
      return false;
    } finally {
      setProcessingUserStore(false);
    }
  };

  const createNewUserSolicitation = async (data) => {
    setProcessingUserStore(true);
    let status = false;

    if (
      !data.cpf ||
      !data.name ||
      !data.password ||
      !data.permission ||
      !data.services
    ) {
      toast.info(`Campos com * são obrigatórios!`);
      setProcessingUserStore(false);
      return status;
    }

    if (data.email) {
      const result = await getUserByEmail(data.email);
      const users = result.some((user) => {
        return user.cpf !== data.cpf;
      });
      if (users) {
        toast.info("Este email já está em uso!");
        setProcessingUserStore(false);
        return status;
      }
    }

    try {
      await api
        .post("/user/registration", {
          name: data.name,
          email: data.email,
          cpf: data.cpf,
          services: data.services,
          permissionLevel: data.permission,
          password: data.password,
          created_by: "SOLICITAÇÃO",
          status: 0,
        })
        .then((response) => {
          if (response.data === "New user created") {
            usersUpdatedSignal();
            toast.success("Sua solicitação foi enviada!");
            status = true;
          } else if (response.data === "User already exists") {
            toast.info("Já existe um usuário com esse CPF!");
          } else {
            toast.error(
              "Houve um problema ao cadastrar sua solicitação! Tente novamente em alguns instantes!"
            );
          }
        });
    } catch (error) {
      toast.error(
        "Falha criar sua solicitação. Tente novamente em alguns instantes"
      );
      console.error("Falha na solicitação de novo usuário");
      console.error(error);
      return false;
    } finally {
      setProcessingUserStore(false);
      return status;
    }
  };

  const updateUser = async (data) => {
    if (!isAdmin && data.id !== currentUser.id) {
      toast.info("Você não tem privilégios para realizar essa ação!");
      return;
    }

    setProcessingUserStore(true);

    try {
      await api
        .post("/users/update", {
          id: data.id,
          name: data.name,
          email: data.email,
          cpf: data.cpf,
          level: data.permission,
          updated_by: currentUser.name,
          password: data.password,
          services: data.services,
          passwordChanged: data.passwordChanged,
          status: data.status,
        })
        .then(async (response) => {
          if (response.data === "success") {
            usersUpdatedSignal();
            toast.success("Usuário atualizado!");
          } else if (response.data === "failed") {
            toast.error(
              "Falha ao atualizar usuário! Tente novamente am alguns instantes"
            );
          }
          if (!data.status) {
            disconnectUserSignal(data.id);
            toast.info(`O usuário ${data.name} será desconectado... `);
          }
        });
    } catch (error) {
      toast.error(
        "Falha ao atualizar usuário. Tente novamente em alguns instantes"
      );
      console.error("Falha ao atualizar usuário.");
      console.error(error);
    } finally {
      setProcessingUserStore(false);
    }
  };

  const deleteUser = async (id) => {
    if (!isAdmin) {
      toast.info("Você não tem privilégios para realizar essa ação!");
      return;
    }

    setProcessingUserStore(true);

    if (id === 1) {
      toast.warn("Esse usuário não pode ser removido!");
      setProcessingUserStore(false);
      return;
    }

    try {
      await api
        .post("/users/remove", {
          id: id,
        })
        .then((response) => {
          if (response.data === "success") {
            usersUpdatedSignal();
            disconnectUserSignal(id);
            toast.success("O usuário foi removido!");
          } else if (response.data === "failed") {
            toast.error("Falha ao remover usuário!");
          }
        });
    } catch (error) {
      toast.error("Falha ao remover usuário!");
      console.error("Falha ao remover usuário!");
      console.error(error);
    } finally {
      setProcessingUserStore(false);
    }
  };

  return {
    getUserServices,
    getUsersList,
    getUserByEmail,
    getUserByCPF,
    createNewUser,
    createNewUserSolicitation,
    updateUser,
    deleteUser,
    processingUserStore,
  };
};

export default useUsersStore;
