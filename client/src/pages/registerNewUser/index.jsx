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
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";

//Services
import api from "../../services/api";

function NewUserRegister() {
  const [isVisible, setIsVisible] = useState(false);
  const [passwordMismatch, setPasswordMismatch] = useState(false);
  const [sectors, setSectors] = useState([]);
  const [userLevel, setUserLevel] = useState();
  const [permissionLevel, setPermissionLevel] = useState([]);

  const toggleVisibility = () => setIsVisible(!isVisible);

  useEffect(() => {
    handleSectors();
    handleUserLevel();
    setLevelOfPermission();
    // eslint-disable-next-line
  }, []);

  const formik = useFormik({
    initialValues: {
      name: "",
      email: "",
      cpf: "05831605574",
      sector: "",
      permissionLevel: "",
      password: "",
      confirmPassword: "",
    },
    onSubmit: (values) => {
      if (values.password !== values.confirmPassword) {
        setPasswordMismatch(true);
      } else {
        setPasswordMismatch(false);
        api
          .post("/newUser", {
            name: values.name,
            email: values.email,
            cpf: values.cpf,
            sector: values.sector,
            password: values.password,
          })
          .then((response) => {
            console.log(response);
          })
          .catch((err) => {
            console.log(err);
          });
      }
    },
    validate: (values) => {},
  });

  const handleUserLevel = () => {
    api
      .get(`/usersLevel/${formik.values.cpf}`)
      .then((response) => {
        setUserLevel(response.data.permission_level);
        console.log(userLevel);
      })
      .catch((error) => {
        console.error(error);
      });
  };

  const setLevelOfPermission = () => {
    for (let i = 1; i < userLevel; i++) {
      permissionLevel.push({
        id: i,
        value: i.toString(),
      });
    }
  };

  const handleSectors = () => {
    api
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
              Cadastro
            </p>
            <Divider className="dark:bg-dark-background bg-light-background" />
            <Formik initialValues={formik.initialValues}>
              <Form
                onSubmit={formik.handleSubmit}
                className="flex flex-col gap-3 justify-center items-center w-full"
              >
                <Input
                  isRequired
                  type="text"
                  label="Insira o nome"
                  className="w-full"
                  name="name"
                  onChange={formik.handleChange}
                  value={formik.values.name}
                />
                <Input
                  type="email"
                  label="Email"
                  className="w-full"
                  name="email"
                  onChange={formik.handleChange}
                  value={formik.values.email}
                />
                <Input
                  isRequired
                  type="text"
                  label="CPF"
                  className="w-full"
                  name="cpf"
                  maxLength={11}
                  onChange={formik.handleChange}
                  value={formik.values.cpf}
                />
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
                    <SelectItem key={sectors.id} value={sectors.name}>
                      {sectors.name}
                    </SelectItem>
                  )}
                </Select>
                <Select
                  isRequired
                  items={permissionLevel}
                  label="Nivel de permissão"
                  placeholder="Indique nivel das permissões para esta pessoa"
                  className="w-full"
                  name="permissionLevel"
                  onChange={formik.handleChange}
                  value={formik.values.permissionLevel}
                >
                  {(permissionLevel) => (
                    <SelectItem
                      key={permissionLevel.id}
                      value={permissionLevel.value}
                    >
                      {permissionLevel.value}
                    </SelectItem>
                  )}
                </Select>
                <Input
                  isRequired
                  isInvalid={passwordMismatch}
                  type={isVisible ? "text" : "password"}
                  label="Senha"
                  className="w-full"
                  name="password"
                  onChange={formik.handleChange}
                  value={formik.values.password}
                  endContent={
                    <button
                      className="focus:outline-none"
                      type="button"
                      onClick={toggleVisibility}
                    >
                      {isVisible ? (
                        <VisibilityOffIcon className="text-2xl text-default-400 pointer-events-none" />
                      ) : (
                        <VisibilityIcon className="text-2xl text-default-400 pointer-events-none" />
                      )}
                    </button>
                  }
                  //minLength={3}
                ></Input>
                <Input
                  isRequired
                  isInvalid={passwordMismatch}
                  type={isVisible ? "text" : "password"}
                  label="Confirme a senha"
                  className="w-full"
                  name="confirmPassword"
                  onChange={formik.handleChange}
                  value={formik.values.confirmPassword}
                  endContent={
                    <button
                      className="focus:outline-none"
                      type="button"
                      onClick={toggleVisibility}
                    >
                      {isVisible ? (
                        <VisibilityOffIcon className="text-2xl text-default-400 pointer-events-none" />
                      ) : (
                        <VisibilityIcon className="text-2xl text-default-400 pointer-events-none" />
                      )}
                    </button>
                  }
                ></Input>
                {passwordMismatch === true ? (
                  <span className="text-failed">
                    As senhas devem ser iguais...
                  </span>
                ) : (
                  <></>
                )}
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

export default NewUserRegister;
