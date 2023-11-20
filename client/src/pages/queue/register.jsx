//React
import React, { useState, useEffect, useContext } from "react";

//Components
import FullContainer from "../../components/fullContainer";

//NextUI
import {
  Card,
  CardBody,
  Button,
  Divider,
  Select,
  SelectItem,
  Input,
} from "@nextui-org/react";

//Validation
import { Formik, Form, useFormik } from "formik";

//Icons
import LoginIcon from "@mui/icons-material/Login";

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
      toast.info(
        "Falha ao registrar nova ficha! Tente novamente em alguns instantes!"
      );
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
      <Card isBlurred className="bg-background sm:w-[50%] w-[95%]" shadow="md">
        <CardBody className="flex gap-3 justify-center items-center">
          <p className="text-defaultTextColor text-3xl">Cadastro de ficha</p>
          <Divider className="bg-divider" />
          <Formik initialValues={formik.initialValues}>
            <Form
              onSubmit={formik.handleSubmit}
              className="flex flex-col gap-3 justify-center items-center w-full"
            >
              <Select
                isRequired
                label="É prioridade?"
                defaultSelectedKeys="0"
                className="w-full"
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
                items={services}
                label="Indique o serviço desejado"
                placeholder="Selecione um serviço"
                className="w-full"
                name="service"
                selectedKeys={selectedService}
                onSelectionChange={(values) => {
                  setSelectedService(values.currentKey);
                }}
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
                className="w-full"
                name="requested_by"
                onChange={formik.handleChange}
                value={formik.values.requested_by}
              />
              <Divider className="bg-divider" />
              <Button
                className="bg-success w-[40%]"
                endContent={<LoginIcon />}
                type="submit"
              >
                Registrar
              </Button>
            </Form>
          </Formik>
        </CardBody>
      </Card>
    </FullContainer>
  );
}

export default QueueRegistration;
