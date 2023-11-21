//React
import React, { createContext, useEffect, useState } from "react";

//Services
import api from "../services/api";

//Toast
import { toast } from "react-toastify";

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);

  const daysToCheck = 1; //Time interval (in days) to revalidate credentials

  const isDatePassed = (startDate) => {
    const startDateObject = new Date(startDate);
    const currentDate = new Date();
    const timeDifference = currentDate - startDateObject;
    const daysDifference = timeDifference / (1000 * 60 * 60 * 24);

    return daysDifference >= daysToCheck;
  };

  const verifyCredentials = async (currentUser) => {
    setIsLoading(true);

    if (currentUser) {
      try {
        const response = await api.post("/user/check", {
          cpf: currentUser.cpf,
          password: currentUser.password,
        });

        validation(response.data, currentUser);
      } catch (error) {
        console.log(error);
      }
    }
  };

  const validation = async (response, currentUser) => {
    if (response === "expired") {
      localStorage.clear();
      toast.info("Suas credenciais expiraram...");
      toast.warn("Você deve fazer login novamente...");
    } else if (response === "invalid") {
      localStorage.clear();
      toast.error("Parece que esse usuário não é mais válido...");
      toast.warn("Tente fazer login novamente...");
    } else if (response === "valid") {
      setCurrentUser(currentUser);
    }

    setIsLoading(false);
  };

  useEffect(() => {
    const lastDay = JSON.parse(localStorage.getItem("lastDay"));
    const currentUser = JSON.parse(localStorage.getItem("currentUser"));

    if (currentUser) {
      if (!lastDay) {
        const startDate = new Date();
        localStorage.setItem("lastDay", JSON.stringify(startDate));
        verifyCredentials(currentUser);
      } else {
        if (isDatePassed(lastDay)) {
          //A day has passed since the last check
          const startDate = new Date();
          localStorage.setItem("lastDay", JSON.stringify(startDate));

          verifyCredentials(currentUser).finally(() => {
            setIsLoading(false);
          });
        } else {
          //Not a day has passed since the last check
          setCurrentUser(currentUser);
          setIsLoading(false);
        }
      }
    } else {
      setIsLoading(false);
    }
    // eslint-disable-next-line
  }, []);

  return (
    <AuthContext.Provider
      value={{ currentUser, setCurrentUser, isLoading, setIsLoading }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
