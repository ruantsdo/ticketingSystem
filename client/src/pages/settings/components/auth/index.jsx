//React
import { useState } from "react";
//NextUi
import { Switch } from "@nextui-org/react";
//Components
import { Button } from "../../../../components";
//Icons
import SaveIcon from "@mui/icons-material/Save";

const AuthSettings = () => {
  const [autoAprove, setAutoAprove] = useState(false);
  const [forceLogin, setForceLogin] = useState(false);
  const [selfRegister, setSelfRegister] = useState(true);

  return (
    <div className="flex flex-col w-full items-center gap-3">
      <Button mode="success" className="w-40 h-12 rounded-lg">
        <SaveIcon /> Salvar configuração
      </Button>
      <div className="flex flex-col w-[60%] gap-2 border-1 p-5 rounded-lg border-darkBackground dark:border-background">
        <p className="text-lg font-medium">Auto aprovar usuários</p>
        <p>
          Quando ativado novas solicitações de criação de usuário serão
          aprovadas automaticamente.
        </p>
        <div className="bg-darkBackground dark:bg-background border-1 border-background dark:border-darkBackground w-44 p-3 rounded-lg">
          <Switch
            isSelected={autoAprove}
            onValueChange={setAutoAprove}
            color="success"
          >
            <p className="text-darkTextColor dark:text-textColor">
              {autoAprove ? "Ativado" : "Desativado"}
            </p>
          </Switch>
        </div>
      </div>
      <div className="flex flex-col w-[60%] gap-2 border-1 p-5 rounded-lg border-darkBackground dark:border-background">
        <p className="text-lg font-medium">Forçar login diário</p>
        <p>
          Enquanto ativo, os usuários terão que se reautenticar diariamente.
        </p>
        <div className="bg-darkBackground dark:bg-background border-1 border-background dark:border-darkBackground w-44 p-3 rounded-lg">
          <Switch
            isSelected={forceLogin}
            onValueChange={setForceLogin}
            color="success"
          >
            <p className="text-darkTextColor dark:text-textColor">
              {forceLogin ? "Ativado" : "Desativado"}
            </p>
          </Switch>
        </div>
      </div>
      <div className="flex flex-col w-[60%] gap-2 border-1 p-5 rounded-lg border-darkBackground dark:border-background">
        <p className="text-lg font-medium">Formulário de registro</p>
        <p>Controla se usuários podem ou não solicitar as próprias contas.</p>
        <div className="bg-darkBackground dark:bg-background border-1 border-background dark:border-darkBackground w-44 p-3 rounded-lg">
          <Switch
            isSelected={selfRegister}
            onValueChange={setSelfRegister}
            color="success"
          >
            <p className="text-darkTextColor dark:text-textColor">
              {selfRegister ? "Ativado" : "Desativado"}
            </p>
          </Switch>
        </div>
      </div>
    </div>
  );
};

export default AuthSettings;
