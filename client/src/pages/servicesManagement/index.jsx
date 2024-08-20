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
import AddTaskIcon from "@mui/icons-material/AddTask";
import SearchIcon from "@mui/icons-material/Search";
import CachedIcon from "@mui/icons-material/Cached";

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

  const searchOptions = [
    { key: "name", label: "NOME" },
    { key: "status", label: "STATUS" },
  ];

  const {
    getAllServices,
    createNewService,
    updateService,
    deleteService,
    processingServicesStore,
  } = useServicesStore();
  const { findIndexById, removeAccents } = useGetDataUtils();
  const [addServiceIsOpen, setAddServiceIsOpen] = useState(false);
  const [updateServiceIsOpen, setUpdateServiceIsOpen] = useState(false);

  const [currentTargetName, setCurrentTargetName] = useState("");
  const [currentTargetDesc, setCurrentTargetDesc] = useState("");
  const [currentTargetLimit, setCurrentTargetLimit] = useState("");
  const [currentTargetStatus, setCurrentStatus] = useState(0);

  const [selectedFilter, setSelectedFilter] = useState("");
  const [searchValue, setSearchValue] = useState("");
  const [filteredServices, setFilteredServices] = useState([]);
  const [disconnectMessage, setDisconnectMessage] = useState("");

  const [services, setServices] = useState([]);
  const [page, setPage] = useState(1);
  const [itemKey, setItemKey] = useState();

  const rowsPerPage = 5;

  const pages = Math.ceil(services.length / rowsPerPage);

  const items = useMemo(() => {
    const start = (page - 1) * rowsPerPage;
    const end = start + rowsPerPage;

    return filteredServices.slice(start, end);
  }, [page, filteredServices]);

  const handleDeleteService = async (id) => {
    await deleteService(id);

    clearStates();
    setUpdateServiceIsOpen(false);
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
      status: currentTargetStatus,
    };

    await updateService(data);

    clearStates();
    setUpdateServiceIsOpen(false);
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

    await createNewService(data);
    setAddServiceIsOpen(false);
    clearStates();
  };

  const handleGetItemKey = async (id) => {
    const key = await findIndexById(services, id);
    if (!String(key)) return;
    updateStates(key);
    setItemKey(key);
    setUpdateServiceIsOpen(true);
  };

  const handleSearch = () => {
    const finalSearchValue = removeAccents(searchValue);
    if (!selectedFilter) {
      toast.info("O filtro deve ser selecionado antes da pesquisa");
      return;
    }
    if (selectedFilter === "status") {
      const value = finalSearchValue === "ATIVO" ? 1 : 0;
      const filtered = filteredServices.filter((item) => {
        return item.status === value;
      });
      setFilteredServices(filtered);
    } else {
      const filtered = filteredServices.filter((item) => {
        const lowerItemValue = removeAccents(item[selectedFilter]);
        return lowerItemValue.includes(finalSearchValue);
      });
      setFilteredServices(filtered);
    }
  };

  const handleStatusChange = (service) => {
    if (currentTargetStatus === false && service.status === true) {
      setDisconnectMessage(
        "Isso fará com que não seja mais possível criar novos tickets com esse serviço. Tickets já criados permanecerão ativos"
      );
    } else {
      setDisconnectMessage("");
    }
    setCurrentStatus(!currentTargetStatus);
  };

  const updateStates = (index) => {
    setCurrentTargetName(filteredServices[index].name);
    setCurrentTargetDesc(filteredServices[index].description);
    setCurrentTargetLimit(filteredServices[index].limit);
    setCurrentStatus(filteredServices[index].status);
  };

  const clearStates = () => {
    setCurrentTargetName("");
    setCurrentTargetDesc("");
    setCurrentTargetLimit("");
    setCurrentStatus(0);
  };

  const getInitialData = async () => {
    const services = await getAllServices();
    setFilteredServices(services);
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
              onClick={() => setFilteredServices(services)}
            >
              <CachedIcon />
            </Button>
          </div>
          <div className="flex w-[20%] justify-end">
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
        </div>
        <Table
          aria-label="Lista de serviços"
          onRowAction={(key) => {
            if (isAdmin) handleGetItemKey(key);
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
            <TableColumn>NOME</TableColumn>
            <TableColumn>DESCRIÇÃO</TableColumn>
            <TableColumn>LIMITE</TableColumn>
            <TableColumn>STATUS</TableColumn>
            <TableColumn>AÇÕES</TableColumn>
          </TableHeader>
          <TableBody
            items={items}
            emptyContent={
              filteredServices.length > 0 ? (
                <Spinner size="lg" label="Carregando..." color="primary" />
              ) : (
                <div className="flex flex-col text-sm">
                  <Spinner
                    size="sm"
                    color="success"
                    label={
                      selectedFilter
                        ? "A pesquisa não gerou resultados"
                        : "Ainda não há serviços cadastrados..."
                    }
                  />
                  {selectedFilter
                    ? ""
                    : "Atualize a página para buscar por atualizações"}
                </div>
              )
            }
          >
            {(item) => (
              <TableRow
                key={item.id}
                className="hover:cursor-pointer hover:opacity-90 hover:ring-2 rounded-lg hover:shadow-md hover:scale-[101%] transition-all"
              >
                <TableCell>{item.name}</TableCell>
                <TableCell>
                  {item.description ? item.description : "SEM DESCRIÇÃO"}
                </TableCell>
                <TableCell className="w-1/12">
                  {!item.limit ? "ILIMITADO" : item.limit}
                </TableCell>
                <TableCell className="w-1/12">
                  {item.status ? "Ativo" : "Desativado"}
                </TableCell>
                <TableCell className="w-1/12">
                  {
                    <div className="flex flex-row w-full h-7 items-center justify-around">
                      <Button
                        isIconOnly
                        isLoading={processingServicesStore}
                        isDisabled={processingServicesStore || !isAdmin}
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
                        isDisabled={processingServicesStore || !isAdmin}
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
        isOpen={updateServiceIsOpen}
        size="lg"
        onOpenChange={() => setUpdateServiceIsOpen(!updateServiceIsOpen)}
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
                <Switch
                  isSelected={currentTargetStatus}
                  color="success"
                  onValueChange={() => {
                    handleStatusChange(filteredServices[itemKey]);
                  }}
                >
                  {currentTargetStatus ? "Ativo" : "Desativado"}
                </Switch>
                <h6>{disconnectMessage}</h6>
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
        onOpenChange={() => setAddServiceIsOpen(!addServiceIsOpen)}
        onClose={() => clearStates()}
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
