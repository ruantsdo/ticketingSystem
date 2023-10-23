//Components
import Container from "../../components/container"
import ThemeSwitcher from "../../components/themeSwitch"

//NextUI
import {Card, CardBody, Button, Input, Divider, Link} from "@nextui-org/react";

//Icons
import LoginIcon from '@mui/icons-material/Login';

function LoginPage(){
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
                    <Input
                        isRequired
                        type="email"
                        label="Email"
                        className="w-full"
                    />
                    <Input
                        isRequired
                        type="password"
                        label="Senha"
                        className="w-full"
                    />
                    <Divider className="dark:bg-dark-background bg-light-background" />
                    <Button className="bg-success w-[40%]" endContent={<LoginIcon />}>
                        <Link color="foreground" href="/home">
                            Entrar
                        </Link> 
                    </Button>    
                    </CardBody >
                </ Card>
            </Container>
    )
}

export default LoginPage