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
import AddIcon from "@mui/icons-material/Add";
import AddTaskIcon from "@mui/icons-material/AddTask";

//Contexts
import AuthContext from "../../contexts/auth";

//Services
import api from "../../services/api";

//Toast
import { toast } from "react-toastify";

function ServicesManagement() {
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const { currentUser } = useContext(AuthContext);
  const [addServiceIsOpen, setAddServiceIsOpen] = useState(false);

  const [currentTargetName, setCurrentTargetName] = useState("");
  const [currentTargetDesc, setCurrentTargetDesc] = useState("");
  const [currentTargetLimit, setCurrentTargetLimit] = useState("");

  const [isAdmin, setIsAdmin] = useState(false);

  const [services, setServices] = useState([]);
  const [page, setPage] = useState(1);
  const [itemKey, setItemKey] = useState();

  const rowsPerPage = 5;

  const pages = Math.ceil(services.length / rowsPerPage);

  const items = useMemo(() => {
    const start = (page - 1) * rowsPerPage;
    const end = start + rowsPerPage;

    return services.slice(start, end);
  }, [page, services]);

  const findIndexById = (key) => {
    for (let i = 0; i < services.length; i++) {
      // eslint-disable-next-line
      if (services[i].id == key) {
        setItemKey(i);
        updateStates(i);
        return;
      }
    }
  };

  const checkLevel = () => {
    if (currentUser.permission_level > 3) {
      setIsAdmin(true);
    } else {
      setIsAdmin(false);
    }
  };

  const checkServiceName = async (id) => {
    const duplicateServices = services.filter(
      (service) => service.name === currentTargetName
    );

    if (duplicateServices.length > 0) {
      const checkId = services.some((service) => service.id !== id);
      if (checkId) {
        toast.info("Já existe um serviço com esse nome!");
      } else {
        await updateService(id);
      }
    } else {
      await updateService(id);
    }
  };

  const handleServices = async () => {
    try {
      const response = await api.get("/services/query");
      setServices(response.data);
    } catch (error) {
      toast.error(error);
    }
  };

  const handleDeleteService = async (id) => {
    try {
      const response = await api.get(`/token/query/${id}`);
      const data = response.data;

      if (data.length > 0) {
        toast.warn(
          "Existem senhas vinculadas a esse serviço! Remova as senhas para o serviço e tente novamente!"
        );
      } else {
        await removeService(id);
      }
    } catch (error) {
      console.log("Delete service error: " + error);
    }
  };

  const removeService = async (id) => {
    try {
      await api
        .post("/service/remove", {
          id: id,
        })
        .then((response) => {
          if (response.data === "success") {
            toast.success("O serviço foi removido!");
            handleServices();
          } else if (response.data === "failed") {
            toast.error("Falha ao remover serviço!");
          }
        });
    } catch (error) {
      console.error(error);
    }
  };

  const updateService = async (id) => {
    try {
      await api
        .post("/service/update", {
          id: id,
          name: currentTargetName,
          desc: currentTargetDesc,
          limit: currentTargetLimit,
          updated_by: currentUser.name,
        })
        .then((response) => {
          if (response.data === "success") {
            toast.success("Serviço atualizado!");
          } else if (response.data === "failed") {
            toast.error("Falha ao atualizar o serviço!");
          }

          handleServices();
        });
    } catch (error) {
      console.error(error);
    }
  };

  const handleCreateNewService = async () => {
    if (!currentTargetName) {
      toast.info("O nome é obrigatório!");
      return;
    }

    await api
      .post("/service/registration", {
        name: currentTargetName,
        description: currentTargetDesc,
        limit: currentTargetLimit,
        created_by: currentUser.name,
      })
      .then((response) => {
        const resp = response.data;
        if (resp === "success") {
          toast.success("Serviço cadastrado!");
          handleServices();
        } else if (resp === "failed") {
          toast.warn(
            "Falha ao cadastrar o serviço. Tente novamente em alguns instantes!"
          );
        } else {
          toast.error("Erro interno no servidor!");
        }
        setAddServiceIsOpen(false);
      });
  };

  const updateStates = (id) => {
    setCurrentTargetName(services[id].name);
    setCurrentTargetDesc(services[id].description);
    setCurrentTargetLimit(services[id].limit);
  };

  const clearStates = () => {
    setCurrentTargetName("");
    setCurrentTargetDesc("");
    setCurrentTargetLimit("");
  };

  useEffect(() => {
    handleServices();
    checkLevel();
    // eslint-disable-next-line
  }, []);

  return (
    <FullContainer>
      <Notification />
      <div className="flex flex-col w-full sm:w-[95%]">
        <div className="flex flex-col gap-2 justify-end sm:flex-row">
          <Button
            mode="success"
            className="mb-1 sm:max-w-xs border-none shadow-none p-5 w-fit"
            startContent={<AddIcon />}
            onPress={() => setAddServiceIsOpen(true)}
          >
            Novo serviço
          </Button>
        </div>
        <Table
          aria-label="Lista de serviços"
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
          className="w-full"
        >
          <TableHeader>
            <TableColumn className="w-1/12">ID</TableColumn>
            <TableColumn>SERVIÇO</TableColumn>
            <TableColumn>AÇÕES</TableColumn>
          </TableHeader>
          <TableBody
            items={items}
            emptyContent={
              services.length > 0 ? (
                <Spinner size="lg" label="Carregando..." color="primary" />
              ) : (
                <div className="flex flex-col text-sm">
                  <Spinner
                    size="sm"
                    color="success"
                    label="Ainda não há serviços cadastrados..."
                  />
                  Atualize a página para buscar por atualizações
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
                          handleDeleteService(item.id);
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
        onOpenChange={onOpenChange}
        onClose={() => clearStates()}
        backdrop="opaque"
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1 justify-center items-center font-semibold">
                <section className="flex flex-col gap-1 justify-center items-center">
                  <h1>Dados do serviço </h1>
                  {services[itemKey].updated_by ? (
                    <h6>
                      Atualizado por: {services[itemKey].updated_by} em{" "}
                      {services[itemKey].updated_at}
                    </h6>
                  ) : (
                    <h6>Este serviço ainda não foi atualizado</h6>
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
                  defaultValue={services[itemKey].name}
                  onChange={(e) => setCurrentTargetName(e.target.value)}
                />
                <Input
                  isReadOnly={!isAdmin}
                  variant="underlined"
                  size="sm"
                  className="border-none"
                  label="DESCRIÇÃO"
                  defaultValue={services[itemKey].description}
                  onChange={(e) => setCurrentTargetDesc(e.target.value)}
                />
                <Input
                  isReadOnly={!isAdmin}
                  variant="underlined"
                  size="sm"
                  className="border-none"
                  type="number"
                  label="LIMITE DIÁRIO (0 = Infinito)"
                  defaultValue={services[itemKey].limit}
                  onChange={(e) => setCurrentTargetLimit(e.target.value)}
                />
              </ModalBody>
              <Divider />
              <ModalFooter className="flex justify-between align-middle">
                <Button
                  className="bg-transparent text-failed w-15"
                  onPress={() => {
                    onClose();
                    handleDeleteService(services[itemKey].id);
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
                      checkServiceName(services[itemKey].id).then(onClose());
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
        isOpen={addServiceIsOpen}
        onOpenChange={() => setAddServiceIsOpen(!addServiceIsOpen)}
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1 text-center">
                Adicionar novo serviço
              </ModalHeader>
              <Divider />
              <ModalBody>
                <Input
                  isRequired
                  variant="underlined"
                  size="sm"
                  className="border-none"
                  label="NOME"
                  value={currentTargetName}
                  onChange={(e) => setCurrentTargetName(e.target.value)}
                />
                <Input
                  variant="underlined"
                  size="sm"
                  className="border-none"
                  label="DESCRIÇÃO"
                  value={currentTargetDesc}
                  onChange={(e) => setCurrentTargetDesc(e.target.value)}
                />
                <Input
                  variant="underlined"
                  className="border-none"
                  size="sm"
                  label="LIMITE DIÁRIO"
                  placeholder="Deixe em branco para infitino"
                  type="number"
                  value={currentTargetLimit}
                  onChange={(e) => setCurrentTargetLimit(e.target.value)}
                />
              </ModalBody>
              <Divider />
              <ModalFooter>
                <Button
                  mode="failed"
                  variant="light"
                  onPress={() => {
                    clearStates();
                    onClose();
                  }}
                >
                  Cancelar
                </Button>
                <Button
                  mode="success"
                  type="submit"
                  endContent={<AddTaskIcon />}
                  onPress={() => {
                    handleCreateNewService();
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

export default ServicesManagement;
