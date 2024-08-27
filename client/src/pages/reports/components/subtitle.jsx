//NextUI
import {
  Chip,
  Divider,
  Popover,
  PopoverContent,
  PopoverTrigger,
  Button,
} from "@nextui-org/react";

//Icons
import PersonIcon from "@mui/icons-material/Person";
import AssistWalkerIcon from "@mui/icons-material/AssistWalker";
import EmojiEmotionsIcon from "@mui/icons-material/EmojiEmotions";
import ReportIcon from "@mui/icons-material/Report";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
import SettingsIcon from "@mui/icons-material/Settings";

const Subtitle = () => {
  return (
    <div className="flex flex-row justify-between items-center">
      <p>STATUS</p>
      <Popover placement="left" showArrow>
        <PopoverTrigger>
          <Button
            isIconOnly
            startContent={<HelpOutlineIcon fontSize="small" />}
            className="bg-transparent"
            color="foreground"
          />
        </PopoverTrigger>
        <PopoverContent className="flex flex-col items-start justify-around gap-1 p-2">
          <Chip
            size="sm"
            radius="sm"
            className="bg-alert"
            startContent={<AssistWalkerIcon size={18} />}
          >
            PRIORIDADE
          </Chip>
          <Chip
            size="sm"
            radius="sm"
            className="bg-success"
            startContent={<PersonIcon size={18} />}
          >
            NORMAL
          </Chip>
          <Divider />
          <Chip
            size="sm"
            radius="sm"
            startContent={<SettingsIcon size={18} />}
            className="bg-darkFailed"
          >
            ENCERRADO PELO SISTEMA
          </Chip>
          <Chip
            size="sm"
            radius="sm"
            className="bg-success"
            startContent={<EmojiEmotionsIcon size={18} />}
          >
            CONCLUÍDO
          </Chip>
          <Chip
            size="sm"
            radius="sm"
            className="bg-failed"
            startContent={<ReportIcon size={18} />}
          >
            ADIADO
          </Chip>
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default Subtitle;
