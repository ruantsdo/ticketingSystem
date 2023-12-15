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
import HowToRegIcon from "@mui/icons-material/HowToReg";
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
  const [services, setServices] = useState([]);
  const [selectedServices, setSelectedServices] = useState([]);
  const [filteredPermissionLevels, setFilteredPermissionLevels] = useState([]);
  const [selectedPermission, setSelectedPermission] = useState([]);

  const toggleVisibility = () => setIsVisible(!isVisible);

  useEffect(() => {
    handleServices();
    handlePermissionsLevels();
    //eslint-disable-next-line
  }, []);

  const formik = useFormik({
    initialValues: {
      name: "",
      email: "",
      cpf: "",
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
          await api
            .post("/user/registration", {
              name: values.name,
              email: values.email,
              cpf: values.cpf,
              services: selectedServices,
              permissionLevel: selectedPermission,
              password: values.password,
              created_by: currentUser.name,
            })
            .then((response) => {
              notify(response.data);
            });
        } catch (err) {
          console.log(err);
        }
      }
    },
    validate: (values) => {},
  });

  const handleServices = async () => {
    try {
      const response = await api.get("/services/query");
      setServices(response.data);
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

  const notify = (response) => {
    if (response === "New user created") {
      toast.success("Novo usuário cadastrado!");
      setSelectedServices([]);
      setSelectedPermission(null);
      formik.resetForm();
    } else if (response === "User already exists") {
      toast.info("Já existe um cadastrado usuário com esse CPF!");
      setSelectedServices([]);
      setSelectedPermission(null);
      formik.resetForm();
    } else {
      toast.error(
        "Houve um problema ao cadastrar o novo usuário! Em instantes!"
      );
    }
  };

  return (
    <FullContainer>
      <Card>
        <p className="text-3xl">Cadastro de usuário</p>
        <Divider />
        <Formik initialValues={formik.initialValues}>
          <Form
            onSubmit={formik.handleSubmit}
            className="flex flex-col justify-center items-center w-full gap-2"
          >
            <Input
              isRequired
              type="text"
              label="Insira o nome"
              name="name"
              onChange={formik.handleChange}
              value={formik.values.name}
            />
            <Input
              isRequired
              type="text"
              label="CPF"
              name="cpf"
              maxLength={11}
              onChange={formik.handleChange}
              value={formik.values.cpf}
            />
            <Select
              isRequired
              selectionMode="multiple"
              items={services}
              label="Indique os serviços que este usuário prestará"
              placeholder="Selecione pelo menos um serviço"
              name="service"
              selectedKeys={selectedServices}
              onSelectionChange={(values) => {
                setSelectedServices(Array.from(values));
              }}
            >
              {(service) => (
                <SelectItem key={service.id} value={service.name}>
                  {service.name}
                </SelectItem>
              )}
            </Select>
            <Select
              isRequired
              items={filteredPermissionLevels}
              selectionMode="single"
              label="Nivel de permissão"
              placeholder="Indique nivel de permissão desta pessoa"
              name="permissionLevel"
              selectedKeys={selectedPermission}
              onSelectionChange={(values) => {
                setSelectedPermission(values.currentKey);
              }}
            >
              {(filteredPermissionLevels) => (
                <SelectItem
                  key={filteredPermissionLevels.id}
                  value={filteredPermissionLevels.name}
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
              name="password"
              minLength={6}
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
              <span className="text-failed">As senhas devem ser iguais...</span>
            ) : (
              <></>
            )}
            <Divider />
            <Button mode="success" endContent={<HowToRegIcon />} type="submit">
              Cadastrar
            </Button>
          </Form>
        </Formik>
      </Card>
    </FullContainer>
  );
}

export default NewUserRegister;
