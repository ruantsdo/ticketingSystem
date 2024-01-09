require("dotenv").config({ path: "./.env" });

const express = require("express");
const app = express();
const cors = require("cors");
const cron = require("node-cron");

const {
  createAndInsertMonthlyTable,
  backupAndResetTable,
} = require("./serverConfig/backups");

app.use(cors());
app.use(express.json());

cron.schedule("0 0 * * *", async () => {
  console.log("Iniciando rotina de backup diário!");
  await createAndInsertMonthlyTable();
  backupAndResetTable();
});

const getRoutes = require("./serverConfig/routes/getRoutes");
const postRoutes = require("./serverConfig/routes/postRoutes");

app.use("/", getRoutes);
app.use("/", postRoutes);

app.listen(process.env.SERVER_PORT, process.env.SERVER_IP, () => {
  console.log(
    "Servidor está ouvindo na porta => " + process.env.SERVER_PORT + " ..."
  );
});
