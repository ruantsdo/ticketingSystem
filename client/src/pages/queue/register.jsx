//React
import React, { useState, useEffect } from "react";

//Components
import Container from "../../components/container";
import NavBar from "../../components/navbar";

//NextUI
import {
  Card,
  CardBody,
  Button,
  Input,
  Divider,
  Link,
  Select,
  SelectItem,
} from "@nextui-org/react";

//Validation
import { Formik, Form, useFormik } from "formik";

//Icons
import LoginIcon from "@mui/icons-material/Login";

//Services
import api from "../../services/api";

function QueueRegistration() {
  const [isVisible, setIsVisible] = useState(false);
  const [passwordMismatch, setPasswordMismatch] = useState(false);
  const [sectors, setSectors] = useState([]);
  // eslint-disable-next-line
  const [userLevel, setUserLevel] = useState(5);
  const [permissionLevel, setPermissionLevel] = useState([]);

  const toggleVisibility = () => setIsVisible(!isVisible);

  useEffect(() => {
    handleSectors();
    setLevelOfPermission();
    //eslint-disable-next-line
  }, []);

  const formik = useFormik({
    initialValues: {
      name: "",
      email: "",
      cpf: "",
      sector: "",
      permissionLevel: "",
      password: "",
      confirmPassword: "",
    },
    onSubmit: async (values) => {
      if (values.password !== values.confirmPassword) {
        setPasswordMismatch(true);
      } else {
        setPasswordMismatch(false);
        try {
          await api.post("/newUser", {
            name: values.name,
            email: values.email,
            cpf: values.cpf,
            sector: values.sector,
            permissionLevel: values.permissionLevel,
            password: values.password,
          });

          console.log("Cadastrado com sucesso!");
        } catch (err) {
          console.log(err);
        }
      }
    },
    validate: (values) => {},
  });

  const setLevelOfPermission = () => {
    const uniquePermissionLevels = [];

    for (let i = 1; i < userLevel; i++) {
      const permissionLevel = { id: i.toString(), value: i.toString() };

      if (!uniquePermissionLevels.includes(permissionLevel)) {
        uniquePermissionLevels.push(permissionLevel);
      }
    }

    setPermissionLevel(uniquePermissionLevels);
  };

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
                    <SelectItem key={sectors.name} value={sectors.name}>
                      {sectors.name}
                    </SelectItem>
                  )}
                </Select>
                <Select
                  isRequired
                  label="Prioridade?"
                  defaultSelectedKeys="Não"
                  className="w-full"
                  name="priority"
                  onChange={formik.handleChange}
                  value={formik.values.priority}
                >
                  <SelectItem key="Sim" value="Sim">
                    SIM
                  </SelectItem>
                  <SelectItem key="Não" value="Não">
                    NÃO
                  </SelectItem>
                </Select>
                <Select
                  isRequired
                  label="Prioridade?"
                  placeholder="Indique nivel das permissões para esta pessoa"
                  className="w-full"
                  name="priority"
                  onChange={formik.handleChange}
                  value={formik.values.priority}
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
                  <Link className="bg-success" href="/home">
                    Cadastrar
                  </Link>
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
