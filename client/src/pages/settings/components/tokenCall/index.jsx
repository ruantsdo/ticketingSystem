//React
import { useEffect, useState } from "react";
//NextUi
import { SelectItem, Slider } from "@nextui-org/react";
//Components
import { Button, Select } from "../../../../components";
//Icons
import SaveIcon from "@mui/icons-material/Save";
import VolumeDownIcon from "@mui/icons-material/VolumeDown";
import VolumeUpIcon from "@mui/icons-material/VolumeUp";
//Stores
import { useSettingsStore } from "../../../../stores/";
import { toast } from "react-toastify";
//Contexts
import { useWebSocket } from "../../../../contexts/webSocket";
//Utils
import useSocketUtils from "../../../../utils/socketUtils";

const TokenCallSettings = () => {
  const { socket } = useWebSocket();
  const { processingSettingsStore, updateDefaultVolume, getFullSettings } =
    useSettingsStore();

  const {
    requireCurrentVolumeSignal,
    updateCurrentVolumeSignal,
    resetTokenCallScreenSignal,
  } = useSocketUtils();

  const [screenData, setScreenData] = useState([]);
  const [defaultVolume, setDefaultVolume] = useState(0);
  const [currentVolume, setCurrentVolume] = useState(0);
  const [targetId, setTargetId] = useState(null);
  const [targetIndex, setTargetIndex] = useState(null);

  const handleSelectionChange = (e) => {
    const index = e.target.value;
    setTargetIndex(index);

    setTargetId(screenData[index].id);
    setCurrentVolume(screenData[index].currentVolume);
  };

  const handleGetSettings = async () => {
    const response = await getFullSettings();
    setDefaultVolume(response.defaultVolume);
  };

  const handleUpdateDefaultVolume = async () => {
    await updateDefaultVolume(defaultVolume);
    updateCurrentVolume();
  };

  const updateCurrentVolume = () => {
    const data = {
      id: targetId,
      currentVolume: currentVolume,
    };
    updateCurrentVolumeSignal(data);
  };

  const handleResetScreen = () => {
    resetTokenCallScreenSignal();
  };

  useEffect(() => {
    setScreenData([]);
    handleGetSettings();
    requireCurrentVolumeSignal();
    //eslint-disable-next-line
  }, []);

  useEffect(() => {
    socket.on("sendCurrentVolume", (data) => {
      if (!data.id) {
        toast.info(
          "Não houve resposta de nenhuma tela ativa. Mostrando valor padrão."
        );
        return;
      } else {
        setScreenData([...screenData, data]);
      }
    });

    return () => {
      socket.off("sendCurrentVolume");
    };
  });

  return (
    <div className="flex flex-col w-full items-center gap-3">
      <Button
        mode="success"
        className="w-40 h-12 rounded-lg"
        isDisabled={processingSettingsStore}
        isLoading={processingSettingsStore}
        onClick={() => handleUpdateDefaultVolume()}
      >
        <SaveIcon /> Salvar configuração
      </Button>
      <div className="flex flex-col w-[60%] gap-2 border-1 p-5 rounded-lg border-darkBackground dark:border-background">
        <p className="text-lg font-medium">Ajuste de volume</p>
        <Select
          size="sm"
          label={
            screenData.length > 0
              ? "Indique a tela desejada"
              : "Não há telas para ativas"
          }
          variant="bordered"
          selectedKeys={targetIndex}
          className="max-w-xs"
          onChange={handleSelectionChange}
          isDisabled={!screenData.length > 0}
        >
          {screenData.map((screen, index) => (
            <SelectItem key={index}>{screen.name}</SelectItem>
          ))}
        </Select>
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
        <Button
          mode="failed"
          className="w-32 h-12 rounded-lg"
          onClick={() => handleResetScreen()}
        >
          <SaveIcon /> Restaurar
        </Button>
      </div>
    </div>
  );
};

export default TokenCallSettings;
