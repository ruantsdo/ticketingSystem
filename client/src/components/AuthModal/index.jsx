import React, { useState } from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Input,
} from "@nextui-org/react";
import { Button } from "../";
//Controller
import useModalController from "../../utils/confirmIdentityController";
//Provider
import { useConfirmIdentity } from "../../providers/confirmIdentity";

const AuthModal = () => {
  const { isAuthModalOpen, setAuthModalOpen, handleAuthSuccess } =
    useConfirmIdentity();
  const { confirmIdentity } = useModalController();

  const [credential, setCredential] = useState("");
  const [password, setPassword] = useState("");

  const handleAuthorize = async () => {
    const data = {
      credential: credential,
      password: password,
    };

    const response = await confirmIdentity(data);

    if (response) {
      const { level, id, status } = response;

      const userLevel = level;
      const userId = id;
      const userStatus = status;

      await handleAuthSuccess(userLevel, userId, userStatus);
      handleCloseModal();
    }
  };

  const handleCloseModal = () => {
    clearData();
    setAuthModalOpen(false);
  };

  const clearData = () => {
    setCredential("");
    setPassword("");
  };

  return (
    <Modal isOpen={isAuthModalOpen}>
      <ModalContent className="flex flex-col gap-3 justify-around">
        <ModalHeader className="flex flex-col gap-1">
          <p>Confirmação de identidade necessária</p>
          <p className="text-sm">Informe suas credenciais para continuar ...</p>
        </ModalHeader>
        <ModalBody>
          <Input
            variant="bordered"
            maxLength={11}
            size="sm"
            className="w-full"
            label="Credencial"
            value={credential}
            onChange={(e) => setCredential(e.target.value)}
          />
          <Input
            variant="bordered"
            size="sm"
            className="w-full"
            label="Senha"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </ModalBody>
        <ModalFooter>
          <Button mode="failed" variant="light" onClick={handleCloseModal}>
            Fechar
          </Button>
          <Button mode="success" onClick={handleAuthorize}>
            Autorizar
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default AuthModal;
