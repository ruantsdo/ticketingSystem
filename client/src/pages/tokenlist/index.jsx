//React
import { useState, useEffect, useContext, useMemo } from "react";
//Components
import { Divider, FullContainer, Button, Select } from "../../components";
import Subtitle from "./components/subtitle";
import SuggestionCard from "./components/suggestion";
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
//Contexts - Providers
import AuthContext from "../../contexts/auth";
import { useWebSocket } from "../../contexts/webSocket";
import { useConfirmIdentity } from "../../providers/confirmIdentity";
//Toast
import { toast } from "react-toastify";
//Stores
import useLocationsStore from "../../stores/locationsStore/store";
import useSocketUtils from "../../utils/socketUtils";
import useServicesStore from "../../stores/servicesStore/store";
import useUsersStore from "../../stores/usersStore/store";
import useSettingsStore from "../../stores/settingsStore/store";

function TokensList() {
  const { socket } = useWebSocket();

  const { currentUser } = useContext(AuthContext);
  const { requestAuth } = useConfirmIdentity();

  const { getActivesLocations, getLocationsList } = useLocationsStore();
  const { getAllServices } = useServicesStore();
  const { getUserServices } = useUsersStore();
  const { queueUpdateSignal, tokenUpdateSignal } = useSocketUtils();
  const { getFullSettings } = useSettingsStore();

  const { isOpen, onOpen, onOpenChange } = useDisclosure();

  const [settings, setSettings] = useState(null);

  const [inService, setInService] = useState(false);
  const [isLocationOpen, setLocationIsOpen] = useState(false);

  const [page, setPage] = useState(1);

  const [tokens, setTokens] = useState([]);
  const [activeTokens, setActiveTokens] = useState([]);
  const [originalTokens, setOriginalTokens] = useState([]);
  const [itemKey, setItemKey] = useState();

  const [showFinished, setShowFinished] = useState(false);
  const [prioritySuggestion, setPrioritySuggestion] = useState(null);
  const [normalSuggestion, setNormalSuggestion] = useState(null);

  const [locations, setLocations] = useState([]);
  const [activeLocations, setActiveLocations] = useState([]);
  const [currentLocation, setCurrentLocation] = useState("");
  const [locationTable, setLocationTable] = useState([]);
  const [currentTable, setCurrentTable] = useState("");
  const [userServices, setUserServices] = useState([]);

  const [isPostPoneEnable, setIsPostPoneEnable] = useState(false);
  const [isPostPoneCountDown, setIsPostPoneCountDown] = useState(0);

  const [services, setServices] = useState([]);

  const rowsPerPage = 6;

  const pages = Math.ceil(tokens.length / rowsPerPage);

  const items = useMemo(() => {
    const start = (page - 1) * rowsPerPage;
    const end = start + rowsPerPage;

    return tokens.slice(start, end);
  }, [page, tokens]);

  const findIndexById = (key) => {
    for (let i = 0; i <= tokens.length; i++) {
      // eslint-disable-next-line
      if (tokens[i].id == key) {
        setItemKey(i);
        return;
      }
    }
  };

  const countdownPostponeTimer = (token) => {
    const deficiency = token.deficiencies ? settings.deficiency_delay : 0;

    setIsPostPoneCountDown(settings.minimum_delay + deficiency);
    setIsPostPoneEnable(false);

    const intervalId = setInterval(() => {
      setIsPostPoneCountDown((prevCountDown) => {
        if (prevCountDown > 1) {
          return prevCountDown - 1;
        } else {
          clearInterval(intervalId);
          setIsPostPoneEnable(true);
          return 0;
        }
      });
    }, 1000);

    return () => {
      clearInterval(intervalId);
    };
  };

  const handleOpenModal = (tokenId) => {
    findIndexById(tokenId);
    onOpen();
  };

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
    queueUpdateSignal(data);
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

  const filterTokens = (mode) => {
    if (mode) {
      setTokens(originalTokens);
    } else {
      setTokens(activeTokens);
    }
  };

  const updateCalledToken = async (tokenId) => {
    try {
      await api.post("/token/update/", {
        id: tokenId,
        called_by: currentUser.name,
      });
      tokenUpdateSignal();
    } catch (error) {
      console.error(error);
    }
  };

  const updateTokenStatus = async (newStatus, id) => {
    try {
      await api.post("/token/update/status", {
        status: newStatus,
        id: id,
        delayed_by: currentUser.name,
      });
      tokenUpdateSignal();
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
      tokenUpdateSignal();
    } catch (error) {
      console.error(error);
    }
  };

  const handleDeleteToken = async (id) => {
    requestAuth(async (userLevel) => {
      if (userLevel < 3) {
        toast.warn("Este usuário não tem as permissões necessárias");
        return;
      }

      try {
        const response = await api.get(`/token/query/byId/${id}`);
        const data = response.data;

        if (data[0].status === "EM ATENDIMENTO") {
          toast.warn("Essa ficha está em atendimento!");
          toast.error("Não é possível excluir essa ficha no momento!");
          return;
        }

        try {
          await api.post(`/token/remove/byId/${id}`).then((response) => {
            if (response.data === "success") {
              toast.success("A ficha foi removida!");
              tokenUpdateSignal();
            } else {
              toast.error("Houve um problema na remoção da ficha!");
            }
          });
        } catch (error) {
          console.log("Delete Token Error: " + error);
        }
      } catch (error) {
        console.error(error);
      }
    });
  };

  const countTables = (definedLocation) => {
    const location = activeLocations.find(
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

  const updateSessionContext = async (tokenKey, inService, token) => {
    const session = {
      inService: inService,
      token_position: tokenKey,
      token: token,
    };

    localStorage.setItem("currentSession", JSON.stringify(session));
  };

  const getSessionContext = async (tokens) => {
    const currentSession = await JSON.parse(
      localStorage.getItem("currentSession")
    );

    if (currentSession) {
      const currentToken = currentSession.token;
      if (currentToken.id === tokens[currentSession.token_position].id) {
        setItemKey(currentSession.token_position);
        setInService(currentSession.inService);
        onOpen();
      } else {
        localStorage.removeItem("currentSession");
        toast.info("Parece que seu atendimento anterior foi removido ...");
      }
    }
  };

  const getCurrentServiceName = (id) => {
    const currentService = services.find((service) => service.id === id);

    return currentService.name;
  };

  const getSettings = async () => {
    const newSettings = await getFullSettings();

    setSettings(newSettings);
  };

  const getInitialData = async () => {
    try {
      const [services, locations, userServices, activeLocations, settings] =
        await Promise.all([
          getAllServices(),
          getLocationsList(),
          getUserServices(currentUser.id),
          getActivesLocations(),
          getFullSettings(),
        ]);
      setServices(services);
      setLocations(locations);
      setUserServices(userServices);
      setActiveLocations(activeLocations);
      setSettings(settings);
    } catch (error) {
      console.log("Falha ao obter dados iniciais");
      console.error(error);
    }
  };

  const getFilteredTokens = async () => {
    if (currentUser.permission_level >= 4) {
      const response = await api.get("/token/query");
      const fullTokens = response.data;
      if (fullTokens.length <= 0) return [];
      const activeTokens = fullTokens.filter((token) => {
        return token.status.toUpperCase() !== "CONCLUIDO";
      });

      setOriginalTokens(fullTokens);

      getTokenSuggestion(activeTokens);
      setActiveTokens(activeTokens);
      setTokens(activeTokens);

      getSessionContext(fullTokens);

      return;
    }

    const serviceIDs = userServices.map((item) => item.service_id);

    const response = await api.post("/token/query/by_services_list", {
      userServices: serviceIDs,
    });

    const filteredTokens = response.data;

    if (filteredTokens.length <= 0) return [];

    const activeTokens = filteredTokens.filter((token) => {
      return token.status.toUpperCase() !== "CONCLUIDO";
    });

    getTokenSuggestion(activeTokens);

    setActiveTokens(activeTokens);

    setTokens(activeTokens);

    setOriginalTokens(filteredTokens);

    getSessionContext(filteredTokens);
  };

  const getTokenSuggestion = (tokens) => {
    const priorityToken = tokens.find((token) => {
      if (token.priority === 1) {
        if (token.status !== "CONCLUIDO" && token.status !== "EM ATENDIMENTO")
          return token;
      }
      return null;
    });

    const normalToken = tokens.find((token) => {
      if (token.priority === 0) {
        if (token.status !== "CONCLUIDO" && token.status !== "EM ATENDIMENTO")
          return token;
      }
      return null;
    });

    let priorityTokenService = "";
    let normalTokenService = "";

    if (services.length > 0) {
      if (priorityToken) {
        priorityTokenService = getCurrentServiceName(priorityToken.service);
      } else {
        priorityTokenService =
          "Não há fichas de prioridade para serem sugeridas no momento!";
      }
      if (normalToken) {
        normalTokenService = getCurrentServiceName(normalToken.service);
      } else {
        normalTokenService = "Não há fichas para serem sugeridas no momento!";
      }
    }

    const findIndex = (id) => {
      setItemKey(tokens.findIndex((t) => t.id === id));
      onOpen();
    };

    if (priorityToken) {
      setPrioritySuggestion(
        <SuggestionCard
          target={priorityToken}
          service={priorityTokenService}
          handleOpenModal={() => findIndex(priorityToken.id)}
        />
      );
    } else {
      setPrioritySuggestion(null);
    }

    if (normalToken) {
      setNormalSuggestion(
        <SuggestionCard
          target={normalToken}
          service={normalTokenService}
          handleOpenModal={() => findIndex(normalToken.id)}
        />
      );
    } else {
      setNormalSuggestion(null);
    }
  };

  useEffect(() => {
    getInitialData();
    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    getFilteredTokens();
    // eslint-disable-next-line
  }, [userServices]);

  useEffect(() => {
    socket.on("new_token", () => {
      getFilteredTokens();
    });

    socket.on("settings_update", () => {
      getSettings();
    });

    socket.on("midNight", () => {
      toast.warning("A sessão atual será limpa e atualizada em 5 segundos!");
      setTimeout(() => {
        localStorage.removeItem("currentSession");
        window.location.reload(true);
      }, 5000);
    });

    return () => {
      socket.off("new_token");
      socket.off("midNight");
    };
  });

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
              {activeLocations.map((item) => (
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
          aria-label="Lista de fichas disponíveis para você"
          onRowAction={(key) => {
            handleOpenModal(key);
          }}
          isStriped
          bottomContent={
            <div className="flex w-full items-center justify-center">
              <div className="flex self-center">
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
              tokens.length > 0 ? (
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
                <TableCell>{getCurrentServiceName(item.service)}</TableCell>
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
        {(prioritySuggestion || normalSuggestion) && (
          <>
            <p className="text-xl font-semibold mt-2">Sugestões</p>
            <div className="flex flex-row w-full gap-1 mt-1">
              {prioritySuggestion}
              {normalSuggestion}
            </div>
          </>
        )}
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
                  ) : (
                    tokens[itemKey].status === "ADIADO" && (
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
                    )
                  )}
                </section>
                {tokens[itemKey].deficiencies && (
                  <h6 className="text-md">
                    Pessoa com deficiência: {tokens[itemKey].deficiencies}
                  </h6>
                )}
              </ModalHeader>
              <Divider />
              <ModalBody>
                <div>
                  <h5 className="font-bold">Ficha</h5>
                  <h6 className="indent-2">
                    {getCurrentServiceName(tokens[itemKey].service)} [{" "}
                    {tokens[itemKey].position} ]
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
                <div>
                  <h5 className="font-bold">Ficha criada por: </h5>
                  <h6 className="indent-2">
                    {tokens[itemKey].created_by} em {tokens[itemKey].created_at}
                  </h6>
                </div>
                {tokens[itemKey].called_by && (
                  <div>
                    <h5 className="font-bold">Chamada por: </h5>
                    <h6 className="indent-2">
                      {tokens[itemKey].called_by} em {tokens[itemKey].called_at}
                    </h6>
                  </div>
                )}
                {tokens[itemKey].delayed_at && (
                  <div>
                    <h5 className="font-bold">Adiada por: </h5>
                    <h6 className="indent-2">
                      {tokens[itemKey].delayed_by} em{" "}
                      {tokens[itemKey].delayed_at}
                    </h6>
                  </div>
                )}
                {tokens[itemKey].solved_at && (
                  <div>
                    <h5 className="font-bold">Atendida por: </h5>
                    <h6 className="indent-2">
                      {tokens[itemKey].solved_by} em {tokens[itemKey].solved_at}
                    </h6>
                  </div>
                )}
                {tokens[itemKey].description && (
                  <div>
                    <h5 className="font-bold">OBSERVAÇÕES: </h5>
                    <h6 className="indent-2">{tokens[itemKey].description}</h6>
                  </div>
                )}
              </ModalBody>
              <Divider />
              <ModalFooter className="flex justify-center align-middle">
                {inService ? (
                  <>
                    <Button
                      mode="failed"
                      isDisabled={!isPostPoneEnable}
                      onPress={() => {
                        setTimeout(async () => {
                          removeFromQueue(tokens[itemKey]).then((response) => {
                            if (response === "failed") {
                              toast.error(
                                "Houve um problema ao adiar essa ficha... Tente novamente em instantes..."
                              );
                            } else {
                              updateTokenStatus("ADIADO", tokens[itemKey].id);
                              localStorage.removeItem("currentSession");
                              toast.info("A ficha foi adiada!");
                              setInService(false);
                              onClose();
                              setIsPostPoneEnable(false);
                            }
                          });
                        }, 500);
                      }}
                    >
                      {isPostPoneEnable
                        ? "Adiar"
                        : `Adiar (${isPostPoneCountDown})`}
                    </Button>
                    <Button
                      isDisabled={!isPostPoneEnable}
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
                      {isPostPoneEnable
                        ? "Concluir"
                        : `Concluir (${isPostPoneCountDown})`}
                    </Button>
                  </>
                ) : (
                  <>
                    <Button
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
                          setTimeout(() => {
                            updateTokenStatus(
                              "EM ATENDIMENTO",
                              tokens[itemKey].id
                            );
                            insertOnQueue(tokens[itemKey]);
                            emitSignalQueueUpdate(tokens[itemKey]);
                            setInService(true);
                            updateSessionContext(
                              itemKey,
                              true,
                              tokens[itemKey]
                            );
                            updateCalledToken(tokens[itemKey].id);
                            countdownPostponeTimer(tokens[itemKey]);
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
