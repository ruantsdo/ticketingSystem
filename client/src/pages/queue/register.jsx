//React
import React, { useState, useEffect, useContext } from "react";

//Components
import FullContainer from "../../components/fullContainer";
import Notification from "../../components/notification";

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
  const [sectors, setSectors] = useState([]);
  const [services, setServices] = useState([]);

  useEffect(() => {
    handleSectors();
    handleServices();
  }, []);

  const formik = useFormik({
    initialValues: {
      priority: false,
      services: "",
      sector: "",
      requested_by: "",
    },
    onSubmit: async (values) => {
      try {
        await api.post("/token/registration", {
          priority: values.priority,
          services: values.services,
          sector: values.sector,
          created: currentUser.name,
          requested_by: values.requested_by,
        });
        toast.success("Ficha cadastrada!");
        emitNewTokenSignal();
      } catch (err) {
        toast.error(
          "Houve um problema ao cadastrar sua ficha! Tente novamente mais tarde!"
        );
        console.log(err);
      }
    },
    validate: (values) => {},
  });

  const handleSectors = async () => {
    try {
      const response = await api.get("/sectors/query");
      setSectors(response.data);
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
      <Notification />
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
                items={sectors}
                label="Selecione um setor"
                placeholder="Indique o setor desta pessoa"
                className="w-full"
                name="sector"
                onChange={formik.handleChange}
                value={formik.values.sector}
              >
                {(sectors) => (
                  <SelectItem key={sectors.name} value={sectors.name}>
                    {sectors.name}
                  </SelectItem>
                )}
              </Select>
              <Select
                isRequired
                label="Prioridade?"
                defaultSelectedKeys={"0"}
                className="w-full"
                name="priority"
                onChange={formik.handleChange}
                value={formik.values.priority}
              >
                <SelectItem key="1" value={true}>
                  SIM
                </SelectItem>
                <SelectItem key="0" value={false}>
                  NÃO
                </SelectItem>
              </Select>
              <Select
                isRequired
                items={services}
                label="Indique o serviço desejado"
                placeholder="Selecione um serviço"
                className="w-full"
                name="services"
                onChange={formik.handleChange}
                value={formik.values.service}
              >
                {(services) => (
                  <SelectItem key={services.name} value={services.name}>
                    {services.name}
                  </SelectItem>
                )}
              </Select>
              <Input
                isRequired
                type="text"
                label="Solicitado por"
                placeholder="Informe o nome da pessoa que está solicitanto esse serviço."
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
