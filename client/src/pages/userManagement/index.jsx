//React
import { useState, useEffect, useMemo, useContext } from "react";

//Components
import { Divider, FullContainer, Button, Input } from "../../components";

//NextUI
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Pagination,
  useDisclosure,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Spinner,
  Select,
  SelectItem,
} from "@nextui-org/react";

//Icons
import EditIcon from "@mui/icons-material/Edit";
import DeleteForeverIcon from "@mui/icons-material/DeleteForever";
import AddIcon from "@mui/icons-material/Add";
import HowToRegIcon from "@mui/icons-material/HowToReg";

//Contexts
import AuthContext from "../../contexts/auth";
import { useWebSocket } from "../../contexts/webSocket";

//Services
import api from "../../services/api";

//Toast
import { toast } from "react-toastify";

//Hooks
import useGetUserInfo from "../../Hooks/getUserInfos";

function UserManagement() {
  const { socket } = useWebSocket();
  const { getUserServices } = useGetUserInfo();

  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const [addUserIsOpen, setAddUserIsOpen] = useState(false);
  const { currentUser } = useContext(AuthContext);

  const [currentTargetName, setCurrentTargetName] = useState("");
  const [currentTargetEmail, setCurrentTargetEmail] = useState("");
  const [currentTargetCPF, setCurrentTargetCPF] = useState("");
  const [currentTargetLevel, setCurrentTargetLevel] = useState("");
  const [currentTargetPassword, setCurrentTargetPassword] = useState("");
  const [currentTargetNewPassword, setCurrentTargetNewPassword] = useState("");
  const [currentTargetNewPasswordConfirm, setCurrentTargetNewPasswordConfirm] =
    useState("");

  const [isAdmin, setIsAdmin] = useState(false);

  const [services, setServices] = useState();
  const [filteredPermissionLevels, setFilteredPermissionLevels] = useState();
  const [selectedServices, setSelectedServices] = useState([]);
  const [selectedPermission, setSelectedPermission] = useState();

  const [users, setUsers] = useState([]);
  const [page, setPage] = useState(1);
  const [itemKey, setItemKey] = useState();

  const rowsPerPage = 5;

  const pages = Math.ceil(users.length / rowsPerPage);

  const items = useMemo(() => {
    const start = (page - 1) * rowsPerPage;
    const end = start + rowsPerPage;

    return users.slice(start, end);
  }, [page, users]);

  const findIndexById = (key) => {
    for (let i = 0; i < users.length; i++) {
      // eslint-disable-next-line
      if (users[i].id == key) {
        filterUserServices(users[i].id);
        setItemKey(i);
        updateStates(i);
        return;
      }
    }
  };

  const checkLevel = () => {
    if (currentUser.permission_level > 2) {
      setIsAdmin(true);
    } else {
      setIsAdmin(false);
    }
  };

  const handleServices = async () => {
    try {
      const response = await api.get("/services/query");
      setServices(response.data);
    } catch (error) {
      console.error(error);
    }
  };

  const handlePermissionsLevels = async () => {
    try {
      const response = await api.get("/permissionsLevels");
      defineFilteredPermissionLevels(response.data);
    } catch (error) {
      console.error(error);
    }
  };

  const defineFilteredPermissionLevels = (data) => {
    let filteredPermissionLevels = [];

    if (currentUser.permission_level === 3) {
      filteredPermissionLevels.push({ id: data[1].id, name: data[1].name });
    } else if (currentUser.permission_level === 4) {
      filteredPermissionLevels = [
        { id: data[1].id, name: data[1].name },
        { id: data[2].id, name: data[2].name },
      ];
    } else if (currentUser.permission_level === 5) {
      filteredPermissionLevels = data;
    }

    setFilteredPermissionLevels(filteredPermissionLevels);
  };

  const handleCreateNewUser = async () => {
    if (
      !currentTargetCPF ||
      !currentTargetName ||
      !currentTargetNewPassword ||
      !selectedPermission ||
      !selectedServices
    ) {
      toast.info(`Campos com * são obrigatórios!`);
    } else {
      if (currentTargetEmail) {
        const duplicateUsers = users.filter(
          (user) => user.email === currentTargetEmail
        );

        if (duplicateUsers.length) {
          toast.info("Já existe um usuário com esse Email!");
          return;
        }
      }

      if (currentTargetNewPasswordConfirm === currentTargetNewPassword) {
        try {
          await api
            .post("/user/registration", {
              name: currentTargetName,
              email: currentTargetEmail,
              cpf: currentTargetCPF,
              services: selectedServices,
              permissionLevel: selectedPermission,
              password: currentTargetNewPassword,
              created_by: currentUser.name,
            })
            .then((response) => {
              if (response.data === "New user created") {
                emitSignal();
                clearStates();
                toast.success("Novo usuário cadastrado!");
                setAddUserIsOpen(false);
              } else if (response.data === "User already exists") {
                toast.info("Já existe um cadastrado usuário com esse CPF!");
              } else {
                toast.error(
                  "Houve um problema ao cadastrar o novo usuário! Tente novamente em alguns instantes!"
                );
                clearStates();
                setAddUserIsOpen(false);
              }
            });
        } catch (err) {
          console.log(err);
        }
      } else {
        toast.info("As senhas devem ser iguais!");
      }
    }
  };

  const handleUsersServices = async () => {
    try {
      const response = await api.get("/user_services/query/full");
      return response.data;
    } catch (error) {
      console.log(error);
    }
  };

  const handleUsersList = async () => {
    try {
      const response = await api.get("/users/query/full");
      filterUsers(response.data);
    } catch (error) {
      console.log(error);
    }
  };

  const filterUsers = async (usersList) => {
    if (currentUser.permission_level > 3) {
      setUsers(usersList);
    } else {
      const currentTargetServices = await getUserServices(currentUser.id);
      const userServices = await handleUsersServices();
      try {
        const filteredUsers = userServices.filter((user) => {
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

        setUsers(filteredUsersList);
      } catch (error) {
        console.log(error);
      }
    }
  };

  const checkUserCpf = async (id) => {
    const duplicateUsers = users.filter(
      (user) => user.cpf === currentTargetCPF
    );

    if (duplicateUsers.length > 0) {
      const checkId = duplicateUsers.some((user) => user.id !== id);
      if (checkId) {
        toast.info("Já existe um usuário com esse CPF!");
      } else {
        await checkUserEmail(id);
      }
    } else {
      await checkUserEmail(id);
    }
  };

  const checkUserEmail = async (id) => {
    const duplicateUsers = users.filter(
      (user) => user.email === currentTargetEmail
    );

    if (duplicateUsers.length > 0) {
      const checkId = duplicateUsers.some((user) => user.id !== id);
      if (checkId) {
        toast.info("Já existe um usuário com esse Email!");
      } else {
        await updateUser(id);
      }
    } else {
      await updateUser(id);
    }
  };

  const removeUser = async (id) => {
    if (id === 1) {
      toast.warn("Esse usuário não pode ser removido!");
      return;
    }

    try {
      await api
        .post("/users/remove", {
          id: id,
        })
        .then((response) => {
          if (response.data === "success") {
            emitSignal();
            toast.success("O usuário foi removido!");
          } else if (response.data === "failed") {
            toast.error("Falha ao remover usuário!");
          }
        });
    } catch (error) {
      console.error(error);
    }
  };

  const updateUser = async (id) => {
    let passwordChanged = false;

    if (currentTargetNewPassword) {
      passwordChanged = true;
    }

    try {
      await api
        .post("/users/update", {
          id: id,
          name: currentTargetName,
          email: currentTargetEmail,
          cpf: currentTargetCPF,
          level: currentTargetLevel,
          updated_by: currentUser.name,
          password: currentTargetNewPassword
            ? currentTargetNewPassword
            : currentTargetPassword,
          passwordChanged: passwordChanged,
          services: selectedServices,
        })
        .then(async (response) => {
          if (response.data === "success") {
            emitSignal();
            toast.success("Usuário atualizado!");
            clearStates();
          } else if (response.data === "failed") {
            toast.error("Falha ao atualizar usuário!");
          }
        });
    } catch (error) {
      console.error(error);
    }
  };

  const updateStates = (id) => {
    setCurrentTargetName(users[id].name);
    setCurrentTargetEmail(users[id].email);
    setCurrentTargetCPF(users[id].cpf);
    setCurrentTargetLevel(users[id].permission_level);
    setCurrentTargetPassword(users[id].password);
  };

  const clearStates = () => {
    setCurrentTargetName(null);
    setCurrentTargetEmail(null);
    setCurrentTargetCPF(null);
    setCurrentTargetLevel(null);
    setCurrentTargetPassword(null);
    setCurrentTargetNewPassword(null);
    setCurrentTargetNewPasswordConfirm(null);
    setSelectedServices([]);
    setSelectedPermission(null);
  };

  const filterUserServices = async (id) => {
    try {
      const response = await getUserServices(id);

      const filtered = response.map((resp) => {
        const foundService = services.find(
          (service) => service.id === resp.service_id
        );
        return foundService ? String(foundService.id) : null;
      });

      setSelectedServices(filtered);
    } catch (error) {
      console.error("Erro ao obter serviços do usuário:", error);
    }
  };

  const getInitialData = async () => {
    await handleServices();
    await handlePermissionsLevels();
    await handleUsersList();
    await checkLevel();
  };

  const emitSignal = () => {
    socket.emit("users_updated");
  };

  useEffect(() => {
    getInitialData();

    socket.on("users_updated", async () => {
      await handleUsersList();
    });

    return () => {
      socket.off("users_updated");
    };

    // eslint-disable-next-line
  }, []);

  return (
    <FullContainer>
      <div className="flex flex-col w-full sm:w-[95%]">
        <div className="flex flex-col gap-2 justify-end sm:flex-row">
          <Button
            mode="success"
            className="mb-1 sm:max-w-xs border-none shadow-none p-5 w-fit"
            startContent={<AddIcon />}
            onPress={() => setAddUserIsOpen(true)}
          >
            Novo usuário
          </Button>
        </div>
        <Table
          aria-label="Lista de usuários"
          onRowAction={(key) => {
            findIndexById(key);
            onOpen();
          }}
          isStriped
          bottomContent={
            <div className="flex w-full justify-center">
              <Pagination
                loop
                isCompact
                showControls
                siblings={1}
                boundaries={1}
                color="success"
                initialPage={1}
                page={page}
                total={pages}
                onChange={(page) => setPage(page)}
              />
            </div>
          }
          classNames={{
            wrapper: "min-h-[222px]",
          }}
          className="w-full"
        >
          <TableHeader>
            <TableColumn className="w-1/12">ID</TableColumn>
            <TableColumn>USUÁRIO</TableColumn>
            <TableColumn>AÇÕES</TableColumn>
          </TableHeader>
          <TableBody
            items={items}
            emptyContent={
              users.length > 0 ? (
                <Spinner size="lg" label="Carregando..." color="primary" />
              ) : (
                <div className="flex flex-col text-sm">
                  <Spinner
                    size="sm"
                    color="success"
                    label="Ainda não há usuários disponíveis..."
                  />
                  Atualize a página para buscar por atualizações...
                </div>
              )
            }
          >
            {(item) => (
              <TableRow
                key={`${item.id}`}
                className="hover:cursor-pointer hover:opacity-90 hover:ring-2 rounded-lg hover:shadow-md hover:scale-[101%] transition-all"
              >
                <TableCell>{item.id}</TableCell>
                <TableCell>{item.name}</TableCell>
                <TableCell className="w-1/12">
                  {
                    <div className="flex flex-row w-full h-7 items-center justify-around">
                      <Button
                        isIconOnly
                        mode="success"
                        className="w-5 rounded-full scale-80"
                        onPress={() => {
                          findIndexById(item.id);
                          onOpen();
                        }}
                      >
                        <EditIcon fontSize="small" />
                      </Button>
                      <Button
                        isIconOnly
                        mode="failed"
                        className="w-5 rounded-full scale-80"
                        onPress={() => {
                          removeUser(item.id);
                        }}
                      >
                        <DeleteForeverIcon fontSize="small" />
                      </Button>
                    </div>
                  }
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <Modal
        isOpen={isOpen}
        onOpenChange={() => {
          onOpenChange();
        }}
        onClose={() =>
          setTimeout(() => {
            clearStates();
          }, 300)
        }
        backdrop="opaque"
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1 justify-center items-center font-semibold">
                <section className="flex flex-col gap-1 justify-center items-center">
                  <h1>Dados do usuário</h1>
                  <h6>
                    Criado por: {users[itemKey].created_by} em{" "}
                    {users[itemKey].created_at}
                  </h6>
                  {users[itemKey].updated_by ? (
                    <h6>
                      Atualizado por: {users[itemKey].updated_by} em{" "}
                      {users[itemKey].updated_at}
                    </h6>
                  ) : (
                    <h6>Este usuário ainda não foi atualizado</h6>
                  )}
                </section>
              </ModalHeader>
              <Divider />
              <ModalBody>
                <Input
                  isReadOnly={!isAdmin}
                  variant="underlined"
                  size="sm"
                  className="border-none"
                  label="NOME"
                  defaultValue={users[itemKey].name}
                  onChange={(e) => setCurrentTargetName(e.target.value)}
                />
                <Input
                  isReadOnly={!isAdmin}
                  variant="underlined"
                  size="sm"
                  className="border-none"
                  label="EMAIL"
                  defaultValue={users[itemKey].email}
                  onChange={(e) => setCurrentTargetEmail(e.target.value)}
                />
                <Input
                  isReadOnly={!isAdmin}
                  variant="underlined"
                  className="border-none"
                  size="sm"
                  label="CPF"
                  maxLength="11"
                  defaultValue={users[itemKey].cpf}
                  onChange={(e) => setCurrentTargetCPF(e.target.value)}
                />
                <Input
                  isReadOnly={!isAdmin}
                  variant="underlined"
                  className="border-none"
                  size="sm"
                  type="password"
                  label="SENHA (Deixe em branco para manter a atual)"
                  onChange={(e) => {
                    setCurrentTargetNewPassword(e.target.value);
                  }}
                />

                <Select
                  isRequired
                  isDisabled={users[itemKey].id === 1}
                  isReadOnly={!isAdmin}
                  variant="underlined"
                  size="sm"
                  className="border-none"
                  items={filteredPermissionLevels}
                  selectionMode="single"
                  label="Nível de permissão"
                  placeholder="Nível de permissão desta pessoa"
                  name="permissionLevel"
                  selectedKeys={String(currentTargetLevel)}
                  onSelectionChange={(values) => {
                    setCurrentTargetLevel(values.currentKey);
                  }}
                >
                  {(filteredPermissionLevels) => (
                    <SelectItem
                      key={filteredPermissionLevels.id}
                      value={filteredPermissionLevels.id}
                    >
                      {filteredPermissionLevels.name}
                    </SelectItem>
                  )}
                </Select>

                <Select
                  isReadOnly={!isAdmin}
                  isDisabled={users[itemKey].id === 1}
                  variant="underlined"
                  size="sm"
                  className="border-none"
                  selectionMode="multiple"
                  label="Serviços do usuário"
                  selectedKeys={selectedServices}
                  onSelectionChange={(values) => {
                    setSelectedServices(Array.from(values));
                  }}
                >
                  {services.map((service) => (
                    <SelectItem key={service.id} value={service.id}>
                      {service.name}
                    </SelectItem>
                  ))}
                </Select>
              </ModalBody>

              <Divider />
              <ModalFooter className="flex justify-between align-middle">
                <Button
                  className="bg-transparent text-failed w-15"
                  onPress={async () => {
                    await removeUser(users[itemKey].id);
                    onClose();
                  }}
                  startContent={<DeleteForeverIcon />}
                >
                  DELETAR
                </Button>
                <div className="flex flex-row items-center justify-end w-full gap-3">
                  <Button
                    mode="failed"
                    className="w-10"
                    onPress={() => {
                      onClose();
                    }}
                  >
                    Fechar
                  </Button>
                  <Button
                    mode="success"
                    className="w-10"
                    onPress={async () => {
                      await checkUserCpf(users[itemKey].id);
                      onClose();
                    }}
                  >
                    Salvar
                  </Button>
                </div>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>

      <Modal
        isOpen={addUserIsOpen}
        onOpenChange={() => setAddUserIsOpen(!addUserIsOpen)}
        onClose={() => clearStates()}
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1 text-center">
                Adicionar novo usuário
              </ModalHeader>
              <Divider />
              <ModalBody>
                <Input
                  isRequired
                  variant="underlined"
                  size="sm"
                  className="border-none"
                  label="NOME"
                  value={currentTargetName || ""}
                  onChange={(e) => setCurrentTargetName(e.target.value)}
                />
                <Input
                  variant="underlined"
                  size="sm"
                  className="border-none"
                  label="EMAIL"
                  value={currentTargetEmail || ""}
                  onChange={(e) => setCurrentTargetEmail(e.target.value)}
                />
                <Input
                  isRequired
                  variant="underlined"
                  className="border-none"
                  size="sm"
                  label="CPF"
                  maxLength={11}
                  value={currentTargetCPF || ""}
                  onChange={(e) => setCurrentTargetCPF(e.target.value)}
                />
                <Select
                  isRequired
                  variant="underlined"
                  size="sm"
                  className="border-none"
                  selectionMode="multiple"
                  items={services}
                  label="Indique os serviços que este usuário prestará"
                  placeholder={
                    services.length > 0
                      ? "Selecione pelo menos um serviço"
                      : "Não há serviços cadastrados no momento..."
                  }
                  name="service"
                  selectedKeys={selectedServices}
                  onSelectionChange={(values) => {
                    setSelectedServices(Array.from(values));
                  }}
                >
                  {(service) => (
                    <SelectItem key={service.id} value={service.name}>
                      {service.name}
                    </SelectItem>
                  )}
                </Select>
                <Select
                  isRequired
                  variant="underlined"
                  size="sm"
                  className="border-none"
                  items={filteredPermissionLevels}
                  selectionMode="single"
                  label="Nível de permissão"
                  placeholder="Indique nível de permissão desta pessoa"
                  name="permissionLevel"
                  selectedKeys={selectedPermission}
                  onSelectionChange={(values) => {
                    setSelectedPermission(values.currentKey);
                  }}
                >
                  {(filteredPermissionLevels) => (
                    <SelectItem
                      key={filteredPermissionLevels.id}
                      value={filteredPermissionLevels.name}
                    >
                      {filteredPermissionLevels.name}
                    </SelectItem>
                  )}
                </Select>
                <Input
                  isRequired
                  variant="underlined"
                  className="border-none"
                  size="sm"
                  type="password"
                  label="SENHA"
                  value={currentTargetNewPassword || ""}
                  onChange={(e) => setCurrentTargetNewPassword(e.target.value)}
                />
                <Input
                  isRequired
                  variant="underlined"
                  className="border-none"
                  size="sm"
                  type="password"
                  label="CONFIRME A SENHA"
                  value={currentTargetNewPasswordConfirm || ""}
                  onChange={(e) =>
                    setCurrentTargetNewPasswordConfirm(e.target.value)
                  }
                />
              </ModalBody>
              <Divider />
              <ModalFooter>
                <Button
                  mode="failed"
                  variant="light"
                  onPress={() => {
                    setAddUserIsOpen(false);
                    onClose();
                  }}
                >
                  Cancelar
                </Button>
                <Button
                  mode="success"
                  type="submit"
                  endContent={<HowToRegIcon />}
                  onPress={() => {
                    handleCreateNewUser();
                  }}
                >
                  Cadastrar
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </FullContainer>
  );
}

export default UserManagement;
