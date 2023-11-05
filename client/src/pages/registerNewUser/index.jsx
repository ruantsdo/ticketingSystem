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
  Input,
  Divider,
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

//Contexts
import AuthContext from "../../contexts/auth";

//Toast
import { toast } from "react-toastify";

function NewUserRegister() {
  const { currentUser } = useContext(AuthContext);

  const [isVisible, setIsVisible] = useState(false);
  const [passwordMismatch, setPasswordMismatch] = useState(false);
  const [sectors, setSectors] = useState([]);
  const [filteredPermissionLevels, setFilteredPermissionLevels] = useState([]);

  const toggleVisibility = () => setIsVisible(!isVisible);

  useEffect(() => {
    handleSectors();
    handlePermissionsLevels();
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
        toast.warn("As senhas devem ser iguais!");
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
        } catch (err) {
          toast.error(
            "Houve um problema ao cadastrar o novo usuário! Tente novamente mais tarde!"
          );
          console.log(err);
          return;
        }
        toast.success("Novo usuário cadastrado!");
      }
    },
    validate: (values) => {},
  });

  const handleSectors = async () => {
    try {
      const response = await api.get("/sectors/query");
      defineFilteredSectors(response.data);
    } catch (error) {
      console.error(error);
    }
  };

  const handlePermissionsLevels = async () => {
    try {
      const response = await api.get("/permissionsLevels");
      defineFilteredPermissionLevels(response.data);
    } catch (error) {
      console.error(error);
    }
  };

  const defineFilteredSectors = (data) => {
    let filteredSectors = [];

    if (currentUser.permission_level === 3) {
      const sector = data.find((setor) => setor.name === currentUser.sector);
      filteredSectors.push(sector);
    } else if (currentUser.permission_level >= 4) {
      filteredSectors = data;
    }

    setSectors(filteredSectors);
  };

  const defineFilteredPermissionLevels = (data) => {
    let filteredPermissionLevels = [];

    if (currentUser.permission_level === 3) {
      filteredPermissionLevels.push({ id: data[1].id, name: data[1].name });
    } else if (currentUser.permission_level === 4) {
      filteredPermissionLevels = [
        { id: data[1].id, name: data[1].name },
        { id: data[2].id, name: data[2].name },
      ];
    } else if (currentUser.permission_level === 5) {
      filteredPermissionLevels = data;
    }

    setFilteredPermissionLevels(filteredPermissionLevels);
  };

  return (
    <FullContainer>
      <Notification />
      <Card
        isBlurred
        className="bg-dark-background dark:bg-light-background sm:w-[50%] w-[95%] overflow-visible"
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
                  <SelectItem key={sectors.name} value={sectors.name}>
                    {sectors.name}
                  </SelectItem>
                )}
              </Select>
              <Select
                isRequired
                items={filteredPermissionLevels}
                label="Nivel de permissão"
                placeholder="Indique nivel das permissões para esta pessoa"
                className="w-full"
                name="permissionLevel"
                onChange={formik.handleChange}
                value={formik.values.permissionLevel}
              >
                {(filteredPermissionLevels) => (
                  <SelectItem
                    key={filteredPermissionLevels.id}
                    value={filteredPermissionLevels.id}
                  >
                    {filteredPermissionLevels.name}
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
                minLength={2}
                onChange={formik.handleChange}
                value={formik.values.password}
                endContent={
                  <button
                    className="focus:outline-none"
                    type="button"
                    onClick={toggleVisibility}
                  >
                    {isVisible ? (
                      <VisibilityIcon className="text-2xl text-default-400 pointer-events-none" />
                    ) : (
                      <VisibilityOffIcon className="text-2xl text-default-400 pointer-events-none" />
                    )}
                  </button>
                }
              />
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
                      <VisibilityIcon className="text-2xl text-default-400 pointer-events-none" />
                    ) : (
                      <VisibilityOffIcon className="text-2xl text-default-400 pointer-events-none" />
                    )}
                  </button>
                }
              />
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
                Cadastrar
              </Button>
            </Form>
          </Formik>
        </CardBody>
      </Card>
    </FullContainer>
  );
}

export default NewUserRegister;
