import React, { createContext, useContext, useRef } from "react";
import socketIOClient from "socket.io-client";

const WebSocketContext = createContext();

export function WebSocketProvider({ children }) {
  const socket = socketIOClient(
    `http://${process.env.REACT_APP_SOCKET_SERVER_IP}:${process.env.REACT_APP_SOCKET_SERVER_PORT}`
  );

  const socketRef = useRef(socket);

  const addSocketEventListener = (event, callback) => {
    socketRef.current.on(event, callback);
  };

  return (
    <WebSocketContext.Provider value={{ socket, addSocketEventListener }}>
      {children}
    </WebSocketContext.Provider>
  );
}

export function useWebSocket() {
  return useContext(WebSocketContext);
}
