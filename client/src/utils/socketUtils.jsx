// Socket
import { useWebSocket } from "../contexts/webSocket";

const useSocketUtils = () => {
  const { socket } = useWebSocket();

  const usersUpdatedSignal = () => {
    socket.emit("users_updated");
  };

  const locationsUpdatedSignal = () => {
    socket.emit("locations_updated");
  };

  const servicesUpdatedSignal = () => {
    socket.emit("services_updated");
  };

  const newTokenSignal = () => {
    socket.emit("new_token");
  };

  const disconnectUserSignal = (id) => {
    socket.emit("disconnectUser", id);
  };

  const queueUpdateSignal = (data) => {
    socket.emit("queued_update", data);
  };

  const tokenUpdateSignal = () => {
    socket.emit("new_token");
  };

  const videoUpdateSignal = () => {
    socket.emit("video_update");
  };

  return {
    newTokenSignal,
    usersUpdatedSignal,
    locationsUpdatedSignal,
    servicesUpdatedSignal,
    disconnectUserSignal,
    queueUpdateSignal,
    tokenUpdateSignal,
    videoUpdateSignal,
  };
};

export default useSocketUtils;
