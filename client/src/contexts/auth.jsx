//React
import React, { createContext, useEffect, useState } from "react";
//Services
import api from "../services/api";
//Toast
import { toast } from "react-toastify";
//Router Dom
import { redirect } from "react-router-dom";

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);

  const daysToCheck = 1; //Time interval (in days) to revalidate credentials

  const isDatePassed = (startDate) => {
    const startDateObject = new Date(startDate);
    const currentDate = new Date();
    const timeDifference = currentDate - startDateObject;
    const daysDifference = timeDifference / (1000 * 60 * 60 * 24);

    return daysDifference >= daysToCheck;
  };

  const verifySettings = async () => {
    try {
      const response = await api.get(`/verifySettings`);
      return response.data;
    } catch (error) {
      toast.error("Falha ao obter configurações");
      console.error("Falha ao obter configurações");
      console.error(error);
      return false;
    }
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

    setIsLoading(false);
  };

  const wipeUserData = () => {
    setTimeout(() => {
      localStorage.removeItem("currentUser");
      localStorage.removeItem("lastDay");
      localStorage.removeItem("currentSession");
      setIsAdmin(false);
      setCurrentUser(null);

      redirect("/login");
      window.location.reload(true);
    }, 4000);
  };

  const validation = async (response, currentUser) => {
    setIsLoading(true);

    if (response === "expired") {
      toast.info("Suas credenciais expiraram...");
      toast.warn("Você deve fazer login novamente...");
      wipeUserData();
    } else if (response === "invalid") {
      toast.error("Parece que esse usuário não é mais válido...");
      toast.warn("Tente fazer login novamente...");
      wipeUserData();
    } else if (response === "valid") {
      setCurrentUser(currentUser);
      setIsAdmin(currentUser.permission_level > 2 ? true : false);
    }

    setIsLoading(false);
  };

  const checkDailyLogin = async () => {
    const settings = await verifySettings();
    const currentUser = JSON.parse(localStorage.getItem("currentUser"));
    const lastDay = JSON.parse(localStorage.getItem("lastDay"));

    if (currentUser) {
      if (!lastDay) {
        const startDate = new Date();
        localStorage.setItem("lastDay", JSON.stringify(startDate));
        verifyCredentials(currentUser);
        return;
      }
    } else {
      setIsLoading(false);
      return;
    }

    if (isDatePassed(lastDay)) {
      //A day has passed since the last check
      if (settings.forceDailyLogin) {
        toast.info("É preciso fazer login novamente!");
        wipeUserData();
        return;
      }

      const startDate = new Date();
      localStorage.setItem("lastDay", JSON.stringify(startDate));

      verifyCredentials(currentUser).finally(() => {
        setIsLoading(false);
      });
    } else {
      //Not a day has passed since the last check
      setCurrentUser(currentUser);
      setIsAdmin(currentUser.permission_level > 2 ? true : false);
      setIsLoading(false);
    }
  };

  const disconnectUser = (id) => {
    if (currentUser.id === id) {
      toast.warn("Você foi desconectado pelo administrador...");
      wipeUserData();
    }
  };

  useEffect(() => {
    checkDailyLogin();
    // eslint-disable-next-line
  }, []);

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        setCurrentUser,
        isLoading,
        setIsLoading,
        isAdmin,
        disconnectUser,
        wipeUserData,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
