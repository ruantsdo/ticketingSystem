//NextUI
import { Card, Chip } from "@nextui-org/react";
//Icons
import HourglassBottomIcon from "@mui/icons-material/HourglassBottom";
import PersonIcon from "@mui/icons-material/Person";
import AirlineSeatReclineNormalIcon from "@mui/icons-material/AirlineSeatReclineNormal";
import AssistWalkerIcon from "@mui/icons-material/AssistWalker";
import EmojiEmotionsIcon from "@mui/icons-material/EmojiEmotions";
import ReportIcon from "@mui/icons-material/Report";
import PsychologyIcon from "@mui/icons-material/Psychology";
import HearingDisabledIcon from "@mui/icons-material/HearingDisabled";
import AccessibleIcon from "@mui/icons-material/Accessible";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";

const SuggestionCard = ({ ...props }) => {
  const { target, service, handleOpenModal } = props;

  if (target.id) {
    return (
      <Card
        isPressable
        className="flex flex-col w-5/12 h-56 hover:cursor-pointer
                 hover:opacity-90 hover:ring-2 rounded-lg
                 hover:shadow-md hover:scale-[101%] transition-all"
        onPress={handleOpenModal}
      >
        <div className="flex flex-col text-start indent-2">
          <p className="text-xl">Solicitante:</p>
          <p>{target.requested_by}</p>
          <p className="text-xl">Serviço solicitado:</p>
          <p>{service}</p>
          <p className="text-xl">Status</p>
        </div>
        <div className="flex flex-row ml-2">
          {target.priority === 1 ? (
            <Chip
              radius="full"
              startContent={<AssistWalkerIcon />}
              className="bg-alert w-[1.9rem] self-center mr-1.5 "
            />
          ) : (
            <Chip
              radius="full"
              startContent={<PersonIcon />}
              className="bg-success w-8 self-center mr-1.5"
            />
          )}

          {target.status === "EM ESPERA" ? (
            <Chip
              radius="full"
              startContent={<HourglassBottomIcon />}
              className="bg-info w-8 self-center mr-1.5"
            />
          ) : target.status === "EM ATENDIMENTO" ? (
            <Chip
              radius="full"
              startContent={<AirlineSeatReclineNormalIcon />}
              className="bg-info w-8 self-center mr-1.5"
            />
          ) : target.status === "ADIADO" ? (
            <div>
              <Chip
                radius="full"
                startContent={<HourglassBottomIcon />}
                className="bg-info w-8 self-center mr-1.5"
              />
              <Chip
                radius="full"
                startContent={<ReportIcon />}
                className="bg-failed w-8 self-center mr-1.5"
              />
            </div>
          ) : target.status === "CONCLUIDO" ? (
            <Chip
              radius="full"
              startContent={<EmojiEmotionsIcon />}
              className="bg-success w-8 self-center mr-1.5"
            />
          ) : null}
        </div>
        {target.visual_impairment ||
        target.motor_disability ||
        target.hearing_impairment ||
        target.cognitive_impairment ? (
          <p className="text-xl indent-2">Portador de deficiência:</p>
        ) : null}
        <div className="flex gap-3 w-full ml-2">
          {target.visual_impairment ? (
            <div className="flex gap-1 border-1 rounded pr-2 pl-2 items-center">
              <VisibilityOffIcon fontSize="medium" />
              <p>Visual</p>
            </div>
          ) : null}
          {target.motor_disability ? (
            <div className="flex gap-1 border-1 rounded pr-2 pl-2 items-center">
              <AccessibleIcon fontSize="medium" />
              <p>Motora</p>
            </div>
          ) : null}
          {target.hearing_impairment ? (
            <div className="flex gap-1 border-1 rounded pr-2 pl-2 items-center">
              <HearingDisabledIcon fontSize="medium" />
              <p>Auditiva</p>
            </div>
          ) : null}
          {target.cognitive_impairment ? (
            <div className="flex gap-1 border-1 rounded pr-2 pl-2 items-center">
              <PsychologyIcon fontSize="medium" />
              <p>Cognitiva</p>
            </div>
          ) : null}
        </div>
      </Card>
    );
  } else {
    return (
      <Card className="flex w-4/12 h-44 justify-center text-center text-lg">
        <p>{service}</p>
      </Card>
    );
  }
};

export default SuggestionCard;
