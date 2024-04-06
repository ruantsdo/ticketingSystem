// Socket
import { useWebSocket } from "../contexts/webSocket";

const useSocketUtils = () => {
  const { socket } = useWebSocket();

  const usersUpdatedSignal = () => {
    socket.emit("users_updated");
  };

  return {
    usersUpdatedSignal,
  };
};

export default useSocketUtils;
