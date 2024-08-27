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

//Contexts
import AuthContext from "../../contexts/auth";
import { useWebSocket } from "../../contexts/webSocket";

//Toast
import { toast } from "react-toastify";

//Stores
import useLocationsStore from "../../stores/locationsStore/store";

//Utils
import useGetDataUtils from "../../utils/getDataUtils";

function LocationManagement() {
  const { socket } = useWebSocket();
  const {
    processingLocationsStore,
    createNewLocation,
    getLocationsList,
    removeLocation,
    updateLocation,
  } = useLocationsStore();
  const { findIndexById, removeAccents } = useGetDataUtils();

  const searchOptions = [
    { key: "name", label: "NOME" },
    { key: "status", label: "STATUS" },
  ];

  const { currentUser, isAdmin } = useContext(AuthContext);
  const [openModal, setOpenModal] = useState(false);
  const [isAdd, setIsAdd] = useState(false);

  const [currentTargetId, setCurrentTargetId] = useState("");
  const [currentTargetName, setCurrentTargetName] = useState("");
  const [currentTargetDesc, setCurrentTargetDesc] = useState("");
  const [currentTargetTables, setCurrentTargetTables] = useState(1);
  const [currentTargetStatus, setCurrentTargetStatus] = useState(0);

  const [selectedFilter, setSelectedFilter] = useState("");
  const [searchValue, setSearchValue] = useState("");
  const [filteredLocations, setFilteredLocations] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(undefined);

  const [locations, setLocations] = useState([]);
  const [page, setPage] = useState(1);

  const rowsPerPage = 5;

  const pages = Math.ceil(locations.length / rowsPerPage);

  const items = useMemo(() => {
    const start = (page - 1) * rowsPerPage;
    const end = start + rowsPerPage;

    return filteredLocations.slice(start, end);
  }, [page, filteredLocations]);

  const handleRemoveLocation = async (id) => {
    await removeLocation(id);
    setOpenModal(false);
  };

  const handleUpdateLocation = async (id) => {
    const data = {
      id: id,
      name: currentTargetName,
      description: currentTargetDesc,
      tables: currentTargetTables,
      updated_by: currentUser.name,
      status: currentTargetStatus,
    };

    await updateLocation(data);
    setOpenModal(false);
  };

  const handleAddNewLocation = async () => {
    if (!currentTargetName || !currentTargetTables) {
      toast.info("O nome e quantidade de mesas é obrigatório!");
      return;
    }

    const data = {
      name: currentTargetName,
      description: currentTargetDesc,
      tables: currentTargetTables,
      created_by: currentUser.name,
    };

    await createNewLocation(data);
    setOpenModal(false);
  };

  const handleOpenModal = async (key) => {
    if (key) {
      const index = await findIndexById(locations, key);
      setIsAdd(false);
      updateStates(index);
      setOpenModal(true);
      return;
    }

    setIsAdd(true);
    clearStates();
    setOpenModal(true);
  };

  const handleSearch = () => {
    const finalSearchValue = removeAccents(searchValue);
    if (!selectedFilter) {
      toast.info("O filtro deve ser selecionado antes da pesquisa");
      return;
    }
    if (selectedFilter === "status") {
      const value = finalSearchValue === "ATIVO" ? 1 : 0;
      const filtered = filteredLocations.filter((item) => {
        return item.status === value;
      });
      setFilteredLocations(filtered);
    } else {
      const filtered = filteredLocations.filter((item) => {
        const lowerItemValue = removeAccents(item[selectedFilter]);
        return lowerItemValue.includes(finalSearchValue);
      });
      setFilteredLocations(filtered);
    }
  };

  const updateStates = (index) => {
    setCurrentTargetId(filteredLocations[index].id);
    setCurrentTargetName(filteredLocations[index].name);
    setCurrentTargetDesc(filteredLocations[index].description);
    setCurrentTargetTables(filteredLocations[index].tables);
    setCurrentTargetStatus(filteredLocations[index].status);
    setCurrentIndex(index);
  };

  const clearStates = () => {
    setCurrentTargetId("");
    setCurrentTargetName("");
    setCurrentTargetDesc("");
    setCurrentTargetTables("");
    setCurrentTargetStatus(0);
  };

  const getInitialData = async () => {
    const locations = await getLocationsList();
    setLocations(locations);
    setFilteredLocations(locations);
  };

  useEffect(() => {
    getInitialData();
    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    socket.on("locations_updated", () => {
      getInitialData();
    });

    return () => {
      socket.off("locations_updated");
    };
  });

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
              onClick={() => setFilteredLocations(locations)}
            >
              <CachedIcon />
            </Button>
          </div>
          <div className="flex w-[20%] justify-end">
            <Button
              mode="success"
              className="mb-1 sm:max-w-xs border-none shadow-none p-5 w-fit"
              startContent={<AddIcon />}
              onPress={() => handleOpenModal()}
              isLoading={processingLocationsStore}
              isDisabled={processingLocationsStore || !isAdmin}
            >
              Novo local
            </Button>
          </div>
        </div>
        <Table
          aria-label="Lista de locais"
          onRowAction={(key) => {
            if (isAdmin) handleOpenModal(key);
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
            <TableColumn className="w-1/12">MESAS</TableColumn>
            <TableColumn className="w-1/12">STATUS</TableColumn>
            <TableColumn>AÇÕES</TableColumn>
          </TableHeader>
          <TableBody
            items={items}
            emptyContent={
              filteredLocations.length > 0 ? (
                <Spinner size="lg" label="Carregando..." color="primary" />
              ) : (
                <div className="flex flex-col text-sm">
                  <Spinner
                    size="sm"
                    color="success"
                    label={
                      selectedFilter
                        ? "A busca não gerou resultados"
                        : "Ainda não há locais cadastrados..."
                    }
                  />
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
                <TableCell>{item.description}</TableCell>
                <TableCell>{item.tables}</TableCell>
                <TableCell>{item.status ? "ATIVO" : "DESATIVADO"}</TableCell>
                <TableCell className="w-1/12">
                  {
                    <div className="flex flex-row w-full h-7 items-center justify-around">
                      <Button
                        isIconOnly
                        mode="success"
                        className="w-5 rounded-full scale-80"
                        onPress={() => {
                          handleOpenModal(item.id);
                        }}
                        isLoading={processingLocationsStore}
                        isDisabled={processingLocationsStore || !isAdmin}
                      >
                        <EditIcon fontSize="small" />
                      </Button>
                      <Button
                        isIconOnly
                        mode="failed"
                        className="w-5 rounded-full scale-80"
                        onPress={() => {
                          handleRemoveLocation(item.id);
                        }}
                        isLoading={processingLocationsStore}
                        isDisabled={processingLocationsStore || !isAdmin}
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
        isOpen={openModal}
        onOpenChange={() => {
          setOpenModal(!openModal);
          clearStates();
        }}
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1 text-center">
                {isAdd ? "Adicionar novo local" : "Atualizar local"}
                {!isAdd && (
                  <section className="flex flex-col gap-1 justify-center items-center">
                    {filteredLocations[currentIndex].updated_by ? (
                      <h6>
                        Atualizado por:{" "}
                        {filteredLocations[currentIndex].updated_by} em{" "}
                        {filteredLocations[currentIndex].updated_at}
                      </h6>
                    ) : (
                      <h6>Este local nunca foi atualizado</h6>
                    )}
                    <Switch
                      isSelected={currentTargetStatus}
                      color="success"
                      onValueChange={() => {
                        setCurrentTargetStatus(!currentTargetStatus);
                      }}
                    >
                      {currentTargetStatus ? "Ativo" : "Desativado"}
                    </Switch>
                  </section>
                )}
              </ModalHeader>
              <Divider />
              <ModalBody>
                <Input
                  isRequired
                  variant="underlined"
                  size="sm"
                  className="border-none"
                  label="NOME"
                  defaultValue={currentTargetName}
                  value={currentTargetName}
                  onChange={(e) => setCurrentTargetName(e.target.value)}
                />
                <Input
                  variant="underlined"
                  size="sm"
                  className="border-none"
                  label="DESCRIÇÃO"
                  value={currentTargetDesc}
                  defaultValue={currentTargetDesc}
                  onChange={(e) => setCurrentTargetDesc(e.target.value)}
                />
                <Input
                  isRequired
                  variant="underlined"
                  className="border-none"
                  size="sm"
                  label="QUANTIDADE DE MESAS NO LOCAL"
                  type="number"
                  min={1}
                  defaultValue={currentTargetTables}
                  value={currentTargetTables}
                  onChange={(e) => setCurrentTargetTables(e.target.value)}
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
                    if (isAdd) {
                      handleAddNewLocation();
                    } else {
                      handleUpdateLocation(currentTargetId);
                    }
                  }}
                  isLoading={processingLocationsStore}
                  isDisabled={processingLocationsStore || !isAdmin}
                >
                  {isAdd ? "Cadastrar" : "Atualizar"}
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </FullContainer>
  );
}

export default LocationManagement;
