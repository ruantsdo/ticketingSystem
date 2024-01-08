require("dotenv").config({ path: "./.env" });

const express = require("express");
const app = express();
const cors = require("cors");

const { createAndInsertMonthlyTable } = require("./serverConfig/backups");

app.use(cors());
app.use(express.json());

const getRoutes = require("./serverConfig/routes/getRoutes");
const postRoutes = require("./serverConfig/routes/postRoutes");

app.use("/", getRoutes);
app.use("/", postRoutes);

app.listen(process.env.SERVER_PORT, process.env.SERVER_IP, () => {
  console.log(
    "Servidor está ouvindo na porta => " + process.env.SERVER_PORT + " ..."
  );
});
