//React
import { useState } from "react";
//NextUi
import { Slider } from "@nextui-org/react";
//Components
import { Button } from "../../../../components";
//Icons
import SaveIcon from "@mui/icons-material/Save";
import VolumeDownIcon from "@mui/icons-material/VolumeDown";
import VolumeUpIcon from "@mui/icons-material/VolumeUp";

const TokenCallSettings = () => {
  const [currentVolume, setCurrentVolume] = useState(0.15);
  const [defaultVolume, setDefaultVolume] = useState(0.05);

  return (
    <div className="flex flex-col w-full items-center gap-3">
      <Button mode="success" className="w-40 h-12 rounded-lg">
        <SaveIcon fontSize="small" /> Salvar configuração
      </Button>
      <div className="flex flex-col w-[60%] gap-2 border-1 p-5 rounded-lg border-darkBackground dark:border-background">
        <p className="text-lg font-medium">Ajuste de volume</p>
        <p>
          Controla o volume atual em todas as telas de chamado. (Não altera o
          valor padrão)
        </p>
        <Slider
          aria-label="current Volume"
          showTooltip={true}
          step={0.01}
          formatOptions={{ style: "percent" }}
          maxValue={1}
          minValue={0}
          size="lg"
          color="success"
          startContent={<VolumeDownIcon />}
          endContent={<VolumeUpIcon />}
          className="max-w-md"
          value={currentVolume}
          onChange={setCurrentVolume}
        />
        <p>Volume atual: {Math.floor(currentVolume * 100)}%</p>
      </div>
      <div className="flex flex-col w-[60%] gap-2 border-1 p-5 rounded-lg border-darkBackground dark:border-background">
        <p className="text-lg font-medium">Ajuste de volume padrão</p>
        <p>
          Controla o volume padrão entrar na tela de chamada. (Não ajusta o
          volume atual)
        </p>
        <Slider
          aria-label="default Volume"
          showTooltip={true}
          step={0.01}
          formatOptions={{ style: "percent" }}
          maxValue={1}
          minValue={0}
          size="lg"
          color="success"
          startContent={<VolumeDownIcon />}
          endContent={<VolumeUpIcon />}
          className="max-w-md"
          value={defaultVolume}
          onChange={setDefaultVolume}
        />
        <p>Volume atual: {Math.floor(defaultVolume * 100)}%</p>
      </div>
      <div className="flex flex-col w-[60%] gap-2 border-1 p-5 rounded-lg border-darkBackground dark:border-background">
        <p className="text-lg font-medium">Forçar limpeza de tela</p>
        <p>Restaura as telas de chamado para o estado vazio inicial.</p>
        <Button mode="failed" className="w-32 h-12 rounded-lg">
          <SaveIcon /> Restaurar
        </Button>
      </div>
    </div>
  );
};

export default TokenCallSettings;
