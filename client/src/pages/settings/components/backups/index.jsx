//React
import { useState } from "react";
//Components
import { Button } from "../../../../components";
//Icons
import SyncIcon from "@mui/icons-material/Sync";
//Stores
import { useSettingsStore } from "../../../../stores";
//NextUi
import {
  Modal,
  ModalContent,
  ModalBody,
  useDisclosure,
} from "@nextui-org/react";
//Icons
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
//Toast
import { toast } from "react-toastify";
//Data
import tablesData from "./tablesData";

const Backups = () => {
  const {
    handleClearTable,
    handleCreateBackup,
    handleRestoreBackup,
    processingSettingsStore,
  } = useSettingsStore();
  const { isOpen, onOpen, onOpenChange } = useDisclosure();

  const [file, setFile] = useState(null);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleRestore = async () => {
    if (!file) {
      toast.error("Por favor, selecione um arquivo primeiro.");
      return;
    }

    await handleRestoreBackup(file);
  };

  return (
    <div className="flex flex-col w-full items-center gap-3">
      <div className="flex flex-col w-[60%] gap-2 border-1 p-5 rounded-lg border-darkBackground dark:border-background">
        <p className="text-lg font-medium">Criar backup</p>
        <p>Selecione o tipo de backup desejado.</p>
        <div className="flex flex-row flex-wrap gap-2 justify-between">
          {tablesData.map((item, index) => {
            return (
              <Button
                key={index}
                mode="success"
                className="w-32 h-12 rounded-lg"
                onClick={() => handleCreateBackup(item.table)}
                isLoading={processingSettingsStore}
                isDisabled={processingSettingsStore}
              >
                {item.icon}
                {item.label}
              </Button>
            );
          })}
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
        <Button
          mode="success"
          className="w-32 h-12 rounded-lg"
          onClick={onOpen}
          isLoading={processingSettingsStore}
          isDisabled={processingSettingsStore}
        >
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
        <div className="flex flex-row flex-wrap gap-2 justify-between">
          {tablesData.map((item, index) => {
            return (
              <Button
                key={index}
                mode="failed"
                className="w-32 h-12 rounded-lg"
                onClick={() => handleClearTable(item.table)}
                isLoading={processingSettingsStore}
                isDisabled={processingSettingsStore}
              >
                {item.icon}
                {item.label}
              </Button>
            );
          })}
        </div>
      </div>

      <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
        <ModalContent>
          {(onClose) => (
            <ModalBody className="flex items-center justify-center bg-background dark:bg-darkBackground rounded-lg">
              <label htmlFor="backupFileInput" className="text-center">
                <p>Escolha backup para fazer upload.</p>
                <p className="text-sm">Formatos aceitos: .sql</p>
                <p className="text-md">
                  AO ENVIAR TODOS OS DADOS ATUAIS SERÃO PERDIDOS
                </p>
                <p className="text-md">
                  CERTIFIQUE-SE DE USAR O BACKUP ADEQUADO PARA A OPÇÕES
                  SELECIONADA!
                </p>
              </label>
              <input
                id="backupFileInput"
                type="file"
                accept=".sql"
                onChange={handleFileChange}
              />
              <Button mode="success" className="w-24" onClick={handleRestore}>
                <CloudUploadIcon />
                Enviar
              </Button>
            </ModalBody>
          )}
        </ModalContent>
      </Modal>
    </div>
  );
};

export default Backups;
