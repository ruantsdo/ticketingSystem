require("dotenv").config({ path: "./.env" });

const express = require("express");
const app = express();

const videoDirectory = "./videos";

app.use(express.static(videoDirectory));

app.listen(process.env.VIDEOS_SERVER_PORT, process.env.VIDEOS_SERVER_IP, () => {
  console.log(
    "Servidor de videos está executando em => " + process.env.VIDEOS_SERVER_PORT
  );
});
