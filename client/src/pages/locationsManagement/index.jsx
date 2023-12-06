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

function LocationManagement() {
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const { currentUser } = useContext(AuthContext);

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
        return;
      }
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

  const updateLocation = async (id, name, description, tables) => {
    try {
      await api.post("/location/update", {
        id: id,
        name: name,
        description: description,
        tables: tables,
        created_by: currentUser.name,
      });
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    handleLocations();
  }, []);

  return (
    <FullContainer>
      <Notification />
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
      >
        <TableHeader>
          <TableColumn className="w-1/12">ID</TableColumn>
          <TableColumn>SERVIÇO</TableColumn>
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

      <Modal isOpen={isOpen} onOpenChange={onOpenChange} backdrop="opaque">
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1 justify-center items-center font-semibold">
                Dados do local
                <section className="flex gap-3 justify-center items-center"></section>
              </ModalHeader>
              <Divider />
              <ModalBody>
                <Input
                  isReadOnly
                  label="NOME"
                  defaultValue={locations[itemKey].name}
                />
                <Input
                  isReadOnly
                  label="DESCRIÇÃO"
                  defaultValue={locations[itemKey].description}
                />
                <Input
                  isReadOnly
                  label="QUANTIDADE DE MESAS"
                  defaultValue={locations[itemKey].tables}
                />
              </ModalBody>
              <Divider />
              <ModalFooter className="flex justify-between align-middle">
                <Button
                  className="bg-transparent text-failed w-15"
                  onPress={() => {
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
    </FullContainer>
  );
}

export default LocationManagement;
