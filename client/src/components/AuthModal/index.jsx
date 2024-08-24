import React, { useState } from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  Input,
} from "@nextui-org/react";
import { Button } from "../";
//Controller
import useModalController from "../../utils/confirmIdentityController";
//Provider
import { useConfirmIdentity } from "../../providers/confirmIdentity";
import { toast } from "react-toastify";
//Formik
import { Formik, Form, useFormik } from "formik";

const AuthModal = () => {
  const { isAuthModalOpen, setAuthModalOpen, handleAuthSuccess } =
    useConfirmIdentity();
  const { confirmIdentity } = useModalController();

  const [processingLogin, setProcessingLogin] = useState(false);

  const formik = useFormik({
    initialValues: {
      credential: "",
      password: "",
    },
    onSubmit: async (values) => {
      setProcessingLogin(true);
      try {
        await handleAuthorize(values);

        return;
      } catch (err) {
        toast.error("Falha na autenticação!");
      } finally {
        setProcessingLogin(false);
      }
    },
  });

  const handleAuthorize = async (values) => {
    const data = {
      credential: values.credential,
      password: values.password,
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
    formik.resetForm();
  };

  return (
    <Modal isOpen={isAuthModalOpen} size="lg" backdrop="blur" hideCloseButton>
      <ModalContent className="flex flex-col gap-3 justify-around">
        <ModalHeader className="flex flex-col gap-1">
          <p>Confirmação de identidade necessária</p>
          <p className="text-sm">Informe suas credenciais para continuar ...</p>
        </ModalHeader>
        <ModalBody>
          <Formik initialValues={formik.initialValues}>
            <Form
              onSubmit={formik.handleSubmit}
              className="flex flex-col gap-3 justify-center items-center w-full"
            >
              <Input
                isRequired
                type="text"
                label="Credencial"
                maxLength={11}
                name="credential"
                onChange={formik.handleChange}
                value={formik.values.credential}
              />
              <Input
                isRequired
                type="password"
                label="Senha"
                name="password"
                onChange={formik.handleChange}
                value={formik.values.password}
              />
              <div className="flex gap-5 self-end">
                <Button
                  mode="failed"
                  variant="light"
                  onClick={handleCloseModal}
                >
                  Fechar
                </Button>

                <Button
                  type="submit"
                  mode="success"
                  isLoading={processingLogin}
                >
                  Autorizar
                </Button>
              </div>
            </Form>
          </Formik>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export default AuthModal;
