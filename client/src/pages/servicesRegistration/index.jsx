//React
import React, { useState, useEffect } from "react";

//Services
import api from "../../services/api";

//NextUi
import {
  Input,
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  Divider,
} from "@nextui-org/react";

//Components
import FullContainer from "../../components/fullContainer";
import Button from "../../components/button";

//Validation
import { Formik, Form, useFormik } from "formik";

//Contexts
import { useWebSocket } from "../../contexts/webSocket";

//Icons
import DoneIcon from "@mui/icons-material/Done";

//Toast
import { toast } from "react-toastify";

function ServicesRegister() {
  const { socket } = useWebSocket();

  const [services, setServices] = useState([]);
  const [validName, setValidName] = useState(true);

  const formik = useFormik({
    initialValues: {
      name: "",
      description: "",
      limit: "",
    },
    onSubmit: async (values) => {
      try {
        if (checkLocationName(values.name)) {
          return;
        } else {
          if (values.limit) {
            handleSubmit(
              values.name,
              values.description,
              parseInt(values.limit)
            );
          } else {
            handleSubmit(values.name, values.description, 0);
          }
        }
      } catch (err) {
        toast.error(
          "Houve um problema ao cadastrar o novo serviço! Tente novamente em alguns instantes!"
        );
        console.log(err);
      }
    },
  });

  useEffect(() => {
    handleServices();
  }, []);

  const handleServices = async () => {
    try {
      const response = await api.get("/services/query");
      setServices(response.data);
    } catch (error) {}
  };

  const handleSubmit = async (name, description, limit) => {
    await api
      .post("/services/registration", {
        name: name,
        description: description,
        limit: limit,
      })
      .then((response) => {
        notify(response.data);
      });
  };

  const notify = (response) => {
    if (response === "success") {
      toast.success("Serviço cadastrado!");
      emitNewLocation();
      formik.resetForm();
      handleServices();
    } else if (response === "failed") {
      toast.warn(
        "Falha ao registrar o serviço! Tente novamente em alguns instantes!"
      );
    }
  };

  const checkLocationName = (name) => {
    const validation = services.some((service) => service.name === name);
    if (validation) {
      setValidName(false);
      toast.info("Já existe um serviço com esse nome!");
    } else {
      setValidName(true);
    }

    return validation;
  };

  const emitNewLocation = () => {
    socket.emit("new_service");
  };

  return (
    <FullContainer>
      <Card isBlurred className="sm:w-[50%] w-[95%] bg-background" shadow="md">
        <CardHeader className="flex items-center justify-center">
          <p className="text-3xl">Cadastro de serviços</p>
        </CardHeader>
        <Divider className="bg-divider" />
        <Formik initialValues={formik.initialValues}>
          <Form
            onSubmit={formik.handleSubmit}
            className="flex flex-col justify-center items-center w-full"
          >
            <CardBody className="gap-2">
              <Input
                isRequired
                isInvalid={!validName}
                variant={validName ? "flat" : "bordered"}
                type="text"
                label="Título do serviço"
                name="name"
                onChange={formik.handleChange}
                onFocus={() => setValidName(true)}
                value={formik.values.name}
              />
              <Input
                type="text"
                label="Descrição do serviço"
                maxLength={500}
                name="description"
                onChange={formik.handleChange}
                value={formik.values.description}
              />
              <Input
                type="number"
                label="Limite diário para esse serviço"
                description="Deixe em branco para infinito"
                name="limit"
                min={0}
                onChange={formik.handleChange}
                value={formik.values.limit}
              />
            </CardBody>
            <Divider className="bg-divider" />
            <CardFooter className="flex items-center justify-center">
              <Button
                className="bg-success w-[50%] text-lg"
                type="submit"
                endContent={<DoneIcon />}
              >
                Cadastrar
              </Button>
            </CardFooter>
          </Form>
        </Formik>
      </Card>
    </FullContainer>
  );
}

export default ServicesRegister;
