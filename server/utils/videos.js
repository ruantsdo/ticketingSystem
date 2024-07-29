const ffmpeg = require("fluent-ffmpeg");
const path = require("path");
const fs = require("fs");

const VIDEO_DIR = "./videos";
const THUMB_DIR = "./videoThumbs";
const THUMB_WIDTH = 1024;
const THUMB_HEIGHT = 1024;

function cleanName(name) {
  const partes = name.split(".");
  if (partes.length > 1) {
    return partes.slice(0, -1).join(".");
  } else {
    return name;
  }
}

function ensureDirectoryExistence(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

function generateThumbnail(videoName) {
  return new Promise((resolve, reject) => {
    const videoPath = path.join(__dirname, "../videos", videoName);
    const imagePath = path.join(
      __dirname,
      "../videoThumbs",
      `${cleanName(videoName)}-Thumb.png`
    );
    const width = 1024;
    const height = 1024;

    if (!fs.existsSync(videoPath)) {
      return reject(new Error("Arquivo de vídeo não encontrado"));
    }

    ffmpeg(videoPath)
      .on("end", () => {
        resolve();
      })
      .on("error", (err) => {
        console.error("Error: " + err);
        reject(err);
      })
      .screenshots({
        count: 1,
        folder: path.dirname(imagePath),
        filename: path.basename(imagePath),
        size: `${width}x${height}`,
      });
  });
}

module.exports = {
  generateThumbnail,
  cleanName,
};
