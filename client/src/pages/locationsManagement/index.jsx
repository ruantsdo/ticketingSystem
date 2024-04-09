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
import { useWebSocket } from "../../contexts/webSocket";

//Toast
import { toast } from "react-toastify";

//Stores
import useLocationsStore from "../../stores/locationsStore/store";

//Utils
import useUsersUtils from "../../stores/usersStore/utils";
import useGetDataUtils from "../../utils/getDataUtils";

function LocationManagement() {
  const { socket } = useWebSocket();
  const { isAdmin } = useUsersUtils();
  const {
    processingLocationsStore,
    createNewLocation,
    getLocationsList,
    removeLocation,
    updateLocation,
  } = useLocationsStore();
  const { findIndexById } = useGetDataUtils();

  const { currentUser } = useContext(AuthContext);
  const [openModal, setOpenModal] = useState(false);
  const [isAdd, setIsAdd] = useState(false);

  const [currentTargetId, setCurrentTargetId] = useState("");
  const [currentTargetName, setCurrentTargetName] = useState("");
  const [currentTargetDesc, setCurrentTargetDesc] = useState("");
  const [currentTargetTables, setCurrentTargetTables] = useState(1);

  const [locations, setLocations] = useState([]);
  const [page, setPage] = useState(1);

  const rowsPerPage = 5;

  const pages = Math.ceil(locations.length / rowsPerPage);

  const items = useMemo(() => {
    const start = (page - 1) * rowsPerPage;
    const end = start + rowsPerPage;

    return locations.slice(start, end);
  }, [page, locations]);

  const handleRemoveLocation = async (id) => {
    await removeLocation(id);
  };

  const handleUpdateLocation = async (id) => {
    const data = {
      id: id,
      name: currentTargetName,
      description: currentTargetDesc,
      tables: currentTargetTables,
      updated_by: currentUser.name,
    };

    const response = await updateLocation(data);
    if (response) setOpenModal(false);
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

    const response = await createNewLocation(data);
    if (response) setOpenModal(false);
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

  const updateStates = (index) => {
    setCurrentTargetId(locations[index].id);
    setCurrentTargetName(locations[index].name);
    setCurrentTargetDesc(locations[index].description);
    setCurrentTargetTables(locations[index].tables);
  };

  const clearStates = () => {
    setCurrentTargetId("");
    setCurrentTargetName("");
    setCurrentTargetDesc("");
    setCurrentTargetTables("");
  };

  const getInitialData = async () => {
    const locations = await getLocationsList();
    setLocations(locations);
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
      <Notification />
      <div className="flex flex-col w-full sm:w-[95%]">
        <div className="flex flex-col gap-2 justify-end sm:flex-row">
          <Button
            mode="success"
            className="mb-1 sm:max-w-xs border-none shadow-none p-5 w-fit"
            startContent={<AddIcon />}
            onPress={() => handleOpenModal()}
            isLoading={processingLocationsStore}
            isDisabled={processingLocationsStore}
          >
            Novo local
          </Button>
        </div>
        <Table
          aria-label="Lista de locais"
          onRowAction={(key) => {
            handleOpenModal(key);
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
            <TableColumn>LOCAL</TableColumn>
            <TableColumn>AÇÕES</TableColumn>
          </TableHeader>
          <TableBody
            items={items}
            emptyContent={
              locations.length > 0 ? (
                <Spinner size="lg" label="Carregando..." color="primary" />
              ) : (
                <div className="flex flex-col text-sm">
                  <Spinner
                    size="sm"
                    color="success"
                    label="Ainda não há locais cadastrados..."
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
                  isDisabled={processingLocationsStore}
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
