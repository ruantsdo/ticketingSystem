//Components
import { Button } from "../../../../components";
//Icons
import PersonIcon from "@mui/icons-material/Person";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import HomeWorkIcon from "@mui/icons-material/HomeWork";
import BackupTableIcon from "@mui/icons-material/BackupTable";
import SettingsBackupRestoreIcon from "@mui/icons-material/SettingsBackupRestore";
import SyncIcon from "@mui/icons-material/Sync";

const Maintenance = () => {
  return (
    <div className="flex flex-col w-full items-center gap-3">
      <div className="flex flex-col w-[60%] gap-2 border-1 p-5 rounded-lg border-darkBackground dark:border-background">
        <p className="text-lg font-medium">Criar backup</p>
        <p>Selecione o tipo de backup desejado.</p>
        <div className="flex flex-row justify-between">
          <Button mode="success" className="w-32 h-12 rounded-lg">
            <PersonIcon /> Usuários
          </Button>
          <Button mode="success" className="w-32 h-12 rounded-lg">
            <LocationOnIcon /> Locais
          </Button>
          <Button mode="success" className="w-32 h-12 rounded-lg">
            <HomeWorkIcon />
            Serviços
          </Button>
          <Button mode="success" className="w-32 h-12 rounded-lg">
            <BackupTableIcon />
            Fichas atuais
          </Button>
          <Button mode="success" className="w-32 h-12 rounded-lg">
            <SettingsBackupRestoreIcon />
            Fichas antigas
          </Button>
        </div>
      </div>
      <div className="flex flex-col w-[60%] gap-2 border-1 p-5 rounded-lg border-darkBackground dark:border-background">
        <p className="text-lg font-medium">Restaurar um backup</p>
        <p>
          ATENÇÃO, A RESTAURAÇÃO DEVE SER FEITA COM O MESMO ARQUIVO DE BACKUP
          GERADO PELO SISTEMA.
        </p>
        <p>
          OS DADOS ATUAIS SERÃO SOBRESCRITOS, CERTIFIQUE-SE DE TER FEITO UM
          BACKUP ANTES DE REALIZAR ESSA AÇÃO!
        </p>
        <Button mode="success" className="w-32 h-12 rounded-lg">
          <SyncIcon /> Restaurar
        </Button>
      </div>
      <div className="flex flex-col w-[60%] gap-2 border-1 p-5 rounded-lg border-darkBackground dark:border-background">
        <p className="text-lg font-medium">Limpar dados</p>
        <p>Selecione quais dados deseja limpar.</p>
        <p>
          OS DADOS REMOVIDOS NÃO PODERÃO SER RESTAURADOS POSTERIORMENTE,
          CERTIFIQUE-SE DE TER FEITO UM BACKUP ANTES!
        </p>
        <div className="flex flex-row justify-between">
          <Button mode="failed" className="w-32 h-12 rounded-lg">
            <PersonIcon /> Usuários
          </Button>
          <Button mode="failed" className="w-32 h-12 rounded-lg">
            <LocationOnIcon /> Locais
          </Button>
          <Button mode="failed" className="w-32 h-12 rounded-lg">
            <HomeWorkIcon />
            Serviços
          </Button>
          <Button mode="failed" className="w-32 h-12 rounded-lg">
            <BackupTableIcon />
            Fichas atuais
          </Button>
          <Button mode="failed" className="w-32 h-12 rounded-lg">
            <SettingsBackupRestoreIcon />
            Fichas antigas
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Maintenance;
