//React
import { useState, useEffect, useContext, useMemo } from "react";

//Components
import { Divider, FullContainer, Button, Select } from "../../components";
import Subtitle from "./components/subtitle";

//NextUI
import {
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
  SelectItem,
  Spinner,
  Checkbox,
} from "@nextui-org/react";

//Icons
import HourglassBottomIcon from "@mui/icons-material/HourglassBottom";
import PersonIcon from "@mui/icons-material/Person";
import AirlineSeatReclineNormalIcon from "@mui/icons-material/AirlineSeatReclineNormal";
import AssistWalkerIcon from "@mui/icons-material/AssistWalker";
import EmojiEmotionsIcon from "@mui/icons-material/EmojiEmotions";
import ReportIcon from "@mui/icons-material/Report";
import DeleteForeverIcon from "@mui/icons-material/DeleteForever";

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
  const [inService, setInService] = useState(false);
  const [isLocationOpen, setLocationIsOpen] = useState(false);

  const [page, setPage] = useState(1);

  const [tokensLength, setTokensLength] = useState(1);
  const [tokens, setTokens] = useState([]);
  const [activeTokens, setActiveTokens] = useState([]);
  const [originalTokens, setOriginalTokens] = useState([]);
  const [itemKey, setItemKey] = useState();

  const [showFinished, setShowFinished] = useState(false);

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
      handleUserServices();
    });

    return () => {
      socket.off("new_token");
    };
    // eslint-disable-next-line
  }, []);

  const emitSignalQueueUpdate = (token) => {
    const data = {
      token_id: token.id,
      position: token.position,
      service: token.service,
      priority: token.priority,
      requested_by: token.requested_by,
      created_by: token.created_by,
      location: currentLocation,
      table: currentTable,
    };
    socket.emit("queued_update", data);
  };

  const emitSignalTokenUpdate = () => {
    socket.emit("new_token");
  };

  const insertOnQueue = async (token) => {
    try {
      await api.post("/queue/registration", {
        token_id: token.id,
        position: token.position,
        service: token.service,
        priority: token.priority,
        requested_by: token.requested_by,
        table: currentTable,
        location: currentLocation,
      });
    } catch (err) {
      toast.error(
        "Houve um problema ao cadastrar na fila! Tente novamente em alguns instantes!"
      );
      console.log(err);
      return;
    }
  };

  const removeFromQueue = async (token) => {
    try {
      await api.post("/queue/remove", {
        token_id: token.id,
      });
    } catch (err) {
      toast.error(
        "Houve um problema ao adiar esse chamado... Tente novamente em alguns instantes!"
      );
      console.log(err);
      return;
    }
  };

  const handleServices = async () => {
    try {
      const response = await api.get("/services/query");
      setServices(response.data);
    } catch (error) {
      console.log("Erro ao obter lista de serviços: " + error);
    }
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
    } catch (error) {
      console.log("Falha ao obter serviços do usuário!");
    }
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

      setOriginalTokens(tokens);

      const activeTokens = tokens.filter((token) => {
        return token.status.toUpperCase() !== "CONCLUIDO";
      });

      setActiveTokens(activeTokens);
      setTokens(activeTokens);
      setTokensLength(activeTokens.length);

      getSessionContext(activeTokens);
    } else if (currentUser.permission_level >= 4) {
      const activeTokens = data.filter((token) => {
        return token.status.toUpperCase() !== "CONCLUIDO";
      });

      setOriginalTokens(data);

      setActiveTokens(activeTokens);
      setTokens(activeTokens);
      setTokensLength(activeTokens.length);

      getSessionContext(data);
    }
  };

  const filterTokens = (mode) => {
    if (mode) {
      setTokens(originalTokens);
      setTokensLength(originalTokens.length);
    } else {
      setTokens(activeTokens);
      setTokensLength(activeTokens.length);
    }
  };

  const updateToken = async (newStatus, id) => {
    try {
      await api.post("/token/update", {
        status: newStatus,
        id: id,
        delayed_by: currentUser.name,
      });

      emitSignalTokenUpdate();
    } catch (error) {
      console.error(error);
    }
  };

  const closeToken = async (id) => {
    try {
      await api.post("/token/close", {
        status: "CONCLUIDO",
        id: id,
        solved_by: currentUser.name,
      });

      emitSignalTokenUpdate();
    } catch (error) {
      console.error(error);
    }
  };

  const handleDeleteToken = async (id) => {
    try {
      const response = await api.get(`/token/query/byId/${id}`);
      const data = response.data;

      if (data[0].status === "EM ATENDIMENTO") {
        toast.warn("Essa senha está em atendimento!");
        toast.error("Não é possível excluir essa senha no momento!");
        return;
      }

      try {
        await api.post(`/token/remove/byId/${id}`).then((response) => {
          if (response.data === "success") {
            toast.success("A senha foi removida!");
          } else {
            toast.error("Houve um problema na remoção da senha!");
          }
          emitSignalTokenUpdate();
        });
      } catch (error) {
        console.log("Delete Token Error: " + error);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const countTables = (definedLocation) => {
    const location = locations.find(
      (location) => location.id === definedLocation
    );
    count(location.tables);
  };

  const count = (x) => {
    const numbers = [];
    for (let i = 1; i <= x; i++) {
      numbers.push({ value: `GUICHÊ ${i}` });
    }
    setLocationTable(numbers);
  };

  const updateSessionContext = async (tokenKey, inService, id) => {
    const session = {
      inService: inService,
      token_position: tokenKey,
      token_id: id,
    };

    localStorage.setItem("currentSession", JSON.stringify(session));
  };

  const getSessionContext = async (tokens) => {
    const currentSession = await JSON.parse(
      localStorage.getItem("currentSession")
    );

    if (currentSession) {
      if (
        currentSession.token_id === tokens[currentSession.token_position].id
      ) {
        setItemKey(currentSession.token_position);
        setInService(currentSession.inService);
        onOpen();
      } else {
        toast.info("Parece que o seu atendimento anterior foi encerrado...");
        localStorage.removeItem("currentSession");
      }
    }
  };

  return (
    <FullContainer>
      <div className="flex flex-col w-full sm:w-[95%]">
        <div className="flex flex-row w-full items-center">
          <div className="flex flex-col w-full gap-2 justify-end sm:flex-row">
            <Select
              isRequired
              isOpen={isLocationOpen}
              size="sm"
              items={locations}
              label="Qual local você está no momento?"
              placeholder="Indique seu local"
              className="mb-1 sm:max-w-xs border-none shadow-none"
              variant="faded"
              value={currentLocation}
              onSelectionChange={(key) => {
                countTables(parseInt(key.currentKey));
                setCurrentLocation(parseInt(key.currentKey));
              }}
              onOpenChange={(open) =>
                open !== isLocationOpen && setLocationIsOpen(open)
              }
            >
              {locations.map((item) => (
                <SelectItem key={item.id}>{item.name}</SelectItem>
              ))}
            </Select>
            <Select
              size="sm"
              items={locationTable}
              label="Em qual mesa você está?"
              placeholder="Indique sua mesa"
              className="mb-1 sm:max-w-xs border-none shadow-none"
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
          </div>
        </div>

        <Table
          aria-label="Lista de fichas disponiveis para você"
          onRowAction={(key) => {
            findIndexById(key);
            onOpen();
          }}
          isStriped
          bottomContent={
            <div className="flex w-full items-center justify-center">
              <div className="flex self-center">
                <Pagination
                  isCompact
                  showControls
                  color="success"
                  page={page}
                  total={pages}
                  onChange={(page) => setPage(page)}
                />
              </div>
              <div className="flex flex-row right-5 absolute w-[42%] justify-end">
                <Checkbox
                  isSelected={showFinished}
                  onValueChange={() => {
                    setShowFinished(!showFinished);
                    filterTokens(!showFinished);
                  }}
                >
                  Mostrar concluídos...
                </Checkbox>
              </div>
            </div>
          }
          classNames={{
            wrapper: "min-h-[222px]",
          }}
        >
          <TableHeader>
            <TableColumn className="w-1/12">FICHA Nº</TableColumn>
            <TableColumn>SERVIÇO</TableColumn>
            <TableColumn className="hidden sm:flex sm:items-center h-11">
              SOLICITADO POR
            </TableColumn>
            <TableColumn className="w-2/12">
              <Subtitle />
            </TableColumn>
          </TableHeader>
          <TableBody
            items={items}
            emptyContent={
              tokensLength > 0 ? (
                <Spinner size="lg" label="Carregando..." color="primary" />
              ) : (
                <div className="flex flex-col text-sm">
                  <Spinner
                    size="sm"
                    color="success"
                    label="Não há fichas disponíveis no momento..."
                  />
                  Não se preocupe, novas fichas serão mostradas automaticamente
                  assim que estiverem disponíveis.
                </div>
              )
            }
          >
            {(item) => (
              <TableRow
                key={item.id}
                className="hover:cursor-pointer hover:opacity-90 hover:ring-2 rounded-lg hover:shadow-md hover:scale-[101%] transition-all"
              >
                <TableCell>{item.position}</TableCell>
                <TableCell>{services[item.service - 1].name}</TableCell>
                <TableCell className="hidden sm:table-cell">
                  {item.requested_by !== ""
                    ? item.requested_by
                    : "Nome não fornecido"}
                </TableCell>
                <TableCell className="flex">
                  {item.priority === 1 ? (
                    <Chip
                      radius="full"
                      startContent={<AssistWalkerIcon />}
                      className="bg-alert w-[1.9rem] self-center mr-1.5 "
                    />
                  ) : (
                    <Chip
                      radius="full"
                      startContent={<PersonIcon />}
                      className="bg-success w-8 self-center mr-1.5"
                    />
                  )}
                  {item.status === "EM ESPERA" ? (
                    <Chip
                      radius="full"
                      startContent={<HourglassBottomIcon />}
                      className="bg-info w-8 self-center mr-1.5"
                    />
                  ) : item.status === "EM ATENDIMENTO" ? (
                    <Chip
                      radius="full"
                      startContent={<AirlineSeatReclineNormalIcon />}
                      className="bg-info w-8 self-center mr-1.5"
                    />
                  ) : item.status === "ADIADO" ? (
                    <div>
                      <Chip
                        radius="full"
                        startContent={<HourglassBottomIcon />}
                        className="bg-info w-8 self-center mr-1.5"
                      />
                      <Chip
                        radius="full"
                        startContent={<ReportIcon />}
                        className="bg-failed w-8 self-center mr-1.5"
                      />
                    </div>
                  ) : item.status === "CONCLUIDO" ? (
                    <Chip
                      radius="full"
                      startContent={<EmojiEmotionsIcon />}
                      className="bg-success w-8 self-center mr-1.5"
                    />
                  ) : null}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <Modal
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        backdrop={inService ? "blur" : "opaque"}
        isDismissable={inService ? false : true}
        hideCloseButton={inService ? true : false}
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1 justify-center items-center font-semibold">
                Dados da Ficha
                <section className="flex gap-3 justify-center items-center">
                  {tokens[itemKey].priority === 1 ? (
                    <Chip
                      size="sm"
                      radius="sm"
                      className="bg-alert"
                      startContent={<AssistWalkerIcon size={18} />}
                    >
                      PRIORIDADE
                    </Chip>
                  ) : (
                    <Chip
                      size="sm"
                      radius="sm"
                      className="bg-success"
                      startContent={<PersonIcon size={18} />}
                    >
                      NORMAL
                    </Chip>
                  )}
                  {tokens[itemKey].status === "EM ESPERA" ? (
                    <Chip
                      size="sm"
                      radius="sm"
                      className="bg-info"
                      startContent={<HourglassBottomIcon size={18} />}
                    >
                      EM ESPERA
                    </Chip>
                  ) : tokens[itemKey].status === "EM ATENDIMENTO" ? (
                    <Chip
                      size="sm"
                      radius="sm"
                      className="bg-infoSecondary"
                      startContent={<AirlineSeatReclineNormalIcon size={18} />}
                    >
                      EM ATENDIMENTO
                    </Chip>
                  ) : tokens[itemKey].status === "CONCLUIDO" ? (
                    <Chip
                      size="sm"
                      radius="sm"
                      className="bg-success"
                      startContent={<EmojiEmotionsIcon size={18} />}
                    >
                      CONCLUÍDO
                    </Chip>
                  ) : tokens[itemKey].status === "ADIADO" ? (
                    <div className="flex gap-3">
                      <Chip
                        size="sm"
                        radius="sm"
                        className="bg-info"
                        startContent={<HourglassBottomIcon size={18} />}
                      >
                        EM ESPERA
                      </Chip>
                      <Chip
                        size="sm"
                        radius="sm"
                        className="bg-failed"
                        startContent={<ReportIcon size={18} />}
                      >
                        ADIADO
                      </Chip>
                    </div>
                  ) : null}
                </section>
              </ModalHeader>
              <Divider />
              <ModalBody>
                <div>
                  <h5 className="font-bold">Número da ficha: </h5>
                  <h6 className="indent-2">{tokens[itemKey].position}</h6>
                </div>
                <div>
                  <h5 className="font-bold">Serviço desejado: </h5>
                  <h6 className="indent-2">
                    {services[tokens[itemKey].service - 1].name}
                  </h6>
                </div>
                <div>
                  <h5 className="font-bold">Criada por: </h5>
                  <h6 className="indent-2">
                    {tokens[itemKey].created_by} em {tokens[itemKey].created_at}
                  </h6>
                </div>
                {tokens[itemKey].requested_by !== "" ? (
                  <div>
                    <h5 className="font-bold">Solicitada por: </h5>
                    <h6 className="indent-2">{tokens[itemKey].requested_by}</h6>
                  </div>
                ) : (
                  <p>Solicitada por: NÃO FOI ESPECIFICADO</p>
                )}
                {tokens[itemKey].delayed_at !== null ? (
                  <div>
                    <h5 className="font-bold">Adiada por: </h5>
                    <h6 className="indent-2">
                      {tokens[itemKey].delayed_by} em{" "}
                      {tokens[itemKey].delayed_at}
                    </h6>
                  </div>
                ) : null}
                {tokens[itemKey].solved_at !== null ? (
                  <div>
                    <h5 className="font-bold">Atendida por: </h5>
                    <h6 className="indent-2">
                      {tokens[itemKey].solved_by} em {tokens[itemKey].solved_at}
                    </h6>
                  </div>
                ) : null}
              </ModalBody>
              <Divider />
              <ModalFooter className="flex justify-center align-middle">
                {inService ? (
                  <>
                    <Button
                      mode="failed"
                      onPress={() => {
                        setTimeout(async () => {
                          removeFromQueue(tokens[itemKey]).then((response) => {
                            if (response === "failed") {
                              toast.error(
                                "Houve um problema ao adiar essa ficha... Tente novamente em instantes..."
                              );
                            } else {
                              updateToken("ADIADO", tokens[itemKey].id);
                              toast.info("A ficha foi adiada!");
                              setInService(false);
                              localStorage.removeItem("currentSession");
                              onClose();
                            }
                          });
                        }, 500);
                      }}
                    >
                      Adiar
                    </Button>
                    <Button
                      onPress={() => {
                        setTimeout(async () => {
                          closeToken(tokens[itemKey].id);
                          setInService(false);
                          localStorage.removeItem("currentSession");
                          onClose();
                          toast.success("O chamado foi concluído");
                        }, 500);
                      }}
                      mode="success"
                    >
                      Concluir
                    </Button>
                  </>
                ) : (
                  <>
                    <Button
                      isDisabled={
                        currentUser.permission_level > 2 ? false : true
                      }
                      className="bg-transparent text-failed w-15"
                      onPress={() => {
                        handleDeleteToken(tokens[itemKey].id);
                        onClose();
                      }}
                      startContent={<DeleteForeverIcon />}
                    >
                      DELETAR
                    </Button>
                    <Button
                      onPress={() => {
                        onClose();
                      }}
                      mode="failed"
                    >
                      Fechar
                    </Button>
                    <Button
                      isDisabled={
                        tokens[itemKey].status === "CONCLUIDO" ||
                        tokens[itemKey].status === "EM ATENDIMENTO"
                          ? true
                          : false
                      }
                      onPress={() => {
                        if (currentLocation) {
                          setTimeout(async () => {
                            updateToken("EM ATENDIMENTO", tokens[itemKey].id);
                            insertOnQueue(tokens[itemKey]);
                            emitSignalQueueUpdate(tokens[itemKey]);
                            setInService(true);
                            updateSessionContext(
                              itemKey,
                              true,
                              tokens[itemKey].id
                            );
                            toast.success(
                              "A ficha foi adicionada a fila de chamada..."
                            );
                          }, 500);
                        } else {
                          toast.info(
                            "Você deve definir o seu local antes de fazer uma chamada..."
                          );
                          setLocationIsOpen(!isLocationOpen);
                          onClose();
                        }
                      }}
                      mode="success"
                    >
                      Chamar
                    </Button>
                  </>
                )}
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </FullContainer>
  );
}

export default TokensList;
