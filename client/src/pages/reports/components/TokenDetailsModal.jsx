//Components
import { Divider, Button } from "../../../components";
//NextUI
import {
  Chip,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "@nextui-org/react";
//Icons
import HourglassBottomIcon from "@mui/icons-material/HourglassBottom";
import PersonIcon from "@mui/icons-material/Person";
import AssistWalkerIcon from "@mui/icons-material/AssistWalker";
import EmojiEmotionsIcon from "@mui/icons-material/EmojiEmotions";
import ReportIcon from "@mui/icons-material/Report";
import SettingsIcon from "@mui/icons-material/Settings";
import PsychologyIcon from "@mui/icons-material/Psychology";
import HearingDisabledIcon from "@mui/icons-material/HearingDisabled";
import AccessibleIcon from "@mui/icons-material/Accessible";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";

function TokensDetails({ ...props }) {
  const { tokenDetailIsOpen, setTokenDetailIsOpen, token } = props;

  return (
    <Modal
      isOpen={tokenDetailIsOpen}
      hideCloseButton={true}
      backdrop="opaque"
      size="lg"
    >
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader className="flex flex-col gap-1 justify-center items-center font-semibold">
              Dados da Ficha
              <section className="flex gap-3 justify-center items-center">
                {token.priority === 1 ? (
                  <Chip
                    size="sm"
                    radius="sm"
                    className="bg-alert"
                    startContent={<AssistWalkerIcon size={18} />}
                  >
                    PRIORIDADE
                  </Chip>
                ) : (
                  <Chip
                    size="sm"
                    radius="sm"
                    className="bg-success"
                    startContent={<PersonIcon size={18} />}
                  >
                    NORMAL
                  </Chip>
                )}
                {token.status === "EM ESPERA" ? (
                  <Chip
                    size="sm"
                    radius="sm"
                    className="bg-info"
                    startContent={<HourglassBottomIcon size={18} />}
                  >
                    EM ESPERA
                  </Chip>
                ) : token.status === "ENCERRADO PELO SISTEMA" ? (
                  <Chip
                    size="sm"
                    radius="sm"
                    startContent={<SettingsIcon size={18} />}
                    className="bg-darkFailed"
                  >
                    ENCERRADO PELO SISTEMA
                  </Chip>
                ) : token.status === "CONCLUIDO" ? (
                  <Chip
                    size="sm"
                    radius="sm"
                    className="bg-success"
                    startContent={<EmojiEmotionsIcon size={18} />}
                  >
                    CONCLUÍDO
                  </Chip>
                ) : (
                  token.status === "ADIADO" && (
                    <Chip
                      size="sm"
                      radius="sm"
                      className="bg-failed"
                      startContent={<ReportIcon size={18} />}
                    >
                      ADIADO
                    </Chip>
                  )
                )}
              </section>
              {token.visual_impairment ||
              token.motor_disability ||
              token.hearing_impairment ||
              token.cognitive_impairment ? (
                <p className="text-xl indent-2">Portador de deficiência:</p>
              ) : null}
              <div className="flex justify-center gap-3 w-full">
                {token.visual_impairment ? (
                  <div className="flex gap-1 border-1 rounded pr-2 pl-2 items-center">
                    <VisibilityOffIcon fontSize="medium" />
                    <p>Visual</p>
                  </div>
                ) : null}
                {token.motor_disability ? (
                  <div className="flex gap-1 border-1 rounded pr-2 pl-2 items-center">
                    <AccessibleIcon fontSize="medium" />
                    <p>Motora</p>
                  </div>
                ) : null}
                {token.hearing_impairment ? (
                  <div className="flex gap-1 border-1 rounded pr-2 pl-2 items-center">
                    <HearingDisabledIcon fontSize="medium" />
                    <p>Auditiva</p>
                  </div>
                ) : null}
                {token.cognitive_impairment ? (
                  <div className="flex gap-1 border-1 rounded pr-2 pl-2 items-center">
                    <PsychologyIcon fontSize="medium" />
                    <p>Cognitiva</p>
                  </div>
                ) : null}
              </div>
            </ModalHeader>
            <Divider />
            <ModalBody>
              <div>
                <h5 className="font-bold">Ficha</h5>
                <h6 className="indent-2">
                  {token.service} [ {token.position} ]
                </h6>
              </div>
              {token.requested_by !== "" ? (
                <div>
                  <h5 className="font-bold">Solicitada por: </h5>
                  <h6 className="indent-2">{token.requested_by}</h6>
                </div>
              ) : (
                <p>Solicitada por: NÃO FOI ESPECIFICADO</p>
              )}
              <div>
                <h5 className="font-bold">Ficha criada por: </h5>
                <h6 className="indent-2">
                  {token.created_by} em {token.created_at}
                </h6>
              </div>
              {token.called_by && (
                <div>
                  <h5 className="font-bold">Chamada por: </h5>
                  <h6 className="indent-2">
                    {token.called_by} em {token.called_at}
                  </h6>
                </div>
              )}
              {token.delayed_at && (
                <div>
                  <h5 className="font-bold">Adiada por: </h5>
                  <h6 className="indent-2">
                    {token.delayed_by} em {token.delayed_at}
                  </h6>
                </div>
              )}
              {token.solved_at && (
                <div>
                  <h5 className="font-bold">Atendida por: </h5>
                  <h6 className="indent-2">
                    {token.solved_by} em {token.solved_at}
                  </h6>
                </div>
              )}
              {token.description && (
                <div className="flex flex-col">
                  <h5 className="font-bold">OBSERVAÇÕES:</h5>
                  <h6 className="max-w-full indent-2 break-words">
                    {token.description}
                  </h6>
                </div>
              )}
            </ModalBody>
            <Divider />
            <ModalFooter className="flex justify-center align-middle">
              <Button
                onPress={() => {
                  setTokenDetailIsOpen(false);
                  onClose();
                }}
                mode="failed"
              >
                Fechar
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
}

export default TokensDetails;
