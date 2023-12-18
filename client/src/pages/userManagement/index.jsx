//React
import { useState, useEffect, useMemo, useContext } from "react";

//Components
import {
  Divider,
  FullContainer,
  Button,
  Notification,
  Input,
} from "../../components";

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
} from "@nextui-org/react";

//Icons
import EditIcon from "@mui/icons-material/Edit";
import DeleteForeverIcon from "@mui/icons-material/DeleteForever";

//Contexts
import AuthContext from "../../contexts/auth";

//Services
import api from "../../services/api";

//Toast
import { toast } from "react-toastify";

function UserManagement() {
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const { currentUser } = useContext(AuthContext);

  const [currentUserName, setCurrentUserName] = useState("");
  const [currentUserEmail, setCurrentUserEmail] = useState("");
  const [currentUserCPF, setCurrentUserCPF] = useState("");
  const [currentUserLevel, setCurrentUserLevel] = useState("");
  const [currentUserPassword, setCurrentUserPassword] = useState("");
  const [currentUserNewPassword, setCurrentUserNewPassword] = useState("");

  const [isAdmin, setIsAdmin] = useState(false);

  const [usersList, setUsersList] = useState([]);
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

  const handleCurrentUserServices = async () => {
    try {
      const response = await api.get(`/user_services/query/${currentUser.id}`);
      return response.data;
    } catch (error) {
      console.log(error);
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
      setUsersList(response.data);
    } catch (error) {
      console.log(error);
    }
  };

  const filterUsers = async () => {
    if (currentUser.permission_level > 3) {
      setUsers(usersList);
    } else {
      const currentUserServices = await handleCurrentUserServices();
      const userServices = await handleUsersServices();
      try {
        const filteredUsers = userServices.filter((user) => {
          return currentUserServices.some((service) => {
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
    const duplicateUsers = usersList.filter(
      (user) => user.cpf === currentUserCPF
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
    if (currentUserEmail === "") {
      await updateUser(id);
    } else {
      const duplicateUsers = users.filter(
        (user) => user.email === currentUserEmail
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
    }
  };

  const removeUser = async (id) => {
    try {
      await api
        .post("/users/remove", {
          id: id,
        })
        .then((response) => {
          if (response.data === "success") {
            toast.success("O usuário foi removido!");
            handleUsersList();
          } else if (response.data === "failed") {
            toast.error("Falha ao remover usuário!");
          }
        });
    } catch (error) {
      console.error(error);
    }
  };

  const updateUser = async (id) => {
    let passwordChanged;

    if (currentUserNewPassword === "") {
      passwordChanged = false;
    } else {
      passwordChanged = true;
    }

    try {
      await api
        .post("/users/update", {
          id: id,
          name: currentUserName,
          email: currentUserEmail,
          cpf: currentUserCPF,
          level: currentUserLevel,
          updated_by: currentUser.name,
          password: currentUserPassword,
          passwordChanged: passwordChanged,
        })
        .then((response) => {
          if (response.data === "success") {
            toast.success("Usuário atualizado!");
          } else if (response.data === "failed") {
            toast.error("Falha ao atualizar usuário!");
          }
          handleUsersList();
        });
    } catch (error) {
      console.error(error);
    }
  };

  const updateStates = (id) => {
    setCurrentUserName(users[id].name);
    setCurrentUserEmail(users[id].email);
    setCurrentUserCPF(users[id].cpf);
    setCurrentUserLevel(users[id].permission_level);
    setCurrentUserPassword(users[id].password);
  };

  const clearStates = () => {
    setCurrentUserName("");
    setCurrentUserEmail("");
    setCurrentUserCPF("");
    setCurrentUserLevel("");
    setCurrentUserPassword("");
    setCurrentUserNewPassword("");
  };

  useEffect(() => {
    handleUsersList();
    checkLevel();
    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    filterUsers();
    // eslint-disable-next-line
  }, [usersList]);

  return (
    <FullContainer>
      <Notification />
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
              isCompact
              showControls
              color="success"
              page={page}
              total={pages}
              onChange={(page) => setPage(page)}
            />
          </div>
        }
        classNames={{
          wrapper: "min-h-[222px]",
        }}
        className="sm:w-[80%]"
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
                  label="Ainda não há usuários dísponiveis..."
                />
                Atualize a página para buscar por atualizações...
              </div>
            )
          }
        >
          {(item) => (
            <TableRow
              key={item.id}
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

      <Modal
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        onClose={() => clearStates()}
        backdrop="opaque"
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1 justify-center items-center font-semibold">
                <section className="flex flex-col gap-1 justify-center items-center">
                  <h1>Dados do usuário </h1>
                  <h6>Criado por: {users[itemKey].created_by}</h6>
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
                  onChange={(e) => setCurrentUserName(e.target.value)}
                />
                <Input
                  isReadOnly={!isAdmin}
                  variant="underlined"
                  size="sm"
                  className="border-none"
                  label="EMAIL"
                  defaultValue={users[itemKey].email}
                  onChange={(e) => setCurrentUserEmail(e.target.value)}
                />
                <Input
                  isReadOnly={!isAdmin}
                  variant="underlined"
                  className="border-none"
                  size="sm"
                  label="CPF"
                  defaultValue={users[itemKey].cpf}
                  onChange={(e) => setCurrentUserCPF(e.target.value)}
                />
                <Input
                  isReadOnly={!isAdmin}
                  variant="underlined"
                  className="border-none"
                  size="sm"
                  type="password"
                  label="SENHA (Deixe em branco para manter a atual)"
                  onChange={(e) => setCurrentUserNewPassword(e.target.value)}
                />
              </ModalBody>
              <Divider />
              <ModalFooter className="flex justify-between align-middle">
                <Button
                  className="bg-transparent text-failed w-15"
                  onPress={() => {
                    onClose();
                    removeUser(users[itemKey].id);
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
                    onPress={() => {
                      checkUserCpf(users[itemKey].id).then(onClose());
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
    </FullContainer>
  );
}

export default UserManagement;
