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

//Toast
import { toast } from "react-toastify";

//Stores
import useServicesStore from "../../stores/servicesStore/store";
import useGetDataUtils from "../../utils/getDataUtils";

//Socket
import { useWebSocket } from "../../contexts/webSocket";

//Contexts
import AuthContext from "../../contexts/auth";

function ServicesManagement() {
  const { isAdmin } = useContext(AuthContext);
  const { socket } = useWebSocket();

  const {
    getAllServices,
    createNewService,
    updateService,
    deleteService,
    processingServicesStore,
  } = useServicesStore();
  const { findIndexById } = useGetDataUtils();
  const { isOpen, onOpenChange } = useDisclosure();
  const [addServiceIsOpen, setAddServiceIsOpen] = useState(false);

  const [currentTargetName, setCurrentTargetName] = useState("");
  const [currentTargetDesc, setCurrentTargetDesc] = useState("");
  const [currentTargetLimit, setCurrentTargetLimit] = useState("");

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

  const handleDeleteService = async (id) => {
    const response = await deleteService(id);
    if (response) {
      clearStates();
    }
  };

  const handleUpdateService = async (id) => {
    if (!currentTargetName) {
      toast.info("O nome é obrigatório!");
      return;
    }

    const data = {
      id: id,
      name: currentTargetName,
      desc: currentTargetDesc,
      limit: currentTargetLimit,
    };

    const response = await updateService(data);
    if (response) onOpenChange(false);
  };

  const handleCreateNewService = async () => {
    if (!currentTargetName) {
      toast.info("O nome é obrigatório!");
      return;
    }

    const data = {
      name: currentTargetName,
      description: currentTargetDesc,
      limit: currentTargetLimit ? currentTargetLimit : 0,
    };

    const response = await createNewService(data);
    if (response) setAddServiceIsOpen(false);
  };

  const handleGetItemKey = async (id) => {
    const key = await findIndexById(services, id);
    if (!String(key)) return;
    updateStates(key);
    setItemKey(key);
    onOpenChange(true);
  };

  const updateStates = (index) => {
    setCurrentTargetName(services[index].name);
    setCurrentTargetDesc(services[index].description);
    setCurrentTargetLimit(services[index].limit);
  };

  const clearStates = () => {
    setCurrentTargetName("");
    setCurrentTargetDesc("");
    setCurrentTargetLimit("");
  };

  const getInitialData = async () => {
    const services = await getAllServices();
    setServices(services);
  };

  useEffect(() => {
    getInitialData();

    socket.on("services_updated", async () => {
      await getInitialData();
    });

    return () => {
      socket.off("services_updated");
    };
    // eslint-disable-next-line
  }, []);

  return (
    <FullContainer>
      <Notification />
      <div className="flex flex-col w-full sm:w-[95%]">
        <div className="flex flex-col gap-2 justify-end sm:flex-row">
          <Button
            isLoading={processingServicesStore}
            isDisabled={processingServicesStore}
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
            handleGetItemKey(key);
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
                        isLoading={processingServicesStore}
                        isDisabled={processingServicesStore}
                        mode="success"
                        className="w-5 rounded-full scale-80"
                        onPress={() => {
                          handleGetItemKey(item.id);
                        }}
                      >
                        <EditIcon fontSize="small" />
                      </Button>
                      <Button
                        isIconOnly
                        isLoading={processingServicesStore}
                        isDisabled={processingServicesStore}
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
                  value={currentTargetName}
                  onChange={(e) => setCurrentTargetName(e.target.value)}
                />
                <Input
                  isReadOnly={!isAdmin}
                  variant="underlined"
                  size="sm"
                  className="border-none"
                  label="DESCRIÇÃO"
                  value={currentTargetDesc}
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
                  value={currentTargetLimit}
                  defaultValue={services[itemKey].limit}
                  onChange={(e) => setCurrentTargetLimit(e.target.value)}
                />
              </ModalBody>
              <Divider />
              <ModalFooter className="flex justify-between align-middle">
                <Button
                  isLoading={processingServicesStore}
                  isDisabled={processingServicesStore}
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
                    isDisabled={processingServicesStore}
                    mode="failed"
                    className="w-10"
                    onPress={() => {
                      onClose();
                    }}
                  >
                    Fechar
                  </Button>
                  <Button
                    isLoading={processingServicesStore}
                    isDisabled={processingServicesStore}
                    mode="success"
                    className="w-10"
                    onPress={() => {
                      handleUpdateService(services[itemKey].id);
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
        onOpenChange={() => {
          clearStates();
          setAddServiceIsOpen(!addServiceIsOpen);
        }}
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
                  label="NOME (Máximo de 20 caracteres)"
                  value={currentTargetName}
                  onChange={(e) => setCurrentTargetName(e.target.value)}
                  maxLength={20}
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
                  placeholder="Deixe em branco para infinito"
                  type="number"
                  value={currentTargetLimit}
                  onChange={(e) => setCurrentTargetLimit(e.target.value)}
                />
              </ModalBody>
              <Divider />
              <ModalFooter>
                <Button
                  isDisabled={processingServicesStore}
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
                  isLoading={processingServicesStore}
                  isDisabled={processingServicesStore}
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
