//React
import { useState } from "react";
//Components
import { Button, Card, Divider, Input } from "../../../components";
//Icons
import SendIcon from "@mui/icons-material/Send";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import { Select, SelectItem } from "@nextui-org/react";
//Stores
import useUsersStore from "../../../stores/usersStore/store";
import { toast } from "react-toastify";

const RegisterForm = ({ services, permissions, changeMode }) => {
  const { createNewUserSolicitation } = useUsersStore();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [cpf, setCpf] = useState("");
  const [selectedServices, setSelectedServices] = useState([]);
  const [selectedPermission, setSelectedPermission] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [isVisible, setIsVisible] = useState(false);

  const handleNewSolicitation = async () => {
    if (password !== confirmPassword) {
      toast.info("As senhas devem ser iguais!");
      return;
    }

    const data = {
      name: name,
      email: email,
      cpf: cpf,
      permission: selectedPermission,
      updated_by: "",
      password: password,
      services: selectedServices,
    };

    await createNewUserSolicitation(data);
  };

  return (
    <Card className="bg-darkBackground place-self-end h-screen bg-opacity-70 dark:bg-opacity-70">
      <p className="text-3xl">Solicitação de acesso</p>
      <Divider />
      <Input
        isRequired
        size="sm"
        type="text"
        label="NOME"
        maxLength={150}
        name="NOME"
        onChange={(e) => setName(e.target.value)}
        value={name}
      />
      <Input
        size="sm"
        type="email"
        label="EMAIL"
        maxLength={150}
        name="EMAIL"
        onChange={(e) => setEmail(e.target.value)}
        value={email}
      />
      <Input
        isRequired
        size="sm"
        type="text"
        label="CPF"
        maxLength={11}
        name="CPF"
        onChange={(e) => setCpf(e.target.value)}
        value={cpf}
      />
      <Select
        isRequired
        size="sm"
        className="border-none"
        selectionMode="multiple"
        items={services}
        label="Indique os serviços que você prestará"
        placeholder={
          services.length > 0
            ? "Selecione pelo menos um serviço"
            : "Não há serviços cadastrados no momento..."
        }
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
        size="sm"
        className="border-none"
        items={permissions}
        selectionMode="single"
        label="Nível de permissão"
        placeholder="Indique o seu cargo"
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
        size="sm"
        type={isVisible ? "text" : "password"}
        label="SENHA"
        maxLength={150}
        name="PASSWORD"
        onChange={(e) => setPassword(e.target.value)}
        value={password}
        endContent={
          <button
            className="focus:outline-none self-center"
            type="button"
            onClick={() => setIsVisible(!isVisible)}
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
        size="sm"
        type={isVisible ? "text" : "password"}
        label="CONFIRME A SENHA"
        maxLength={150}
        name="PASSWORD_CONFIRM"
        onChange={(e) => setConfirmPassword(e.target.value)}
        value={confirmPassword}
        endContent={
          <button
            className="focus:outline-none self-center"
            type="button"
            onClick={() => setIsVisible(!isVisible)}
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
      <Button
        endContent={<SendIcon />}
        mode="success"
        onClick={() => handleNewSolicitation()}
      >
        Enviar
      </Button>
      <Divider />
      <p className="text-xl">Já tem uma conta?</p>
      <Button
        mode="success"
        onClick={() => {
          changeMode();
        }}
      >
        Clique aqui para fazer o login!
      </Button>
    </Card>
  );
};

export default RegisterForm;
