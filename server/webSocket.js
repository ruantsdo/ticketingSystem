const express = require("express");
const cors = require("cors");
const { Sequelize, DataTypes } = require("sequelize");

const {
  CLIENT_IP,
  CLIENT_PORT,
  DATABASE_NAME,
  DATABASE_USER,
  DATABASE_PASSWORD,
  DATABASE_HOST,
  DATABASE_PORT,
  SOCKET_SERVER_PORT,
  SOCKET_SERVER_IP,
} = require("./serverConfig/variables");

const app = express();
app.use(cors());
app.use(express.json());

const allowedOrigins = [`http://${CLIENT_IP}:${CLIENT_PORT}`];

const http = require("http").Server(app);
const io = require("socket.io")(http, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"],
    credentials: true,
    allowEIO3: true,
    optionSuccessStatus: 200,
    headers: ["Access-Control-Allow-Origin"],
  },
  transport: ["websocket"],
});

const sequelize = new Sequelize(
  DATABASE_NAME,
  DATABASE_USER,
  DATABASE_PASSWORD,
  {
    host: DATABASE_HOST,
    port: DATABASE_PORT,
    dialect: "mysql",
    logging: false, //Disable query messages
  }
);

sequelize
  .authenticate()
  .then(() => {
    console.log("Conexão com o banco de dados foi estabelecida com sucesso...");
  })
  .catch((err) => {
    console.error("Erro ao conectar com o banco de dados:", err);
  });

const TokenModel = sequelize.define(
  "token",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    sector: {
      type: DataTypes.STRING(150),
      allowNull: false,
    },
    service: {
      type: DataTypes.STRING(150),
      allowNull: false,
    },
    priority: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
    },
    requested_by: {
      type: DataTypes.STRING(150),
      allowNull: true,
    },
    created_by: {
      type: DataTypes.STRING(150),
      allowNull: false,
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    solved_by: {
      type: DataTypes.STRING(150),
      allowNull: true,
    },
    solved_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    table: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
  },
  {
    tableName: "tokens",
    timestamps: false,
    underscored: true,
  }
);

const QueueModel = sequelize.define(
  "queue",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    token: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    requested_by: {
      type: DataTypes.STRING(60),
      allowNull: true,
    },
    called_by: {
      type: DataTypes.STRING(150),
      allowNull: false,
    },
    called_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    sector: {
      type: DataTypes.STRING(150),
      allowNull: false,
    },
    table: {
      type: DataTypes.STRING(150),
      allowNull: false,
    },
  },
  {
    tableName: "queue",
    timestamps: false,
    underscored: true,
  }
);

QueueModel.belongsTo(TokenModel, {
  foreignKey: "token",
  targetKey: "id",
  as: "tokenInfo",
  onDelete: "CASCADE",
});

io.on("connection", (socket) => {
  console.log(`Cliente conectado: ${socket.id}`);

  socket.on("new_token", () => {
    io.emit("new_token");
  });

  socket.on("queued_update", (data) => {
    io.emit("queued_update", data);
  });

  socket.on("new_location", () => {
    io.emit("new_location");
  });

  socket.on("services_updated", () => {
    io.emit("services_updated");
  });

  socket.on("locations_updated", () => {
    io.emit("locations_updated");
  });

  socket.on("midNight", () => {
    io.emit("midNight");
  });

  socket.on("disconnect", () => {
    console.log(`Cliente desconectado: ${socket.id}`);
  });
});

http.listen(SOCKET_SERVER_PORT, SOCKET_SERVER_IP, () => {
  console.log("Socket Server ouvindo na porta => " + SOCKET_SERVER_PORT);
});
