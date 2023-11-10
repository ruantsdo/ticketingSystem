//React
import React, { createContext, useEffect, useState } from "react";

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    setIsLoading(true);
    const currentUser = JSON.parse(localStorage.getItem("currentUser"));
    if (currentUser) {
      try {
        setCurrentUser(currentUser);
      } catch (err) {
        console.warn("Falha na verificação do usuário!");
      } finally {
        setIsLoading(false);
      }
    }
    setIsLoading(false);
    // eslint-disable-next-line
  }, []);

  return (
    <AuthContext.Provider value={{ currentUser, setCurrentUser, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
