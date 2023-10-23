//React
import React, { useState } from "react";

//Components
import Container from "../../components/container"
import NavBar from "../../components/navbar"

//NextUI
import {Card, CardBody, Button, Input, Divider, Link} from "@nextui-org/react";

//Validation
import { Formik, Form, useFormik } from "formik"

//Icons
import LoginIcon from '@mui/icons-material/Login';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';

//Schemas

function NewUserRegister(){
    const [data, setData] = useState()
    const [isVisible, setIsVisible] = useState(false);
    const [passwordDismatch, setPasswordDismatch] = useState(false)

    const toggleVisibility = () => setIsVisible(!isVisible);

    const formik = useFormik({
        initialValues: {
          email: "",
          password: "",
          confirmPassword: ""
        },
        onSubmit: (values) => {
            if (values.password !== values.confirmPassword) {
                setPasswordDismatch(true)
            } else {
                setPasswordDismatch(false)
                setData(JSON.stringify(values))
                console.log(JSON.stringify(values, null, 2));
            } 
        },
        validate: (values) => {
        }
      });

    return(
        <>
        <NavBar />
        <Container>
            <Card
                isBlurred
                className="bg-dark-background dark:bg-light-background sm:w-[50%] w-[95%]"
                shadow="md"
            >
                <CardBody className="flex gap-3 justify-center items-center">
                    <p className="dark:text-dark-background text-light-background text-3xl">Cadastro</p>
                <Divider className="dark:bg-dark-background bg-light-background" />
                <Formik initialValues={formik.initialValues}>
                    <Form onSubmit={formik.handleSubmit} className="flex flex-col gap-3 justify-center items-center w-full">
                        <Input
                            isRequired
                            type="email"
                            label="Email"
                            className="w-full"
                            name="email"
                            onChange={formik.handleChange}
                            value={formik.values.email}
                        />
                        <Input
                            isRequired
                            isInvalid={passwordDismatch}
                            type={isVisible ? "text" : "password"}
                            label="Senha"
                            className="w-full"
                            name="password"
                            onChange={formik.handleChange}
                            value={formik.values.password}
                            endContent={
                            <button className="focus:outline-none" type="button" onClick={toggleVisibility}>
                                {isVisible ? (
                                <VisibilityOffIcon className="text-2xl text-default-400 pointer-events-none" />
                                ) : (
                                <VisibilityIcon className="text-2xl text-default-400 pointer-events-none" />
                                )}
                            </button>
                            }
                            //minLength={3}
                        >
                        </Input>
                        <Input
                            isRequired
                            isInvalid={passwordDismatch}
                            type={isVisible ? "text" : "password"}
                            label="Confirme a senha"
                            className="w-full"
                            name="confirmPassword"
                            onChange={formik.handleChange}
                            value={formik.values.confirmPassword}
                            endContent={
                                <button className="focus:outline-none" type="button" onClick={toggleVisibility}>
                                  {isVisible ? (
                                    <VisibilityOffIcon className="text-2xl text-default-400 pointer-events-none" />
                                  ) : (
                                    <VisibilityIcon className="text-2xl text-default-400 pointer-events-none" />
                                  )}
                                </button>
                              }
                        >
                        </Input>
                        {passwordDismatch === true ? 
                            <span className="text-failed">As senhas devem ser iguais...</span> 
                        : 
                            <></>
                        }
                        <Divider className="dark:bg-dark-background bg-light-background" />
                        <Button className="bg-success w-[40%]" endContent={<LoginIcon />} type="submit">
                            <Link className="bg-success" href="/home">
                                Cadastrar
                            </Link>
                        </Button> 
                    </Form>
                </Formik>
                </CardBody >
            </ Card>
        </Container>
        </>
    )
}

export default NewUserRegister