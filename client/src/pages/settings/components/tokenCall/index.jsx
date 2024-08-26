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
import RestorePageIcon from "@mui/icons-material/RestorePage";
import EqualizerIcon from "@mui/icons-material/Equalizer";
//Stores
import { useSettingsStore } from "../../../../stores/";
//Contexts
import { useWebSocket } from "../../../../contexts/webSocket";
//Utils
import useSocketUtils from "../../../../utils/socketUtils";

const TokenCallSettings = () => {
  const { socket } = useWebSocket();
  const {
    processingSettingsStore,
    updateDefaultVolume,
    getFullSettings,
    updateCurrentVolume,
  } = useSettingsStore();

  const { requireCurrentVolumeSignal, resetTokenCallScreenSignal } =
    useSocketUtils();

  const [screensData, setScreensData] = useState([]);
  const [defaultVolume, setDefaultVolume] = useState(0);
  const [currentVolume, setCurrentVolume] = useState(0);

  const [targetName, setTargetName] = useState(null);
  const [targetId, setTargetId] = useState(null);
  const [targetIndex, setTargetIndex] = useState(null);

  const handleSelectionChange = (e) => {
    const index = e.target.value;
    setTargetIndex(index);

    setTargetName(screensData[index].name);
    setTargetId(screensData[index].id);
    setCurrentVolume(screensData[index].currentVolume);
  };

  const handleGetSettings = async () => {
    const response = await getFullSettings();
    setDefaultVolume(response.defaultVolume);
  };

  const handleUpdateDefaultVolume = async () => {
    await updateDefaultVolume(defaultVolume);
  };

  const handleUpdateCurrentVolume = async () => {
    const data = {
      id: targetId,
      currentVolume: currentVolume,
      name: targetName,
    };

    await updateCurrentVolume(data);
  };

  const handleResetScreen = () => {
    resetTokenCallScreenSignal();
  };

  useEffect(() => {
    setScreensData([]);
    handleGetSettings();
    requireCurrentVolumeSignal();
    //eslint-disable-next-line
  }, []);

  useEffect(() => {
    socket.on("sendCurrentVolume", (data) => {
      if (data.id) {
        const equalData = screensData.find((item) => item.id === data.id);
        if (equalData) return;

        setScreensData([...screensData, data]);
      }
    });

    return () => {
      socket.off("sendCurrentVolume");
    };
  });

  return (
    <div className="flex flex-col w-full items-center gap-3">
      <div className="flex flex-col w-[60%] gap-2 border-1 p-5 rounded-lg border-darkBackground dark:border-background">
        <p className="text-lg font-medium">Ajuste de volume</p>
        <Select
          size="sm"
          label={
            screensData.length > 0
              ? "Indique a tela desejada"
              : "Não há telas para ativas"
          }
          variant="bordered"
          selectedKeys={targetIndex}
          className="max-w-xs"
          onChange={handleSelectionChange}
          isDisabled={!screensData.length > 0}
        >
          {screensData.map((screen, index) => (
            <SelectItem key={index}>{screen.name}</SelectItem>
          ))}
        </Select>
        <p>
          Controla o volume atual em todas as telas de chamado. (Não altera o
          valor padrão)
        </p>
        <div className="flex flex-row w-full justify-between">
          <div className="flex flex-col w-1/2">
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
          <Button
            mode="success"
            className="w-40 h-12 rounded-lg"
            isDisabled={processingSettingsStore}
            isLoading={processingSettingsStore}
            onClick={() => handleUpdateCurrentVolume()}
          >
            <EqualizerIcon /> Ajustar volume
          </Button>
        </div>
      </div>
      <div className="flex flex-col w-[60%] gap-2 border-1 p-5 rounded-lg border-darkBackground dark:border-background">
        <p className="text-lg font-medium">Ajuste de volume padrão</p>
        <p>
          Controla o volume padrão entrar na tela de chamada. (Não ajusta o
          volume atual)
        </p>
        <div className="flex flex-row w-full justify-between">
          <div className="flex flex-col w-1/2">
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
          <Button
            mode="success"
            className="w-40 h-12 rounded-lg"
            isDisabled={processingSettingsStore}
            isLoading={processingSettingsStore}
            onClick={() => handleUpdateDefaultVolume()}
          >
            <SaveIcon /> Salvar
          </Button>
        </div>
      </div>
      <div className="flex flex-col w-[60%] gap-2 border-1 p-5 rounded-lg border-darkBackground dark:border-background">
        <p className="text-lg font-medium">Forçar limpeza de tela</p>
        <p>Restaura as telas de chamado para o estado vazio inicial.</p>
        <Button
          mode="failed"
          className="w-32 h-12 rounded-lg"
          onClick={() => handleResetScreen()}
        >
          <RestorePageIcon /> Restaurar
        </Button>
      </div>
    </div>
  );
};

export default TokenCallSettings;
