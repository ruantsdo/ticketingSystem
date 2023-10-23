//Components
import Container from "../../components/container"
import NavBar from "../../components/navbar"

//NextUI
import {} from "@nextui-org/react";
import {Card, CardBody, Button, Input, Divider, Link} from "@nextui-org/react";

//Icons
import LoginIcon from '@mui/icons-material/Login';


function NewUserPage(){
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
                            Cadastrar
                        </Link> 
                    </Button>    
                    </CardBody >
                </ Card>
            </Container>
        </>
    )
}

export default NewUserPage