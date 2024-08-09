//Stores
import { Button } from "../../../../components";
import useSettingsStore from "../../../../stores/settingsStore/store";
//Utils
import useSocketUtils from "../../../../utils/socketUtils";

const Maintenance = () => {
  const { disconnectAllUsersSignal } = useSocketUtils();
  const {
    backupCurrentTokens,
    resetPool,
    restoreDatabase,
    processingSettingsStore,
  } = useSettingsStore();

  return (
    <div className="flex flex-col w-full items-center gap-3">
      <div className="flex flex-col w-[60%] gap-2 border-1 p-5 rounded-lg border-darkBackground dark:border-background">
        <p className="text-lg font-medium">Forçar backup das fichas atuais</p>
        <p>As fichas atuais são movidas para o histórico</p>
        <p>APAGA TODAS A FICHAS ATUAIS</p>
        <Button
          mode="success"
          className="w-fit pl-3 pr-3 h-12 rounded-lg"
          onClick={() => backupCurrentTokens()}
          isLoading={processingSettingsStore}
          isDisabled={processingSettingsStore}
        >
          Iniciar backup
        </Button>
      </div>
      <div className="flex flex-col w-[60%] gap-2 border-1 p-5 rounded-lg border-darkBackground dark:border-background">
        <p className="text-lg font-medium">Desconectar todos os usuários</p>
        <p>Será preciso fazer login novamente!</p>
        <Button
          mode="success"
          className="w-fit pl-3 pr-3 h-12 rounded-lg"
          onClick={() => disconnectAllUsersSignal()}
          isLoading={processingSettingsStore}
          isDisabled={processingSettingsStore}
        >
          Desconectar usuários
        </Button>
      </div>
      <div className="flex flex-col w-[60%] gap-2 border-1 p-5 rounded-lg border-darkBackground dark:border-background">
        <p className="text-lg font-medium">Limpar POOL de conexões</p>
        <p>Use caso o sistema está apresentando lentidão ou está travado</p>
        <p>
          Isso irá interromper temporariamente as operações com o banco de
          dados.
        </p>
        <p>PODE CAUSAR FALHA NA COMUNICAÇÃO COM O SERVIDOR</p>
        <Button
          mode="failed"
          className="w-fit pl-3 pr-3 h-12 rounded-lg"
          onClick={() => resetPool()}
          isLoading={processingSettingsStore}
          isDisabled={processingSettingsStore}
        >
          Iniciar limpeza do POOL
        </Button>
      </div>
      <div className="flex flex-col w-[60%] gap-2 border-1 p-5 rounded-lg border-darkBackground dark:border-background">
        <p className="text-lg font-medium">Restaurar banco de dados</p>
        <p>
          Caso a estrutura das tabelas tenha sido comprometida use esta opções
        </p>
        <p>APAGA TODOS OS DADOS</p>
        <p>DESCONECTA TODOS OS USUÁRIOS CONECTADOS NO MOMENTO!</p>
        <Button
          mode="failed"
          className="w-fit pl-3 pr-3 h-12 rounded-lg"
          onClick={() => restoreDatabase()}
          isLoading={processingSettingsStore}
          isDisabled={processingSettingsStore}
        >
          Iniciar restauração do banco de dados
        </Button>
      </div>
    </div>
  );
};

export default Maintenance;
