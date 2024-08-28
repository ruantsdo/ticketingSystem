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

function TokensDetails({ ...props }) {
  const { tokenDetailIsOpen, setTokenDetailIsOpen, token } = props;

  return (
    <Modal isOpen={tokenDetailIsOpen} hideCloseButton={true} backdrop="opaque">
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
              {token.deficiencies && (
                <h6 className="text-md">
                  Pessoa com deficiência: {token.deficiencies}
                </h6>
              )}
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
                <div>
                  <h5 className="font-bold">OBSERVAÇÕES: </h5>
                  <h6 className="indent-2">{token.description}</h6>
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
