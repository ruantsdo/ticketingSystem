//React
import React, {
  useRef,
  useState,
  useEffect,
  useContext,
  forwardRef,
} from "react";

//Components
import {
  Input,
  Card,
  Divider,
  FullContainer,
  Button,
  Select,
} from "../../components";

//NextUI
import { SelectItem } from "@nextui-org/react";

//Validation
import { Formik, Form, useFormik } from "formik";

//Icons
import AddTaskIcon from "@mui/icons-material/AddTask";
import AllInclusiveIcon from "@mui/icons-material/AllInclusive";

//Services
import api from "../../services/api";

//Contexts
import AuthContext from "../../contexts/auth";
import { useWebSocket } from "../../contexts/webSocket";

//Toast
import { toast } from "react-toastify";

//Store
import { useServicesStore, useTokensStore } from "../../stores";
import useSocketUtils from "../../utils/socketUtils";

import { useReactToPrint } from "react-to-print";

function QueueRegistration() {
  const receiptRef = useRef();
  const { newTokenSignal } = useSocketUtils();
  const { socket } = useWebSocket();
  const { getActiveServices, getServiceById } = useServicesStore();
  const { getTokensByServiceId } = useTokensStore();
  const { currentUser, isAdmin } = useContext(AuthContext);

  const [services, setServices] = useState([]);

  const [priority, setPriority] = useState(0);
  const [selectedService, setSelectedService] = useState("");

  const [availability, setAvailability] = useState(false);
  const [remaining, setRemaining] = useState("");

  const [tokenData, setTokenData] = useState([]);

  useEffect(() => {
    handleServices();

    socket.on("services_updated", () => {
      handleServices();
    });

    socket.on("midNight", () => {
      toast.warning("A sessão atual será limpa e atualizada em 5 segundos!");
      setTimeout(() => {
        window.location.reload(true);
      }, 5000);
    });

    return () => {
      socket.off("services_updated");
      socket.off("midNight");
    };
    // eslint-disable-next-line
  }, []);

  const formik = useFormik({
    initialValues: {
      requested_by: "",
    },
    onSubmit: async (values) => {
      const availability = await checkAvailability(selectedService);
      if (availability || isAdmin) {
        try {
          await api
            .post("/token/registration", {
              priority: priority,
              service: selectedService,
              created: currentUser.name,
              requested_by: values.requested_by,
            })
            .then((response) => {
              const data = response.data;
              setTokenData(data.tokenData);
              notify(data.message);
              checkAvailability(selectedService);

              setTimeout(() => {
                handlePrint();
              }, 500);
            });
        } catch (err) {
          toast.error(
            "Houve um problema ao cadastrar a nova ficha! Tente novamente em alguns instantes!"
          );
          console.log(err);
        }
      } else {
        toast.warn("Parece que não há mais disponibilidade para este serviço!");
      }
    },
  });

  const notify = (response) => {
    if (response === "success") {
      toast.success("Ficha registrada!");
      newTokenSignal();
      formik.resetForm();
    } else if (response === "failed") {
      toast.warn(
        "Falha ao registrar nova ficha! Tente novamente em alguns instantes!"
      );
    }
  };

  const checkAvailability = async (serviceId) => {
    try {
      const service = await getServiceById(serviceId);
      const token = await getTokensByServiceId(serviceId);

      if (service.data[0].limit === 0) {
        setAvailability(true);
        setRemaining(<AllInclusiveIcon />);

        return true;
      }

      if (service.data[0].limit >= token.data.length) {
        setAvailability(true);
        setRemaining(`${token.data.length}/${service.data[0].limit}`);
        return true;
      } else {
        setAvailability(false);
        setRemaining(`${token.data.length}/${service.data[0].limit}`);
        return false;
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleServices = async () => {
    try {
      const response = await getActiveServices();
      setServices(response);
    } catch (error) {
      console.error(error);
    }
  };

  const splitStringIntoLines = (str, maxCharsPerLine) => {
    const regex = new RegExp(`.{1,${maxCharsPerLine}}`, "g");
    return str.match(regex).join("\n");
  };

  const handlePrint = useReactToPrint({
    content: () => receiptRef.current,
  });

  const ReceiptComponent = forwardRef(({ data }, ref) => {
    return (
      <div ref={ref} className="text-center text-darkBackground">
        <h1 className="underline">{process.env.REACT_APP_COMPANY_NAME}</h1>
        <h1 className="text-5xl mt-2">
          {tokenData.service &&
            splitStringIntoLines(
              services.find((service) => service.id === tokenData.service)
                ?.name || "",
              10
            )}
        </h1>
        <h1 className="text-5xl mt-2 mb-2"> [ {tokenData?.position} ] </h1>

        <h1 className="mt-1 mb-1">{tokenData.requested_by}</h1>

        {tokenData?.priority === 1 ? (
          <div className="flex items-center justify-evenly">
            <h6 className="text-start">PRIORIDADE</h6>
            <h5 className="text-end">{tokenData?.created_at}</h5>
          </div>
        ) : (
          <h5 className="text-end">{tokenData?.created_at}</h5>
        )}

        <h6 className="italic">Válido apenas para o dia da emissão!</h6>
      </div>
    );
  });

  return (
    <FullContainer>
      <Card className="absolute">
        <p className="text-3xl">Cadastro de ficha</p>
        <Divider />
        <Formik initialValues={formik.initialValues}>
          <Form
            onSubmit={formik.handleSubmit}
            className="flex flex-col justify-center items-center w-full gap-2"
          >
            <Select
              isRequired
              label="É prioridade?"
              defaultSelectedKeys="0"
              name="priority"
              selectedKeys={priority}
              onSelectionChange={(values) => {
                setPriority(values.currentKey);
              }}
            >
              <SelectItem key={1} value={true}>
                SIM
              </SelectItem>
              <SelectItem key={0} value={false}>
                NÃO
              </SelectItem>
            </Select>
            <Select
              isRequired
              variant={availability ? "flat" : "bordered"}
              items={services}
              label="Indique o serviço desejado"
              placeholder={
                services.length > 0
                  ? "Selecione um serviço"
                  : "Não há serviços cadastrados no momento"
              }
              isInvalid={
                currentUser.permission_level > 2 ? false : !availability
              }
              name="service"
              selectedKeys={selectedService}
              onSelectionChange={(values) => {
                setSelectedService(values.currentKey);
                checkAvailability(values.currentKey);
              }}
              endContent={<span className="text-sm">{remaining}</span>}
            >
              {(service) => (
                <SelectItem key={service.id} value={service.id}>
                  {service.name}
                </SelectItem>
              )}
            </Select>
            <Input
              isRequired
              type="text"
              label="Solicitado por"
              placeholder="Nome de quem está solicitando atendimento."
              name="requested_by"
              onChange={formik.handleChange}
              value={formik.values.requested_by}
            />
            <Divider />
            <Button
              mode="success"
              endContent={<AddTaskIcon />}
              type="submit"
              isDisabled={
                currentUser.permission_level > 2 ? false : !availability
              }
            >
              Registrar
            </Button>
          </Form>
        </Formik>
      </Card>
      <ReceiptComponent
        ref={receiptRef}
        data={{ title: "Receipt", description: "This is a receipt." }}
      />
    </FullContainer>
  );
}

export default QueueRegistration;
