import axios from "axios";

const api = axios.create({
  baseURL: `http://${process.env.REACT_APP_SERVER_IP}:${process.env.REACT_APP_SERVER_PORT}`,
  timeout: 10000,
  headers: { "Content-Type": "application/json" },
});

export default api;
