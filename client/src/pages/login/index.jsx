//React
import React, { useContext, useState } from "react";

//Components
import ThemeSwitcher from "../../components/themeSwitch";
import Container from "../../components/container";
import Button from "../../components/button";

//NextUI
import { Card, CardBody, Input, Divider } from "@nextui-org/react";

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
              const currentUser = response.data[0];
              setCurrentUser(response.data[0]);
              localStorage.setItem("currentUser", JSON.stringify(currentUser));
            } else {
              toast.warn("Verifique suas crendenciais e tente novamente!");
            }
            return;
          });
      } catch (err) {
        console.log(err);
        toast.error("Um erro aconteceu! Tente novamente mais tarde!");
      }
    },
  });

  return (
    <Container>
      <ThemeSwitcher className="absolute top-5 right-3" />
      <Card isBlurred className="bg-background sm:w-[50%] w-[95%]" shadow="md">
        <CardBody className="flex gap-3 justify-center items-center">
          <p className="text-defaultTextColor text-3xl">Login</p>
          <Divider className="bg-background" />
          <Formik initialValues={formik.initialValues}>
            <Form
              onSubmit={formik.handleSubmit}
              className="flex flex-col gap-3 justify-center items-center w-full"
            >
              <Input
                isRequired
                type="text"
                label="CPF"
                maxLength={11}
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
                      <VisibilityIcon className="text-2xl text-default-400 pointer-events-none" />
                    ) : (
                      <VisibilityOffIcon className="text-2xl text-default-400 pointer-events-none" />
                    )}
                  </button>
                }
              />
              <Divider className="bg-background" />
              <Button
                className="bg-success w-[40%]"
                endContent={<LoginIcon />}
                type="submit"
              >
                Entrar
              </Button>
            </Form>
          </Formik>
        </CardBody>
      </Card>
    </Container>
  );
}

export default LoginPage;
