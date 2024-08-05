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
  MIN_CONNECTIONS,
  MAX_CONNECTIONS,
  TIMEOUT_DELAY,
  SOCKET_TIMEOUT,
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
    logging: false, //Disable query message
    pool: {
      max: MAX_CONNECTIONS,
      min: MIN_CONNECTIONS,
      acquire: TIMEOUT_DELAY,
      idle: TIMEOUT_DELAY / 2,
    },
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
    setTimeout(() => {
      io.emit("new_token");
    }, SOCKET_TIMEOUT);
  });

  socket.on("queued_update", (data) => {
    setTimeout(() => {
      io.emit("queued_update", data);
    }, SOCKET_TIMEOUT);
  });

  socket.on("new_location", () => {
    setTimeout(() => {
      io.emit("new_location");
    }, SOCKET_TIMEOUT);
  });

  socket.on("services_updated", () => {
    setTimeout(() => {
      io.emit("services_updated");
    }, SOCKET_TIMEOUT);
  });

  socket.on("locations_updated", () => {
    setTimeout(() => {
      io.emit("locations_updated");
    }, SOCKET_TIMEOUT);
  });

  socket.on("users_updated", () => {
    setTimeout(() => {
      io.emit("users_updated");
    }, SOCKET_TIMEOUT);
  });

  socket.on("video_update", () => {
    setTimeout(() => {
      io.emit("video_update");
    }, SOCKET_TIMEOUT);
  });

  socket.on("settings_update", () => {
    setTimeout(() => {
      io.emit("settings_update");
    }, SOCKET_TIMEOUT);
  });

  socket.on("requireCurrentVolume", () => {
    setTimeout(() => {
      io.emit("requireCurrentVolume");
    }, SOCKET_TIMEOUT);
  });

  socket.on("sendCurrentVolume", (data) => {
    setTimeout(() => {
      io.emit("sendCurrentVolume", data);
    }, SOCKET_TIMEOUT);
  });

  socket.on("adjustCurrentVolume", (data) => {
    setTimeout(() => {
      io.emit("adjustCurrentVolume", data);
    }, SOCKET_TIMEOUT);
  });

  socket.on("resetTokenCallScreen", () => {
    setTimeout(() => {
      io.emit("resetTokenCallScreen");
    }, SOCKET_TIMEOUT);
  });

  socket.on("midNight", () => {
    setTimeout(() => {
      io.emit("midNight");
    }, SOCKET_TIMEOUT);
  });

  socket.on("disconnectUser", (id) => {
    setTimeout(() => {
      io.emit("disconnectUser", id);
    }, SOCKET_TIMEOUT);
  });

  socket.on("disconnect", () => {
    console.log(`Cliente desconectado: ${socket.id}`);
  });
});

http.listen(SOCKET_SERVER_PORT, SOCKET_SERVER_IP, () => {
  console.log("Socket Server ouvindo na porta => " + SOCKET_SERVER_PORT);
});
