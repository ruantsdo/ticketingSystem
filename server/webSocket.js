require("dotenv").config({ path: "../.env" });

const databaseHost = process.env.DATABASE_HOST;
const databasePort = process.env.DATABASE_PORT;
const clientIp = process.env.CLIENT_IP;
const clientPort = process.env.CLIENT_PORT;
const socketServer = process.env.SOCKET_SERVER;
const socketServerPort = process.env.SOCKET_SERVER_PORT;
const databaseName = process.env.DATABASE_NAME;
const databaseUser = process.env.DATABASE_USER;
const databasePassword = process.env.DATABASE_PASSWORD;

const express = require("express");
const cors = require("cors");
const Sequelize = require("sequelize");

const app = express();
app.use(cors());
app.use(express.json());

const http = require("http").Server(app);
const io = require("socket.io")(http, {
  cors: {
    origin: `http://${clientIp}:${clientPort}`,
    methods: ["GET", "POST"],
    credentials: true,
    allowEIO3: true,
    optionSuccessStatus: 200,
    headers: ["Access-Control-Allow-Origin"],
  },
  transport: ["websocket"],
});

const sequelize = new Sequelize(databaseName, databaseUser, databasePassword, {
  host: databaseHost,
  port: databasePort,
  dialect: "mysql",
});

const TableModel = sequelize.define("queue", {});

io.on("connection", (socket) => {
  console.log("Client connected");

  TableModel.addHook("afterCreate", (data) => {
    socket.emit("table_change", data);
  });

  socket.on("disconnect", () => {
    console.log("Client disconnected");
  });
});

http.listen(socketServerPort, socketServer, () => {
  console.log("Socket Server ouvindo na porta => " + socketServerPort);
});
