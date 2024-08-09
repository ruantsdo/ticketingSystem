const ioClient = require("socket.io-client");
const { SOCKET_SERVER_IP, SOCKET_SERVER_PORT } = require("./variables");

const socketServerUrl = `http://${SOCKET_SERVER_IP}:${SOCKET_SERVER_PORT}`;

const socket = ioClient.connect(socketServerUrl);

async function midNightSignal() {
  try {
    await socket.emit("midNight");
    return true;
  } catch (error) {
    console.log("Falha ao emitir sinal: " + error);
    return false;
  }
}

async function disconnectAllUsers() {
  try {
    await socket.emit("disconnectAllUsers");
    return true;
  } catch (error) {
    console.log("Falha ao emitir sinal: " + error);
    return false;
  }
}

module.exports = { midNightSignal, disconnectAllUsers };
