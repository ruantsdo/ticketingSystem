//React
import React, { useState, useEffect, useContext } from "react";

//Components
import Container from "../../components/container";
import NavBar from "../../components/navbar";

//NextUI
import {
  Card,
  CardBody,
  Button,
  Divider,
  Select,
  SelectItem,
} from "@nextui-org/react";

//Validation
import { Formik, Form, useFormik } from "formik";

//Icons
import LoginIcon from "@mui/icons-material/Login";

//Services
import api from "../../services/api";

//Contexts
import AuthContext from "../../contexts/auth";

function QueueRegistration() {
  const { currentUser } = useContext(AuthContext);
  const [sectors, setSectors] = useState([]);

  useEffect(() => {
    handleSectors();
  }, []);

  const formik = useFormik({
    initialValues: {
      priority: "0",
      service: "",
      sector: "",
      created: currentUser.id,
    },
    onSubmit: async (values) => {
      try {
        await api.post("/queueRegistration", {
          priority: values.priority,
          service: values.service,
          sector: values.sector,
          created: currentUser.id,
        });

        console.log("Cadastrado com sucesso!");
      } catch (err) {
        console.log(err);
      }
    },
    validate: (values) => {},
  });

  const handleSectors = async () => {
    await api
      .get("/sectors")
      .then((response) => {
        setSectors(response.data);
      })
      .catch((error) => {
        console.error(error);
      });
  };

  return (
    <>
      <NavBar />
      <Container>
        <Card
          isBlurred
          className="bg-dark-background dark:bg-light-background sm:w-[50%] w-[95%]"
          shadow="md"
        >
          <CardBody className="flex gap-3 justify-center items-center">
            <p className="dark:text-dark-background text-light-background text-3xl">
              Cadastro de ficha
            </p>
            <Divider className="dark:bg-dark-background bg-light-background" />
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
                    <SelectItem key={sectors.id} value={sectors.id}>
                      {sectors.name}
                    </SelectItem>
                  )}
                </Select>
                <Select
                  isRequired
                  label="Prioridade?"
                  defaultSelectedKeys="0"
                  className="w-full"
                  name="priority"
                  onChange={formik.handleChange}
                  value={formik.values.priority}
                >
                  <SelectItem key="1" value="1">
                    SIM
                  </SelectItem>
                  <SelectItem key="0" value="0">
                    NÃO
                  </SelectItem>
                </Select>
                <Select
                  isRequired
                  label="Para qual serviço?"
                  placeholder="Indique o serviço desejado"
                  className="w-full"
                  name="service"
                  onChange={formik.handleChange}
                  value={formik.values.service}
                >
                  <SelectItem key={"Serviço 1"} value={1}>
                    Serviço 1
                  </SelectItem>
                  <SelectItem key={"Serviço 2"} value={2}>
                    Serviço 2
                  </SelectItem>
                </Select>

                <Divider className="dark:bg-dark-background bg-light-background" />
                <Button
                  className="bg-success w-[40%]"
                  endContent={<LoginIcon />}
                  type="submit"
                >
                  Registar
                </Button>
              </Form>
            </Formik>
          </CardBody>
        </Card>
      </Container>
    </>
  );
}

export default QueueRegistration;
