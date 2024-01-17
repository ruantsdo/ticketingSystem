const express = require("express");
const app = express();
const cors = require("cors");
const cron = require("node-cron");

const { SERVER_PORT, SERVER_IP } = require("./serverConfig/variables");

const {
  createAndInsertYearlyTable,
  backupAndResetTable,
} = require("./serverConfig/backups");

app.use(cors());
app.use(express.json());

cron.schedule("0 2 * * *", async () => {
  console.log("Iniciando rotina de backup diário!");
  await createAndInsertYearlyTable();
  backupAndResetTable();
});

const getRoutes = require("./serverConfig/routes/getRoutes");
const postRoutes = require("./serverConfig/routes/postRoutes");

app.use("/", getRoutes);
app.use("/", postRoutes);

app.listen(SERVER_PORT, SERVER_IP, () => {
  console.log("Servidor está ouvindo na porta => " + SERVER_PORT + " ...");
});
