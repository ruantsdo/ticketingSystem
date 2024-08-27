//React
import { useState } from "react";
//Toast
import { toast } from "react-toastify";
//Services
import api from "../services/api";

const useModalController = () => {
  const [processingIdentity, setProcessingIdentity] = useState(false);

  const confirmIdentity = async (data) => {
    setProcessingIdentity(true);

    const { credential, password } = data;

    try {
      const response = await api.post("/login", {
        cpf: credential,
        password: password,
      });

      if (response.data.length > 0) {
        const user = response.data[0];
        if (user.permission_level < 3 || user.status !== 1) {
          toast.warn("Este Usuário não pode fazer essa operação!");
          return 0;
        }

        const data = {
          id: user.id,
          level: user.permission_level,
          status: user.status,
        };

        return data;
      } else {
        toast.error("A validação falhou! Verifique suas credenciais ...");
        return 0;
      }
    } catch (err) {
      console.log(err);
      toast.error("Um erro aconteceu! Tente novamente mais tarde!");
      return 0;
    } finally {
      setProcessingIdentity(false);
    }
  };

  return {
    confirmIdentity,
    processingIdentity,
  };
};

export default useModalController;
