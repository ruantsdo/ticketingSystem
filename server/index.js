const express = require("express");
const app = express();
const cors = require("cors");
const cron = require("node-cron");

const { SERVER_PORT, SERVER_IP } = require("./serverConfig/variables");

const { createBackup } = require("./serverConfig/backups");

app.use(cors());
app.use(express.json());

cron.schedule("0 0 * * *", async () => {
  createBackup();
});

const getRoutes = require("./serverConfig/routes/getRoutes");
const postRoutes = require("./serverConfig/routes/postRoutes");

app.use("/", getRoutes);
app.use("/", postRoutes);

app.listen(SERVER_PORT, SERVER_IP, () => {
  console.log("Servidor está ouvindo na porta => " + SERVER_PORT + " ...");
});
