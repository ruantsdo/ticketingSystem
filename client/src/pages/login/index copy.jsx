//React
import React from "react";

//Components
import Container from "../../components/container"
import ThemeSwitcher from "../../components/themeSwitch"

//NextUI
import {Card, CardBody, Button, Input, Divider, Link} from "@nextui-org/react";

//Validation
import { Formik, Form, ErrorMessage, useFormik } from "formik"
import * as yup from "yup"


//Icons
import LoginIcon from '@mui/icons-material/Login';

function LoginPage(){
    const handleClickLogin = (values) => {
        console.log(values)
    }

    const formik = useFormik({
        initialValues: {
          email: 'foobar@example.com',
          password: 'foobar',
        },
        onSubmit: (values) => {
            alert(JSON.stringify(values, null, 2));
        },
    });

    return(
            <Container>
            <ThemeSwitcher className="absolute top-5 right-3" />
                <Card
                    isBlurred
                    className="bg-dark-background dark:bg-light-background sm:w-[50%] w-[95%]"
                    shadow="md"
                >
                    <CardBody className="flex gap-3 justify-center items-center">
                        <p className="dark:text-dark-background text-light-background text-3xl">Login</p>
                    <Divider className="dark:bg-dark-background bg-light-background" />
                    <div className="justify-center items-center w-[80%]">
                    <Formik>
                        <Form onSubmit={() => handleClickLogin()}>
                            <Input
                                isRequired
                                type="email"
                                label="Email"
                                className="w-full mb-4"
                                name="email"
                            />
                            <ErrorMessage 
                                component="span"
                                name="email"
                                className=""
                            />
                            <Input
                                isRequired
                                type="password"
                                label="Senha"
                                className="w-full"
                                name="password"
                            />
                            <ErrorMessage 
                                component="span"
                                name="password"
                                className=""
                            />
                            <Divider className="dark:bg-dark-background bg-light-background mt-1 mb-1" />
                            <Button className="bg-success w-[40%]" endContent={<LoginIcon />} type="submit">
                                Entrar
                            </Button>
                        </Form>
                    </Formik>
                    </div>
                    <Divider className="dark:bg-dark-background bg-light-background" />
                    <Button className="bg-success w-[40%]" endContent={<LoginIcon />} type="submit">
                        <Link className="bg-success w-[40%]" href="/home">
                            Entrar
                        </Link>
                    </Button>    
                    </CardBody >
                </ Card>
            </Container>
    )
}

export default LoginPage