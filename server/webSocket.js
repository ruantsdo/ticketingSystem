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

// Configure a MySQL connection
const sequelize = new Sequelize(databaseName, databaseUser, databasePassword, {
  host: databaseHost,
  port: databasePort,
  dialect: "mysql",
});

// Define a model for the table you want to observe
const TableModel = sequelize.define("queue", {
  // Define your table columns here
});

// Start the WebSocket server
io.on("connection", (socket) => {
  console.log("Client connected");

  // Subscribe to changes in the table
  TableModel.addHook("afterCreate", (data) => {
    // Notify clients when a new record is created
    socket.emit("table_change", data);
  });

  // Handle disconnection
  socket.on("disconnect", () => {
    console.log("Client disconnected");
  });
});

// Start your Node.js server
http.listen(socketServerPort, socketServer, () => {
  console.log("Socket Server ouvindo na porta => " + socketServerPort);
});
