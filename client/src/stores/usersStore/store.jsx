//React
import { useContext, useState } from "react";
//Services
import api from "../../services/api";
//Contexts - Providers
import AuthContext from "../../contexts/auth";
import { useConfirmIdentity } from "../../providers/confirmIdentity";
//Toast
import { toast } from "react-toastify";
//Utils
import useSocketUtils from "../../utils/socketUtils";
//Stores
import useSettingsStore from "../settingsStore/store";

const useUsersStore = () => {
  const { currentUser, isAdmin } = useContext(AuthContext);
  const { requestAuth } = useConfirmIdentity();
  const { usersUpdatedSignal, disconnectUserSignal } = useSocketUtils();
  const { getFullSettings } = useSettingsStore();

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

    requestAuth(async (userLevel) => {
      setProcessingUserStore(true);

      if (userLevel < 4) {
        toast.info("Este usuário não tem as permissões necessárias!");
        return;
      }

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
      } catch (error) {
        toast.error(
          "Falha ao cadastrar novo usuário. Tente novamente em alguns instantes"
        );
        console.error("Falha ao criar usuário");
        console.error(error);
      } finally {
        setProcessingUserStore(false);
      }
    });
  };

  const createNewUserSolicitation = async (data) => {
    setProcessingUserStore(true);

    const settings = await getFullSettings();
    const autoAprove = settings.autoAprove;

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
          status: autoAprove,
        })
        .then((response) => {
          if (response.data === "New user created") {
            usersUpdatedSignal();
            if (autoAprove) {
              toast.success("Conta criada!");
            } else {
              toast.success("Sua solicitação foi enviada!");
            }
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
    const {
      id,
      name,
      email,
      cpf,
      permission,
      password,
      services,
      passwordChanged,
      status,
      currentLevel,
      currentStatus,
    } = data;

    if (!isAdmin && id !== currentUser.id) {
      toast.info("Você não tem privilégios para realizar essa ação!");
      return;
    }

    requestAuth(async (userLevel, userId) => {
      if (userLevel < 4) {
        toast.info("Este usuário não tem as permissões necessárias!");
        return;
      }

      if (id === 1 && userId !== 1) {
        toast.info(
          "Você tem não privilégios suficientes para alterar este usuário!"
        );
        return;
      }

      if (currentLevel > userLevel) {
        toast.info(
          "Você tem não privilégios suficientes para alterar este usuário!"
        );
        return;
      }

      if (currentLevel === userLevel && id !== userId) {
        if (userId !== 1) {
          toast.info("Este usuário não pode ser alterado por você!");
          return;
        }
      }

      setProcessingUserStore(true);

      try {
        await api
          .post("/users/update", {
            id: id,
            name: name,
            email: email,
            cpf: cpf,
            level: permission,
            updated_by: currentUser.name,
            password: password,
            services: services,
            passwordChanged: passwordChanged,
            status: status,
          })
          .then(async (response) => {
            if (response.data === "success") {
              usersUpdatedSignal();
              toast.success(`O usuário "${name}" foi atualizado!`);

              if (!status && currentStatus) {
                disconnectUserSignal(id);
                toast.info(`O usuário será desconectado...`);
              }
            } else if (response.data === "failed") {
              toast.error(
                "Falha ao atualizar usuário! Tente novamente am alguns instantes"
              );
            } else if (response.data === "User already exists") {
              toast.warn("Este CPF já está em uso!");
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
    });
  };

  const deleteUser = async (data) => {
    const { id, currentLevel } = data;

    if (!isAdmin) {
      toast.info("Você não tem privilégios para realizar essa ação!");
      return;
    }

    if (id === 1) {
      toast.warn("Esse usuário não pode ser removido!");
      setProcessingUserStore(false);
      return;
    }

    requestAuth(async (userLevel, userId) => {
      if (id === 1) {
        toast.warn("Esse usuário não pode ser removido!");
        setProcessingUserStore(false);
        return;
      }

      if (userLevel < 4) {
        toast.info("Este usuário não tem as permissões necessárias!");
        return;
      }

      if (currentLevel > userLevel) {
        toast.info(
          "Você tem não privilégios suficientes para alterar este usuário!"
        );
        return;
      }

      if (currentLevel === userLevel && userId !== 1) {
        toast.info("Este usuário não pode ser alterado por você!");
        return;
      }

      setProcessingUserStore(true);

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
              toast.info("O usuário será desconectado!");
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
    });
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
