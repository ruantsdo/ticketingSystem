import axios from "axios";

const myIp = "192.168.0.38";
const port = "3001";

const api = axios.create({
  baseURL: `http://${myIp}:${port}`,
  timeout: 5000,
  headers: { "Content-Type": "application/json" },
});

export default api;
