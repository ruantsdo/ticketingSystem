//React
import React, { useState, useEffect, useContext, useMemo } from "react";

//Components
import FullContainer from "../../components/fullContainer";
import Notification from "../../components/notification";

//NextUI
import {
  Button,
  Divider,
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Pagination,
  Chip,
  useDisclosure,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Select,
  SelectItem,
} from "@nextui-org/react";

//Validation
//import { Formik, Form, useFormik } from "formik";

//Icons

//Services
import api from "../../services/api";

//Contexts
import AuthContext from "../../contexts/auth";
import { useWebSocket } from "../../contexts/webSocket";

//Toast
import { toast } from "react-toastify";

function TokensList() {
  const { socket } = useWebSocket();

  const { currentUser } = useContext(AuthContext);
  const { isOpen, onOpen, onOpenChange } = useDisclosure();

  const [page, setPage] = useState(1);

  const [tokensLength, setTokensLength] = useState(1);
  const [tokens, setTokens] = useState([]);
  const [itemKey, setItemKey] = useState();

  const [locations, setLocations] = useState([]);
  const [currentLocation, setCurrentLocation] = useState("");
  const [locationTable, setLocationTable] = useState([]);
  const [currentTable, setCurrentTable] = useState("");

  const [services, setServices] = useState([]);

  const rowsPerPage = 5;

  const pages = Math.ceil(tokensLength / rowsPerPage);

  const items = useMemo(() => {
    const start = (page - 1) * rowsPerPage;
    const end = start + rowsPerPage;

    return tokens.slice(start, end);
  }, [page, tokens]);

  const findIndexById = (key) => {
    for (let i = 0; i < tokensLength; i++) {
      // eslint-disable-next-line
      if (tokens[i].id == key) {
        setItemKey(i);
        return;
      }
    }
  };

  useEffect(() => {
    handleServices();
    handleUserServices();
    handleLocations();
    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    socket.on("new_token", () => {
      handleTokens();
    });

    return () => {
      socket.off("new_token");
    };
    // eslint-disable-next-line
  }, []);

  const emitSignalQueueUpdate = (token) => {
    const data = {
      token_id: token.id,
      sector: token.sector,
      position: token.position,
      service: token.service,
      priority: token.priority,
      requested_by: token.requested_by,
      created_by: token.created_by,
      table: currentTable,
    };
    socket.emit("queued_update", data);
  };

  const insertOnQueue = async (token) => {
    try {
      await api.post("/queue/registration", {
        token_id: token.id,
        position: token.position,
        service: token.service,
        priority: token.priority,
        requested_by: token.requested_by,
        created_by: token.created_by,
        table: currentTable,
      });
    } catch (err) {
      toast.error(
        "Houve um problema ao cadastrar na fila! Tente novamente em alguns instantes!"
      );
      console.log(err);
      return;
    }
  };

  const handleServices = async () => {
    try {
      const response = await api.get("/services/query");
      setServices(response.data);
    } catch (error) {}
  };

  const handleLocations = async () => {
    try {
      const response = await api.get("/location/query");
      const data = response.data;
      setLocations(data);
    } catch (error) {
      console.error(error);
    }
  };

  const handleUserServices = async () => {
    try {
      const response = await api.get(`/user_services/query/${currentUser.id}`);
      handleTokens(response.data);
    } catch (error) {}
  };

  const handleTokens = async (userServices) => {
    try {
      const response = await api.get("/token/query");
      defineFilteredTokens(response.data, userServices);
    } catch (error) {
      console.error(error);
    }
  };

  const defineFilteredTokens = (data, userServices) => {
    if (
      currentUser.permission_level === 3 ||
      currentUser.permission_level === 2
    ) {
      const tokens = data.filter((token) => {
        return userServices.some(
          (userService) => userService.service_id === token.service
        );
      });
      setTokens(tokens);
      setTokensLength(tokens.length);
    } else if (currentUser.permission_level >= 4) {
      setTokens(data);
      setTokensLength(data.length);
    }
  };

  const countTables = (definedLocation) => {
    const location = locations.find(
      (location) => location.name === definedLocation
    );
    count(location.tables);
  };

  const count = (x) => {
    const numbers = [];
    for (let i = 1; i <= x; i++) {
      numbers.push({ value: `MESA ${i}` });
    }
    setLocationTable(numbers);
  };

  return (
    <FullContainer>
      <Select
        isRequired
        size="sm"
        items={locations}
        label="Qual local você está no momento?"
        placeholder="Indique seu local"
        className="max-w-xs shadow-md mb-1 absolute top-[10%] right-[2.5%]"
        variant="faded"
        value={currentLocation}
        onSelectionChange={(key) => {
          countTables(key.currentKey);
          setCurrentLocation(key.currentKey);
        }}
      >
        {locations.map((item) => (
          <SelectItem key={item.name}>{item.name}</SelectItem>
        ))}
      </Select>
      <Select
        size="sm"
        items={locationTable}
        label="Em qual mesa você está?"
        placeholder="Indique sua mesa"
        className="max-w-xs shadow-md mb-1 absolute top-[20%] right-[2.5%]"
        variant="faded"
        value={currentTable}
        onSelectionChange={(key) => {
          setCurrentTable(key.currentKey);
        }}
      >
        {locationTable.map((item) => (
          <SelectItem key={item.value}>{item.value}</SelectItem>
        ))}
      </Select>

      <Table
        aria-label="Lista de fichas disponiveis para o seu setor"
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
        className="w-[95%]"
      >
        <TableHeader>
          <TableColumn>FICHA Nº</TableColumn>
          <TableColumn>SERVIÇO</TableColumn>
          <TableColumn>SOLICITADO POR</TableColumn>
          <TableColumn>PRIORIDADE</TableColumn>
        </TableHeader>
        <TableBody
          items={items}
          emptyContent={"Ainda não há fichas para o seu setor..."}
        >
          {(item) => (
            <TableRow
              key={item.id}
              className="hover:cursor-pointer hover:opacity-90 hover:border border-divider hover:shadow-md"
            >
              <TableCell>{item.position}</TableCell>
              <TableCell>{services[item.service - 1].name}</TableCell>
              <TableCell>
                {item.requested_by !== ""
                  ? item.requested_by
                  : "Nome não fornecido"}
              </TableCell>
              <TableCell>
                {item.priority === 1 ? (
                  <Chip size="sm" radius="sm" className="bg-alert">
                    PRIORIDADE
                  </Chip>
                ) : (
                  <Chip size="sm" radius="sm" className="bg-success">
                    NORMAL
                  </Chip>
                )}
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      <Modal isOpen={isOpen} onOpenChange={onOpenChange} backdrop="opaque">
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                <section className="flex gap-3 justify-center items-center">
                  Dados da Ficha
                  {tokens[itemKey].priority === 1 ? (
                    <Chip size="sm" radius="sm" className="bg-alert">
                      PRIORIDADE
                    </Chip>
                  ) : (
                    <Chip size="sm" radius="sm" className="bg-success">
                      NORMAL
                    </Chip>
                  )}
                </section>
              </ModalHeader>
              <Divider />
              <ModalBody>
                <p>Número da ficha: {tokens[itemKey].position} </p>
                <p>
                  Serviço desejado: {services[tokens[itemKey].service - 1].name}
                </p>
                <p>Ficha criada por: {tokens[itemKey].created_by}</p>
                {tokens[itemKey].requested_by !== "" ? (
                  <p>Ficha solicitada por: {tokens[itemKey].requested_by}</p>
                ) : (
                  <p>Ficha solicitada por: NÃO FOI ESPECIFICADO</p>
                )}
              </ModalBody>
              <Divider />
              <ModalFooter>
                <Button
                  className="bg-failed"
                  onPress={() => {
                    onClose();
                  }}
                >
                  Fechar
                </Button>
                <Button
                  onPress={() => {
                    if (currentTable) {
                      insertOnQueue(tokens[itemKey]);
                      emitSignalQueueUpdate(tokens[itemKey]);
                      toast.success(
                        "A senha foi adicionada a fila de chamada..."
                      );
                    } else {
                      toast.info(
                        "Você deve definir a sua mesa antes de fazer uma chamada..."
                      );
                      onClose();
                    }
                  }}
                  className="bg-success"
                >
                  Chamar
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>

      <Notification />
    </FullContainer>
  );
}

export default TokensList;
