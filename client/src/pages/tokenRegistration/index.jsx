//React
import { useState, useEffect, useContext } from "react";

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

function QueueRegistration() {
  const { socket } = useWebSocket();
  const { currentUser } = useContext(AuthContext);

  const [services, setServices] = useState([]);

  const [priority, setPriority] = useState(0);
  const [selectedService, setSelectedService] = useState("");

  const [availability, setAvaliability] = useState(true);
  const [remaining, setRemaining] = useState("");

  useEffect(() => {
    handleServices();
  }, []);

  const formik = useFormik({
    initialValues: {
      requested_by: "",
    },
    onSubmit: async (values) => {
      try {
        await api
          .post("/token/registration", {
            priority: priority,
            services: selectedService,
            created: currentUser.name,
            requested_by: values.requested_by,
          })
          .then((response) => {
            notify(response.data);
          });
      } catch (err) {
        toast.error(
          "Houve um problema ao cadastrar a nova ficha! Tente novamente em alguns instantes!"
        );
        console.log(err);
      }
    },
  });

  const notify = (response) => {
    if (response === "success") {
      toast.success("Ficha registrada!");
      emitNewTokenSignal();
      formik.resetForm();
    } else if (response === "failed") {
      toast.warn(
        "Falha ao registrar nova ficha! Tente novamente em alguns instantes!"
      );
    }
  };

  const checkAvailability = async (serviceId) => {
    try {
      const service = await api.get(`/services/query/${serviceId}`);
      const token = await api.get(`/token/query/${serviceId}`);

      if (service.data[0].limit === 0) {
        setAvaliability(true);
        setRemaining(<AllInclusiveIcon />);

        return;
      }

      if (service.data[0].limit >= token.data.length && token.data.length > 0) {
        setAvaliability(false);
        setRemaining(`${token.data.length}/${service.data[0].limit}`);
      } else {
        setAvaliability(true);
        setRemaining(`${token.data.length}/${service.data[0].limit}`);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleServices = async () => {
    try {
      const response = await api.get("/services/query");
      setServices(response.data);
    } catch (error) {
      console.error(error);
    }
  };

  const emitNewTokenSignal = () => {
    socket.emit("new_token");
  };

  return (
    <FullContainer>
      <Card>
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
              placeholder="Selecione um serviço"
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
    </FullContainer>
  );
}

export default QueueRegistration;
