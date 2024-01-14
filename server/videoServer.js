const express = require("express");
const app = express();

const {
  VIDEOS_SERVER_PORT,
  VIDEOS_SERVER_IP,
} = require("./serverConfig/variables");

const videoDirectory = "./videos";

app.use(express.static(videoDirectory));

app.listen(VIDEOS_SERVER_PORT, VIDEOS_SERVER_IP, () => {
  console.log("Servidor de videos está executando em => " + VIDEOS_SERVER_PORT);
});
