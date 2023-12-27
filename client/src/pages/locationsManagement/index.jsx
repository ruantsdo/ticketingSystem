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

function LocationManagement() {
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const { currentUser } = useContext(AuthContext);
  const [addLocationIsOpen, setAddLocationIsOpen] = useState(false);

  const [currentTargetName, setCurrentTargetName] = useState("");
  const [currentTargetDesc, setCurrentTargetDesc] = useState("");
  const [currentTargetTables, setCurrentTargetTables] = useState(1);

  const [isAdmin, setIsAdmin] = useState(false);

  const [locations, setLocations] = useState([]);
  const [page, setPage] = useState(1);
  const [itemKey, setItemKey] = useState();

  const rowsPerPage = 5;

  const pages = Math.ceil(locations.length / rowsPerPage);

  const items = useMemo(() => {
    const start = (page - 1) * rowsPerPage;
    const end = start + rowsPerPage;

    return locations.slice(start, end);
  }, [page, locations]);

  const findIndexById = (key) => {
    for (let i = 0; i < locations.length; i++) {
      // eslint-disable-next-line
      if (locations[i].id == key) {
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

  const handleLocations = async () => {
    try {
      const response = await api.get("/location/query");
      setLocations(response.data);
    } catch (error) {
      console.error(error);
    }
  };

  const checkLocalName = async (id) => {
    const duplicateLocation = locations.filter(
      (local) => local.name === currentTargetName
    );

    if (duplicateLocation.length > 0) {
      const checkId = locations.some((local) => local.id !== id);
      if (checkId) {
        toast.info("Já existe um local com esse nome!");
      } else {
        await updateLocation(id);
      }
    } else {
      await updateLocation(id);
    }
  };

  const removeLocation = async (id) => {
    try {
      await api
        .post("/location/remove", {
          id: id,
        })
        .then((response) => {
          if (response.data === "success") {
            toast.success("O local foi removido!");
            handleLocations();
          } else if (response.data === "failed") {
            toast.error("Falha ao remover local!");
          }
        });
    } catch (error) {
      console.error(error);
    }
  };

  const updateLocation = async (id) => {
    try {
      await api
        .post("/location/update", {
          id: id,
          name: currentTargetName,
          description: currentTargetDesc,
          tables: currentTargetTables,
          updated_by: currentUser.name,
        })
        .then((response) => {
          if (response.data === "success") {
            toast.success("Local atualizado!");
          } else if (response.data === "failed") {
            toast.error("Falha ao atualizar o local!");
          }

          handleLocations();
        });
    } catch (error) {
      console.error(error);
    }
  };

  const handleAddNewLocation = async () => {
    if (!currentTargetName || !currentTargetTables) {
      toast.info("O nome e quantidade de mesas é obrigatório!");
      return;
    }

    await api
      .post("/location/registration", {
        name: currentTargetName,
        description: currentTargetDesc,
        tables: currentTargetTables,
        created_by: currentUser.name,
      })
      .then((response) => {
        const resp = response.data;

        if (resp === "success") {
          toast.success("Local cadastrado!");
          handleLocations();
          setAddLocationIsOpen(false);
        } else if (resp === "failed") {
          toast.warn(
            "Falha ao cadastrar novo local. Tente novamente em alguns instantes!"
          );
          setAddLocationIsOpen(false);
        } else if (resp === "already exists") {
          toast.info("Já existe um local com esse nome!");
        } else {
          toast.error("Falha interna no servidor. Tente novamete mais tarde!");
          setAddLocationIsOpen(false);
        }
      });
  };

  const updateStates = (id) => {
    setCurrentTargetName(locations[id].name);
    setCurrentTargetDesc(locations[id].description);
    setCurrentTargetTables(locations[id].tables);
  };

  const clearStates = () => {
    setCurrentTargetName("");
    setCurrentTargetDesc("");
    setCurrentTargetTables("");
  };

  useEffect(() => {
    handleLocations();
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
            onPress={() => setAddLocationIsOpen(true)}
          >
            Novo local
          </Button>
        </div>
        <Table
          aria-label="Lista de locais"
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
                          removeLocation(item.id);
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
                  <h1>Dados do local </h1>
                  {locations[itemKey].updated_by ? (
                    <h6>
                      Atualizado por: {locations[itemKey].updated_by} em{" "}
                      {locations[itemKey].updated_at}
                    </h6>
                  ) : (
                    <h6>Este local ainda não foi atualizado</h6>
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
                  defaultValue={locations[itemKey].name}
                  onChange={(e) => setCurrentTargetName(e.target.value)}
                />
                <Input
                  isReadOnly={!isAdmin}
                  variant="underlined"
                  size="sm"
                  className="border-none"
                  label="DESCRIÇÃO"
                  defaultValue={locations[itemKey].description}
                  onChange={(e) => setCurrentTargetDesc(e.target.value)}
                />
                <Input
                  isReadOnly={!isAdmin}
                  variant="underlined"
                  size="sm"
                  className="border-none"
                  type="number"
                  min={1}
                  label="QUANTIDADE DE MESAS"
                  defaultValue={locations[itemKey].tables}
                  onChange={(e) => setCurrentTargetTables(e.target.value)}
                />
              </ModalBody>
              <Divider />
              <ModalFooter className="flex justify-between align-middle">
                <Button
                  className="bg-transparent text-failed w-15"
                  onPress={() => {
                    onClose();
                    removeLocation(locations[itemKey].id);
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
                      checkLocalName(locations[itemKey].id).then(onClose());
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
        isOpen={addLocationIsOpen}
        onOpenChange={() => {
          setAddLocationIsOpen(!addLocationIsOpen);
          clearStates();
        }}
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1 text-center">
                Adicionar novo local
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
                    handleAddNewLocation();
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

export default LocationManagement;
