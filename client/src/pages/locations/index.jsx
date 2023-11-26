//React
import React, { useContext, useState, useEffect } from "react";

//Services
import api from "../../services/api";

//NextUi
import {
  Input,
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  Divider,
} from "@nextui-org/react";

//Components
import FullContainer from "../../components/fullContainer";
import Button from "../../components/button";

//Contexts
import AuthContext from "../../contexts/auth";
import { useWebSocket } from "../../contexts/webSocket";

//Icons
import DoneIcon from "@mui/icons-material/Done";

function LocationRegister() {
  const { socket } = useWebSocket();
  const { currentUser } = useContext(AuthContext);

  const [locations, setLocations] = useState([]);

  useEffect(() => {
    handleLocations();
  }, []);

  const handleLocations = async () => {
    try {
      const response = await api.get("/location/query");
      setLocations(response.data);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <FullContainer>
      <Card isBlurred className="sm:w-[50%] w-[95%] bg-background" shadow="md">
        <CardHeader className="flex items-center justify-center">
          <p className="text-3xl">Cadastro de locais</p>
        </CardHeader>
        <Divider className="bg-divider" />
        <CardBody className="gap-2">
          <Input isRequired type="text" label="Nome do local" />
          <Input type="text" label="Descrição do local" maxLength={500} />
          <Input
            type="number"
            label="Quantidade de mesas no local"
            min={1}
            defaultValue={1}
          />
        </CardBody>
        <Divider className="bg-divider" />
        <CardFooter className="flex items-center justify-center">
          <Button
            className="bg-success w-[50%] text-lg"
            type="submit"
            endContent={<DoneIcon />}
          >
            Cadastrar
          </Button>
        </CardFooter>
      </Card>
    </FullContainer>
  );
}

export default LocationRegister;
