require("dotenv").config({ path: "./.env" });

const express = require("express");
const cors = require("cors");
const Sequelize = require("sequelize");

const app = express();
app.use(cors());
app.use(express.json());

const http = require("http").Server(app);
const io = require("socket.io")(http, {
  cors: {
    origin: `http://${process.env.CLIENT_IP}:${process.env.CLIENT_PORT}`,
    methods: ["GET", "POST"],
    credentials: true,
    allowEIO3: true,
    optionSuccessStatus: 200,
    headers: ["Access-Control-Allow-Origin"],
  },
  transport: ["websocket"],
});

const sequelize = new Sequelize(
  process.env.DATABASE_NAME,
  process.env.DATABASE_USER,
  process.env.DATABASE_PASSWORD,
  {
    host: process.env.DATABASE_HOST,
    port: process.env.DATABASE_PORT,
    dialect: "mysql",
  }
);

const TableModel = sequelize.define("queue", {});

io.on("connection", (socket) => {
  console.log("Client connected");

  function send_websocket_data(sector, service, priority, created_by) {
    const data = {
      sector,
      service,
      priority,
      created_by,
    };

    console.log("Data received:", data);
    io.emit("queued_update", data);
  }

  socket.on("disconnect", () => {
    console.log("Client disconnected");
  });
});

http.listen(
  process.env.SOCKET_SERVER_PORT,
  process.env.SOCKET_SERVER_IP,
  () => {
    console.log(
      "Socket Server ouvindo na porta => " + process.env.SOCKET_SERVER_PORT
    );
  }
);
