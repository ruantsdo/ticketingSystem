//React
import { useState, useEffect, useContext } from "react";

//Services
import api from "../../services/api";

//Components
import { Input, Card, Divider, FullContainer, Button } from "../../components";

//Validation
import { Formik, Form, useFormik } from "formik";

//Contexts
import AuthContext from "../../contexts/auth";
import { useWebSocket } from "../../contexts/webSocket";

//Icons
import AddTaskIcon from "@mui/icons-material/AddTask";

//Toast
import { toast } from "react-toastify";

function ServicesRegister() {
  const { socket } = useWebSocket();
  const { currentUser } = useContext(AuthContext);

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
        if (checkServiceName(values.name)) {
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
    } catch (error) {
      toast.error("Falha ao consultar os serviços!");
    }
  };

  const handleSubmit = async (name, description, limit) => {
    await api
      .post("/service/registration", {
        name: name,
        description: description,
        limit: limit,
        created_by: currentUser.name,
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
    } else if (response === "already exists") {
      toast.info("Já existe um serviço com esse nome!");
    } else {
      toast.error("Erro interno no servidor!");
    }
  };

  const checkServiceName = (name) => {
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
      <Card>
        <p className="text-3xl">Cadastro de serviços</p>
        <Divider />
        <Formik initialValues={formik.initialValues}>
          <Form
            onSubmit={formik.handleSubmit}
            className="flex flex-col justify-center items-center w-full gap-2"
          >
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
              label="Limite diário"
              placeholder="Deixe em branco para infinito"
              name="limit"
              min={0}
              onChange={formik.handleChange}
              value={formik.values.limit}
            />
            <Divider />

            <Button mode="success" type="submit" endContent={<AddTaskIcon />}>
              Cadastrar
            </Button>
          </Form>
        </Formik>
      </Card>
    </FullContainer>
  );
}

export default ServicesRegister;
