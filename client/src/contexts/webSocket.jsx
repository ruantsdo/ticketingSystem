// Exemplo usando React Context
import React, { createContext, useContext, useEffect } from "react";
import socketIOClient from "socket.io-client";

const WebSocketContext = createContext();

export function WebSocketProvider({ children }) {
  const socket = socketIOClient(
    `http://${process.env.REACT_APP_SOCKET_SERVER_IP}:${process.env.REACT_APP_SOCKET_SERVER_PORT}`
  );

  useEffect(() => {
    return () => {
      socket.disconnect();
    };
  }, [socket]);

  return (
    <WebSocketContext.Provider value={socket}>
      {children}
    </WebSocketContext.Provider>
  );
}

export function useWebSocket() {
  return useContext(WebSocketContext);
}
