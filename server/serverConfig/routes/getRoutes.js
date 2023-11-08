const express = require("express");
const router = express.Router();
const db = require("../dbConnection");
const fs = require("fs");

const videosFolder = "../client/src/assets/videos";

router.get("/token/query", async (req, res) => {
  try {
    await db.query("SELECT * FROM tokens", (err, result) => {
      res.send(result);
    });
  } catch (err) {
    res.send({ msg: "Falha da consulta dos tokens!" });
  }
});

router.get("/sectors/query", async (req, res) => {
  try {
    await db.query("SELECT * FROM sectors", (err, result) => {
      res.send(result);
    });
  } catch (error) {
    console.log(error);
  }
});

router.get("/services/query", async (req, res) => {
  try {
    await db.query("SELECT * FROM services", (err, result) => {
      res.send(result);
    });
  } catch (error) {
    console.log(error);
  }
});

router.get("/permissionsLevels", async (req, res) => {
  try {
    await db.query("SELECT * FROM permission_levels", (err, result) => {
      res.send(result);
    });
  } catch (error) {
    console.log(error);
  }
});

router.get("/queue", async (req, res) => {
  try {
    await db.query("SELECT * FROM queue", (err, result) => {
      res.send(result);
    });
  } catch (error) {
    console.error("Erro ao buscar dados do banco de dados:", error);
    res.status(500).json({ error: "Erro ao buscar dados do banco de dados" });
  }
});

router.get("/usersLevel/:cpf", (req, res) => {
  db.query(
    "SELECT permission_level FROM users WHERE cpf = ?",
    [req.params.cpf],
    (err, result) => {
      if (err) {
        res.status(500).send(err);
        return;
      }

      if (result.length > 0) {
        const permissionLevel = result[0].permission_level;
        res.send({ permissionLevel });
      } else {
        res.status(404).send("CPF não encontrado");
      }
    }
  );
});

router.get("/videoList", (req, res) => {
  fs.readdir(videosFolder, (err, files) => {
    if (err) {
      console.error("Erro ao ler a pasta:", err);
      res.status(500).json({ error: "Erro ao listar vídeos" });
      return;
    }
    res.json({ videos: files });
  });
});

module.exports = router;
