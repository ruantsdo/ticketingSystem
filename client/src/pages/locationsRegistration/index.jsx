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
import AddTaskIcon from "@mui/icons-material/AddTask";

//Toast
import { toast } from "react-toastify";

function LocationRegister() {
  const { socket } = useWebSocket();

  const [locations, setLocations] = useState([]);
  const [validName, setValidName] = useState(true);

  const formik = useFormik({
    initialValues: {
      name: "",
      description: "",
      tables: 1,
    },
    onSubmit: async (values) => {
      try {
        if (checkLocationName(values.name)) {
          return;
        } else {
          handleSubmit(values.name, values.description, values.tables);
        }
      } catch (err) {
        toast.error(
          "Houve um problema ao cadastrar o novo local! Tente novamente em alguns instantes!"
        );
        console.log(err);
      }
    },
  });

  const handleSubmit = async (name, description, tables) => {
    await api
      .post("/location/registration", {
        name: name,
        description: description,
        tables: tables,
      })
      .then((response) => {
        notify(response.data);
      });
  };

  const notify = (response) => {
    if (response === "success") {
      toast.success("Local cadastrado!");
      emitNewLocation();
      formik.resetForm();
      handleLocations();
    } else if (response === "failed") {
      toast.warn(
        "Falha ao registrar o local! Tente novamente em alguns instantes!"
      );
    }
  };

  const checkLocationName = (name) => {
    const validation = locations.some((location) => location.name === name);
    if (validation) {
      setValidName(false);
      toast.info("Já existe um local com esse nome!");
    } else {
      setValidName(true);
    }

    return validation;
  };

  const emitNewLocation = () => {
    socket.emit("new_location");
  };

  useEffect(() => {
    handleLocations();
  }, []);

  const handleLocations = async () => {
    try {
      const response = await api.get("/location/query");
      setLocations(response.data);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <FullContainer>
      <Card isBlurred className="sm:w-[50%] w-[95%] bg-background" shadow="md">
        <CardHeader className="flex items-center justify-center">
          <p className="text-3xl">Cadastro de locais</p>
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
                label="Nome do local"
                name="name"
                onChange={formik.handleChange}
                onFocus={() => setValidName(true)}
                value={formik.values.name}
              />
              <Input
                type="text"
                label="Descrição do local"
                name="description"
                maxLength={500}
                onChange={formik.handleChange}
                value={formik.values.description}
              />
              <Input
                isRequired
                type="number"
                label="Quantidade de mesas no local"
                name="tables"
                min={1}
                defaultValue={1}
                onChange={formik.handleChange}
                value={formik.values.tables}
              />
            </CardBody>
            <Divider className="bg-divider" />
            <CardFooter className="flex items-center justify-center">
              <Button
                className="bg-success w-[50%] text-lg"
                type="submit"
                endContent={<AddTaskIcon />}
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

export default LocationRegister;
