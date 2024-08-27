import React, { createContext, useContext, useState } from "react";

// Crie um contexto
const ConfirmIdentity = createContext();

export const ConfirmIdentityProvider = ({ children }) => {
  const [isAuthModalOpen, setAuthModalOpen] = useState(false);
  const [onAuthSuccess, setOnAuthSuccess] = useState(null);

  const requestAuth = (callback) => {
    setOnAuthSuccess(() => callback);
    setAuthModalOpen(true);
  };

  const handleAuthSuccess = (userLevel, userId, userStatus) => {
    if (onAuthSuccess) {
      onAuthSuccess(userLevel, userId, userStatus);
    }
    setAuthModalOpen(false);
  };

  return (
    <ConfirmIdentity.Provider
      value={{
        requestAuth,
        handleAuthSuccess,
        isAuthModalOpen,
        setAuthModalOpen,
      }}
    >
      {children}
    </ConfirmIdentity.Provider>
  );
};

export const useConfirmIdentity = () => useContext(ConfirmIdentity);
