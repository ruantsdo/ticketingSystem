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
  Switch,
} from "@nextui-org/react";

//Icons
import EditIcon from "@mui/icons-material/Edit";
import DeleteForeverIcon from "@mui/icons-material/DeleteForever";
import AddIcon from "@mui/icons-material/Add";
import HowToRegIcon from "@mui/icons-material/HowToReg";
import SearchIcon from "@mui/icons-material/Search";
import CachedIcon from "@mui/icons-material/Cached";

//Contexts
import AuthContext from "../../contexts/auth";
import { useWebSocket } from "../../contexts/webSocket";

//Toast
import { toast } from "react-toastify";

//Stores
import useUsersStore from "../../stores/usersStore/store";
import useServicesStore from "../../stores/servicesStore/store";

//Utils
import useUsersUtils from "../../stores/usersStore/utils";
import useGetDataUtils from "../../utils/getDataUtils";

function UserManagement() {
  const { socket } = useWebSocket();
  const {
    getUsersList,
    createNewUser,
    updateUser,
    deleteUser,
    getUserServices,
    processingUserStore,
  } = useUsersStore();
  const { filterPermissionLevels } = useUsersUtils();
  const { getAllServices } = useServicesStore();
  const { getPermissionLevels, removeAccents } = useGetDataUtils();

  const searchOptions = [
    { key: "name", label: "NOME" },
    { key: "email", label: "EMAIL" },
    { key: "cpf", label: "CPF" },
    { key: "permission_level", label: "CARGO" },
    { key: "status", label: "STATUS" },
  ];

  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const [addUserIsOpen, setAddUserIsOpen] = useState(false);
  const { currentUser, isAdmin } = useContext(AuthContext);
  const [disconnectMessage, setDisconnectMessage] = useState("");

  const [currentTargetName, setCurrentTargetName] = useState("");
  const [currentTargetEmail, setCurrentTargetEmail] = useState("");
  const [currentTargetCPF, setCurrentTargetCPF] = useState("");
  const [currentTargetLevel, setCurrentTargetLevel] = useState("");
  const [currentTargetPassword, setCurrentTargetPassword] = useState("");
  const [currentTargetNewPassword, setCurrentTargetNewPassword] = useState("");
  const [currentTargetNewPasswordConfirm, setCurrentTargetNewPasswordConfirm] =
    useState("");
  const [currentTargetStatus, setCurrentTargetStatus] = useState(false);

  const [services, setServices] = useState([]);
  const [filteredPermissionLevels, setFilteredPermissionLevels] = useState([]);
  const [users, setUsers] = useState([]);
  const [permissions, setPermissions] = useState([]);

  const [selectedServices, setSelectedServices] = useState([]);
  const [selectedPermission, setSelectedPermission] = useState();

  const [filteredUsers, setFilteredUsers] = useState([]);
  const [selectedFilter, setSelectedFilter] = useState("");
  const [searchValue, setSearchValue] = useState("");
  const [usersStatusCount, setUsersStatusCount] = useState();

  const [page, setPage] = useState(1);
  const [itemKey, setItemKey] = useState();

  const rowsPerPage = 5;

  const pages = Math.ceil(users.length / rowsPerPage);

  const items = useMemo(() => {
    const start = (page - 1) * rowsPerPage;
    const end = start + rowsPerPage;

    return filteredUsers.slice(start, end);
  }, [page, filteredUsers]);

  const findIndexById = async (key) => {
    for (let i = 0; i < users.length; i++) {
      // eslint-disable-next-line
      if (users[i].id == key) {
        setItemKey(i);
        updateStates(i);
        return;
      }
    }
  };

  const handleCreateNewUser = async () => {
    const data = {
      name: currentTargetName,
      email: currentTargetEmail,
      cpf: currentTargetCPF,
      permission: selectedPermission,
      updated_by: currentUser.name,
      password: currentTargetNewPassword,
      services: selectedServices,
    };

    if (currentTargetNewPasswordConfirm === currentTargetNewPassword) {
      createNewUser(data);
    } else {
      toast.info("As senhas devem ser iguais!");
    }
  };

  const handleDeleteUser = async (id) => {
    deleteUser(id);
  };

  const handleUpdateUser = async (id) => {
    let passwordChanged = false;

    if (currentTargetNewPassword) {
      passwordChanged = true;
    }

    const data = {
      id: id,
      name: currentTargetName,
      email: currentTargetEmail,
      cpf: currentTargetCPF,
      permission: currentTargetLevel,
      updated_by: currentUser.name,
      password: currentTargetNewPassword
        ? currentTargetNewPassword
        : currentTargetPassword,
      passwordChanged: passwordChanged,
      services: selectedServices,
      status: currentTargetStatus,
    };

    await updateUser(data);
  };

  const handleStatusChange = (user) => {
    if (currentTargetStatus === false && user.status === true) {
      setDisconnectMessage("Isso irá desconectar o usuário");
    } else {
      setDisconnectMessage("");
    }
    setCurrentTargetStatus(!currentTargetStatus);
  };

  const handleSearch = () => {
    const finalSearchValue = removeAccents(searchValue);
    if (!selectedFilter) {
      toast.info("O filtro deve ser selecionado antes da pesquisa");
      return;
    }
    if (selectedFilter === "permission_level") {
      const level = permissions.filter((item) => {
        return removeAccents(item.name) === finalSearchValue;
      });

      const filtered = filteredUsers.filter((item) => {
        return item[selectedFilter] === level.id;
      });
      setFilteredUsers(filtered);
    } else if (selectedFilter === "status") {
      const value = finalSearchValue === "ATIVO" ? 1 : 0;
      const filtered = filteredUsers.filter((item) => {
        return item.status === value;
      });
      setFilteredUsers(filtered);
    } else {
      const cleanSearchValue = finalSearchValue;
      const trueSearchValue =
        cleanSearchValue === "NAO INFORMADO" ? "" : cleanSearchValue;
      const filtered = filteredUsers.filter((item) => {
        const lowerItemValue = removeAccents(item[selectedFilter]);
        return lowerItemValue.includes(trueSearchValue);
      });
      setFilteredUsers(filtered);
    }
  };

  const countUsersData = () => {
    const data = { active: 0, unproved: 0, inactive: 0 };

    filteredUsers.map((item) => {
      if (item.status) {
        return data.active++;
      } else if (!item.status && !item.updated_by) {
        return data.unproved++;
      } else {
        return data.inactive++;
      }
    });

    setUsersStatusCount(data);
  };

  const getInitialData = async () => {
    try {
      const [
        servicesData,
        filteredPermissionLevelsData,
        permissions,
        usersData,
      ] = await Promise.all([
        getAllServices(),
        filterPermissionLevels(),
        getPermissionLevels(),
        getUsersList(),
      ]);
      setServices(servicesData);
      setFilteredPermissionLevels(filteredPermissionLevelsData);
      setPermissions(permissions);
      setUsers(usersData);
      setFilteredUsers(usersData);
    } catch (error) {
      console.error("Erro ao obter dados iniciais:", error);
      throw error;
    }
  };

  const updateStates = async (id) => {
    const userServices = await getUserServices(users[id].id);
    const values = userServices.map((user) => String(Object.values(user)));
    setSelectedServices(values);

    setCurrentTargetName(users[id].name);
    setCurrentTargetEmail(users[id].email);
    setCurrentTargetCPF(users[id].cpf);
    setCurrentTargetLevel(users[id].permission_level);
    setCurrentTargetPassword(users[id].password);
    setCurrentTargetStatus(users[id].status);
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
    setDisconnectMessage("");
  };

  useEffect(() => {
    countUsersData();

    // eslint-disable-next-line
  }, [filteredUsers]);

  useEffect(() => {
    getInitialData();

    socket.on("users_updated", async () => {
      await getInitialData(setServices, setFilteredPermissionLevels, setUsers);
    });

    return () => {
      socket.off("users_updated");
    };

    // eslint-disable-next-line
  }, []);

  return (
    <FullContainer>
      <div className="flex flex-col w-full sm:w-[95%]">
        <div className="flex flex-col sm:flex-row items-center mb-1 w-full justify-around">
          <div className="flex w-[80%] items-center">
            <Input
              variant="bordered"
              size="sm"
              className="w-5/12"
              label="BUSCAR POR"
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
            />
            <Select
              variant="bordered"
              size="sm"
              label="FILTRAR POR"
              className="w-2/12 ml-2"
              onSelectionChange={(key) => setSelectedFilter(key.currentKey)}
            >
              {searchOptions.map((item) => (
                <SelectItem key={item.key}>{item.label}</SelectItem>
              ))}
            </Select>

            <Button
              isIconOnly
              color="default"
              variant="faded"
              aria-label="buscar"
              className="w-[30px] ml-5"
              onClick={() => handleSearch()}
            >
              <SearchIcon />
            </Button>
            <Button
              isIconOnly
              color="default"
              variant="faded"
              aria-label="restaurar"
              className="w-[30px] ml-3"
              onClick={() => setFilteredUsers(users)}
            >
              <CachedIcon />
            </Button>
          </div>
          <div className="flex w-[20%] justify-end">
            <Button
              mode="success"
              className="sm:max-w-xs border-none shadow-none w-fit"
              startContent={<AddIcon />}
              onPress={() => setAddUserIsOpen(true)}
              isDisabled={processingUserStore || !isAdmin}
            >
              Novo usuário
            </Button>
          </div>
        </div>

        <Table
          aria-label="Lista de usuários"
          onRowAction={async (key) => {
            if (isAdmin) {
              await findIndexById(key);
              onOpen();
            }
          }}
          isStriped
          bottomContent={
            <div className="flex flex-row w-full items-center justify-center">
              <div className="flex flex-row w-[42%] left-2 absolute justify-start gap-5">
                <p>Ativos: {usersStatusCount?.active}</p>
                <p>Inativos: {usersStatusCount?.inactive}</p>
              </div>
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
              <div className="flex flex-row right-2 absolute w-[42%] justify-end">
                <p>
                  {usersStatusCount?.unproved > 0
                    ? `${usersStatusCount?.unproved} usuários precisam de aprovação`
                    : "Nenhum usuário precisa de aprovação"}
                </p>
              </div>
            </div>
          }
          classNames={{
            wrapper: "min-h-[222px]",
          }}
          className="w-full"
        >
          <TableHeader>
            <TableColumn>USUÁRIO</TableColumn>
            <TableColumn>EMAIL</TableColumn>
            <TableColumn>CPF</TableColumn>
            <TableColumn>CARGO</TableColumn>
            <TableColumn>STATUS</TableColumn>
            <TableColumn>AÇÕES</TableColumn>
          </TableHeader>
          <TableBody
            items={items}
            emptyContent={
              filteredUsers.length > 0 ? (
                <Spinner size="lg" label="Carregando..." color="primary" />
              ) : (
                <div className="flex flex-col text-sm">
                  <Spinner
                    size="sm"
                    color="success"
                    label="Não há usuários disponíveis..."
                  />
                  {searchValue || selectedFilter
                    ? "A busca não gerou resultados..."
                    : "Novos usuários serão mostrados assim que estiverem disponíveis"}
                </div>
              )
            }
          >
            {(item) => (
              <TableRow
                key={`${item.id}`}
                className="hover:cursor-pointer hover:opacity-90 hover:ring-2 rounded-lg hover:shadow-md hover:scale-[101%] transition-all"
              >
                <TableCell>{item.name}</TableCell>
                <TableCell>
                  {item.email ? item.email : "NÃO INFORMADO"}
                </TableCell>
                <TableCell>{item.cpf}</TableCell>
                <TableCell>
                  {permissions[item.permission_level - 1].name}
                </TableCell>
                <TableCell className="w-1/12">
                  {item.status ? "Ativo" : "Desativado"}
                </TableCell>
                <TableCell className="w-1/12">
                  {
                    <div className="flex flex-row w-full h-7 items-center justify-around">
                      <Button
                        isIconOnly
                        isDisabled={processingUserStore || !isAdmin}
                        isLoading={processingUserStore}
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
                          handleDeleteUser(item.id);
                        }}
                        isDisabled={processingUserStore || !isAdmin}
                        isLoading={processingUserStore}
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
        size="lg"
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
                  <Switch
                    isSelected={currentTargetStatus}
                    color="success"
                    onValueChange={() => {
                      if (users[itemKey].id !== 1) {
                        handleStatusChange(users[itemKey]);
                      }
                    }}
                  >
                    {currentTargetStatus ? "Ativo" : "Desativado"}
                  </Switch>
                  <h6>{disconnectMessage}</h6>
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
                  isReadOnly={!isAdmin}
                  isDisabled={users[itemKey].id === 1}
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
                  isRequired
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
                  isLoading={processingUserStore}
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
                    await handleDeleteUser(users[itemKey].id);
                    onClose();
                  }}
                  startContent={<DeleteForeverIcon />}
                  isDisabled={processingUserStore}
                  isLoading={processingUserStore}
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
                      await handleUpdateUser(users[itemKey].id);
                      onClose();
                    }}
                    isDisabled={processingUserStore}
                    isLoading={processingUserStore}
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
                  isDisabled={processingUserStore}
                  isLoading={processingUserStore}
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
