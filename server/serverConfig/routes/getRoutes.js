const express = require("express");
const router = express.Router();
const db = require("../dbConnection");
const fs = require("fs");

const { getTables } = require("../backups");

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

router.get("/token/query/byId/:id", async (req, res) => {
  try {
    await db.query(
      "SELECT * FROM tokens WHERE id = ?",
      [req.params.id],
      (err, result) => {
        res.send(result);
      }
    );
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

router.post("/location/query/name", async (req, res) => {
  const { name, id } = req.body;
  const query =
    id !== undefined
      ? "SELECT * FROM locations WHERE name = ? AND id != ?"
      : "SELECT * FROM locations WHERE name = ?";
  try {
    await db.query(query, [name, id], (err, result) => {
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

router.get("/user_services/query/full", async (req, res) => {
  try {
    await db.query("SELECT * FROM user_services", (err, result) => {
      res.send(result);
    });
  } catch (error) {
    console.log(error);
  }
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

router.get("/users/query/full", async (req, res) => {
  try {
    await db.query("SELECT * FROM users", (err, result) => {
      if (err) {
        console.error(err);
        res.status(500).send("Erro interno do servidor");
      } else {
        res.send(result);
      }
    });
  } catch (error) {
    console.log(error);
    res.status(500).send("Erro interno do servidor");
  }
});

router.get("/users/query/cpf/:cpf", async (req, res) => {
  try {
    await db.query(
      "SELECT * FROM users WHERE cpf = ?",
      [req.params.cpf],
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

router.get("/users/query/email/:email", async (req, res) => {
  try {
    await db.query(
      "SELECT * FROM users WHERE email = ?",
      [req.params.email],
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

router.get("/checkBackups", async (req, res) => {
  const result = await getTables();

  res.send(result);
});

router.get("/getBackupData/:table", async (req, res) => {
  const tableName = req.params.table;

  db.query("SELECT * FROM ??", [tableName], (err, result) => {
    if (err) {
      res.status(500).send(err);
      return;
    }

    if (result.length > 0) {
      res.send(result);
    } else {
      res.status(404).send("Tabela não encontrada");
    }
  });
});

router.get("/getBackupData/:table", (req, res) => {
  const tableName = req.params.table;

  db.query("SELECT * FROM ??", [tableName], (err, result) => {
    if (err) {
      console.error("Erro na consulta de dados de backup:", err);
      res.status(500).send("Erro interno do servidor");
      return;
    }

    if (result.length > 0) {
      res.send(result);
    } else {
      res.status(404).send("Tabela não encontrada");
    }
  });
});

router.get("/getHistoric", (req, res) => {
  db.query("SELECT * from historic", (err, result) => {
    if (err) {
      console.log("Falha ao obter histórico de senhas!");
      res
        .status(500)
        .send("Falha ao obter histórico de senhas no banco de dados!");
      return;
    }

    res.send(result);
  });
});

module.exports = router;
