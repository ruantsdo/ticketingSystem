//React
import { useEffect, useState } from "react";
//Components
import { Switch } from "@nextui-org/react";
import { Button } from "../../../../components";
//Icons
import SaveIcon from "@mui/icons-material/Save";
//Stores
import useSettingsStore from "../../../../stores/settingsStore/store";
//Toast
import { toast } from "react-toastify";

const AuthSettings = () => {
  const { processingSettingsStore, updateSettings, getFullSettings } =
    useSettingsStore();

  const [autoAprove, setAutoAprove] = useState(false);
  const [forceLogin, setForceLogin] = useState(false);
  const [selfRegister, setSelfRegister] = useState(false);

  const handleGetSettings = async () => {
    const response = await getFullSettings();
    if (!response) {
      toast.error("Falha ao obter configurações.");
      return;
    }
    setAutoAprove(response.autoAprove);
    setForceLogin(response.forceDailyLogin);
    setSelfRegister(response.registerForm);
  };

  const handleUpdateSettings = async () => {
    const settingsData = {
      autoAprove: autoAprove,
      forceDailyLogin: forceLogin,
      registerForm: selfRegister,
    };

    await updateSettings(settingsData);
  };

  const handleAutoAprove = () => {
    setAutoAprove(!autoAprove);
    if (!autoAprove && !selfRegister) {
      setSelfRegister(true);
    }
  };

  useEffect(() => {
    handleGetSettings();
    //eslint-disable-next-line
  }, []);

  return (
    <div className="flex flex-col w-full items-center gap-3">
      <Button
        mode="success"
        className="w-40 h-12 rounded-lg"
        onClick={() => handleUpdateSettings()}
        isDisabled={processingSettingsStore}
        isLoading={processingSettingsStore}
      >
        {!processingSettingsStore && <SaveIcon />} Salvar configuração
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
            onValueChange={handleAutoAprove}
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
