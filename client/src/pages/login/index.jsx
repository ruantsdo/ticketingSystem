//React
import React, { useContext, useState } from "react";

//Components
import Container from "../../components/container";
import ThemeSwitcher from "../../components/themeSwitch";

//NextUI
import {
  Card,
  CardBody,
  Button,
  Input,
  Divider,
  Link,
} from "@nextui-org/react";

//Validation
import { Formik, Form, useFormik } from "formik";

//Icons
import LoginIcon from "@mui/icons-material/Login";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";

//Schemas
import loginSchema from "../../schemas/login";

//Services
import api from "../../services/api";

//Contexts
import AuthContext from "../../contexts/auth";

function LoginPage() {
  const { setCurrentUser } = useContext(AuthContext);

  const [isVisible, setIsVisible] = useState(false);

  const toggleVisibility = () => setIsVisible(!isVisible);

  const formik = useFormik({
    initialValues: {
      cpf: "",
      password: "",
    },
    onSubmit: async (values) => {
      try {
        await api
          .post("/login", {
            cpf: values.cpf,
            password: values.password,
          })
          .then((response) => {
            if (response.data.length > 0) {
              setCurrentUser(response.data);
            }
            return;
          });
      } catch (err) {
        console.log(err);
      }
    },
  });

  return (
    <Container>
      <ThemeSwitcher className="absolute top-5 right-3" />
      <Card
        isBlurred
        className="bg-dark-background dark:bg-light-background sm:w-[50%] w-[95%]"
        shadow="md"
      >
        <CardBody className="flex gap-3 justify-center items-center">
          <p className="dark:text-dark-background text-light-background text-3xl">
            Login
          </p>
          <Divider className="dark:bg-dark-background bg-light-background" />
          <Formik
            initialValues={formik.initialValues}
            validationSchema={loginSchema}
          >
            <Form
              onSubmit={formik.handleSubmit}
              className="flex flex-col gap-3 justify-center items-center w-full"
            >
              <Input
                isRequired
                type="text"
                label="CPF"
                className="w-full"
                name="cpf"
                onChange={formik.handleChange}
                value={formik.values.cpf}
              />
              <Input
                isRequired
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
              />
              <Divider className="dark:bg-dark-background bg-light-background" />
              <Button
                className="bg-success w-[40%]"
                endContent={<LoginIcon />}
                type="submit"
              >
                <Link className="bg-success" href="/home">
                  Entrar
                </Link>
              </Button>
            </Form>
          </Formik>
        </CardBody>
      </Card>
    </Container>
  );
}

export default LoginPage;
