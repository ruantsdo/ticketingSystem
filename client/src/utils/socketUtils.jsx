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

  return {
    newTokenSignal,
    usersUpdatedSignal,
    locationsUpdatedSignal,
    servicesUpdatedSignal,
  };
};

export default useSocketUtils;
