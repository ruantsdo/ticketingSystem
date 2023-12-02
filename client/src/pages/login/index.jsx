//React
import { useContext, useState } from "react";

//Components
import {
  ThemeSwitcher,
  Container,
  Button,
  Card,
  Divider,
  Input,
} from "../../components";

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

              const startDate = new Date();
              localStorage.setItem("lastDay", JSON.stringify(startDate));

              localStorage.setItem("currentUser", JSON.stringify(currentUser));

              setCurrentUser(response.data[0]);
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
      <Card>
        <p className="text-3xl">Login</p>
        <Divider />
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
              name="cpf"
              onChange={formik.handleChange}
              value={formik.values.cpf}
            />
            <Input
              isRequired
              type={isVisible ? "text" : "password"}
              label="Senha"
              name="password"
              onChange={formik.handleChange}
              value={formik.values.password}
              endContent={
                <button
                  className="focus:outline-none self-center"
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
            <Divider />
            <Button endContent={<LoginIcon />} type="submit" mode="success">
              Entrar
            </Button>
          </Form>
        </Formik>
      </Card>
    </Container>
  );
}

export default LoginPage;
