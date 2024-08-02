//React
import { useContext, useState } from "react";
//Formik
import { Formik, Form, useFormik } from "formik";
//Components
import { Button, Card, Divider, Input } from "../../../components";
//Icons
import LoginIcon from "@mui/icons-material/Login";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import api from "../../../services/api";
//Contexts
import AuthContext from "../../../contexts/auth";
//Navigation
import { useNavigate } from "react-router-dom";
//Toast
import { toast } from "react-toastify";

const LoginForm = ({ changeMode, registerForm }) => {
  const { setCurrentUser } = useContext(AuthContext);
  const navigate = useNavigate();

  const [isVisible, setIsVisible] = useState(false);
  const toggleVisibility = () => setIsVisible(!isVisible);

  const [processingLogin, setProcessingLogin] = useState(false);

  const formik = useFormik({
    initialValues: {
      cpf: "",
      password: "",
    },
    onSubmit: async (values) => {
      setProcessingLogin(true);
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

              if (currentUser.permission_level === 1) {
                navigate("/tokenCall/default");
              } else {
                navigate("/home");
              }
            } else {
              toast.warn(response.data.msg);
            }
            return;
          });
      } catch (err) {
        console.log(err);
        toast.error("Um erro aconteceu! Tente novamente mais tarde!");
      } finally {
        setProcessingLogin(false);
      }
    },
  });

  return (
    <Card className="bg-darkBackground rounded-none place-self-end h-screen bg-opacity-70 dark:bg-opacity-90">
      <p className="text-3xl text-white">Login</p>
      <Divider className="bg-white" />
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
          <Divider className="bg-white" />
          <Button
            endContent={<LoginIcon />}
            type="submit"
            mode="success"
            isLoading={processingLogin}
          >
            Entrar
          </Button>
        </Form>
      </Formik>
      {registerForm ? (
        <>
          <Divider className="bg-white" />
          <p className="text-xl text-white">Ainda não tem uma conta?</p>
          <Button
            mode="success"
            className="w-6/12"
            onClick={() => {
              changeMode();
            }}
            isDisabled={processingLogin}
          >
            Clique aqui e solicite uma
          </Button>
        </>
      ) : null}
    </Card>
  );
};

export default LoginForm;
