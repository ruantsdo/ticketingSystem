const express = require("express");
const router = express.Router();
const db = require("../dbConnection");
const fs = require("fs");

const videosFolder = "./videos";

router.get("/token/query", async (req, res) => {
  try {
    await db.query("SELECT * FROM tokens", (err, result) => {
      res.send(result);
    });
  } catch (err) {
    res.send({ msg: "Falha da consulta dos tokens!" });
  }
});

router.get("/token/query/:id", async (req, res) => {
  try {
    await db.query(
      "SELECT * FROM tokens WHERE service = ?",
      [req.params.id],
      (err, result) => {
        res.send(result);
      }
    );
  } catch (err) {
    res.send({ msg: "Falha da consulta dos tokens!" });
  }
});

router.get("/location/query", async (req, res) => {
  try {
    await db.query("SELECT * FROM locations", (err, result) => {
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

router.get("/services/query/:id", async (req, res) => {
  try {
    await db.query(
      "SELECT * FROM services WHERE id = ?",
      [req.params.id],
      (err, result) => {
        res.send(result);
      }
    );
  } catch (error) {
    console.log(error);
  }
});

router.post("/users/query/", async (req, res) => {
  try {
    const { ids } = req.body;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).send("IDs inválidos");
    }

    const userServicesQuery = `SELECT user_id FROM user_services WHERE service_id IN (${ids
      .map(() => "?")
      .join(", ")})`;

    await db.query(userServicesQuery, ids, async (err, userServicesResult) => {
      if (err) {
        console.error(err);
        return res.status(500).send("Erro interno do servidor");
      }

      const userIds = userServicesResult.map((row) => row.user_id);

      if (userIds.length === 0) {
        return res.send([]);
      }

      const usersQuery = `SELECT * FROM users WHERE id IN (${userIds
        .map(() => "?")
        .join(", ")})`;

      await db.query(usersQuery, userIds, (usersErr, usersResult) => {
        if (usersErr) {
          console.error(usersErr);
          return res.status(500).send("Erro interno do servidor");
        }

        res.send(usersResult);
      });
    });
  } catch (error) {
    console.log(error);
    res.status(500).send("Erro interno do servidor");
  }
});

router.get("/users/query/full", async (req, res) => {
  await db.query("SELECT * from users", (err, result) => {
    if (err) {
      console.error(err);
      res.status(500).send("Erro interno do servidor");
    } else {
      res.send(result);
    }
  });
});

router.get("/user_services/query/:id", async (req, res) => {
  try {
    await db.query(
      "SELECT service_id FROM user_services WHERE user_id = ?",
      [req.params.id],
      (err, result) => {
        if (err) {
          console.error(err);
          res.status(500).send("Erro interno do servidor");
        } else {
          res.send(result);
        }
      }
    );
  } catch (error) {
    console.log(error);
    res.status(500).send("Erro interno do servidor");
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
