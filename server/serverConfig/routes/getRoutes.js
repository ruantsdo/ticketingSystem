const express = require("express");
const router = express.Router();
const db = require("../dbConnection");
const fs = require("fs");
const path = require("path");

const { getTables } = require("../backups");

const videosFolder = "./videos";

router.get("/token/query", (req, res) => {
  db.query("SELECT * FROM tokens", (err, result) => {
    if (err) {
      console.error("Erro na consulta dos tokens:", err);
      res.status(500).send({ msg: "Falha na consulta dos tokens!" });
    } else {
      res.send(result);
    }
  });
});

router.get("/token/query/byId/:id", (req, res) => {
  const tokenId = req.params.id;

  db.query("SELECT * FROM tokens WHERE id = ?", [tokenId], (err, result) => {
    if (err) {
      console.error("Erro na consulta do token por ID:", err);
      res.status(500).send({ msg: "Falha na consulta do token por ID!" });
    } else {
      res.send(result);
    }
  });
});

router.get("/token/query/:id", (req, res) => {
  const serviceId = req.params.id;

  db.query(
    "SELECT * FROM tokens WHERE service = ?",
    [serviceId],
    (err, result) => {
      if (err) {
        console.error("Erro na consulta dos tokens por serviço:", err);
        res
          .status(500)
          .send({ msg: "Falha na consulta dos tokens por serviço!" });
      } else {
        res.send(result);
      }
    }
  );
});

router.get("/location/query", (req, res) => {
  db.query("SELECT * FROM locations", (err, result) => {
    if (err) {
      console.error("Erro na consulta de locais:", err);
      res.status(500).send({ msg: "Falha na consulta de locais!" });
    } else {
      res.send(result);
    }
  });
});

router.get("/services/query", (req, res) => {
  db.query("SELECT * FROM services", (err, result) => {
    if (err) {
      console.error("Erro na consulta de serviços:", err);
      res.status(500).send({ msg: "Falha na consulta de serviços!" });
    } else {
      res.send(result);
    }
  });
});

router.get("/services/query/:id", (req, res) => {
  const serviceId = req.params.id;

  db.query(
    "SELECT * FROM services WHERE id = ?",
    [serviceId],
    (err, result) => {
      if (err) {
        console.error("Erro na consulta de serviços por ID:", err);
        res.status(500).send({ msg: "Falha na consulta de serviços por ID!" });
      } else {
        res.send(result);
      }
    }
  );
});

router.get("/user_services/query/full", (req, res) => {
  db.query("SELECT * FROM user_services", (err, result) => {
    if (err) {
      console.error(
        "Erro na consulta de serviços de usuários (user_services):",
        err
      );
      res.status(500).send({
        msg: "Falha na consulta de serviços de usuários (user_services)!",
      });
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

router.get("/users/query/full", async (req, res) => {
  db.query("SELECT * FROM users", (err, result) => {
    if (err) {
      console.error("Erro na consulta de usuários:", err);
      res.status(500).send("Erro interno do servidor");
    } else {
      res.send(result);
    }
  });
});

router.get("/permissionsLevels", (req, res) => {
  db.query("SELECT * FROM permission_levels", (err, result) => {
    if (err) {
      console.error("Erro na consulta dos níveis de permissão:", err);
      res.status(500).send("Erro interno do servidor");
    } else {
      res.send(result);
    }
  });
});

router.get("/queue", (req, res) => {
  db.query("SELECT * FROM queue", (err, result) => {
    if (err) {
      console.error("Erro na consulta da fila (queue):", err);
      res.status(500).json({ error: "Erro ao buscar dados do banco de dados" });
    } else {
      res.send(result);
    }
  });
});

router.get("/usersLevel/:cpf", (req, res) => {
  const cpf = req.params.cpf;

  db.query(
    "SELECT permission_level FROM users WHERE cpf = ?",
    [cpf],
    (err, result) => {
      if (err) {
        console.error("Erro na consulta do nível de permissão por CPF:", err);
        res.status(500).send("Erro interno do servidor");
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

    const videoFiles = files.filter((file) => {
      const extname = path.extname(file).toLowerCase();
      return [".mp4", "webm"].includes(extname);
    });

    res.json({ videos: videoFiles });
  });
});

router.get("/checkBackups", async (req, res) => {
  const result = await getTables();

  res.send(result);
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
      console.log("Falha ao obter hitórico de senhas!");
      res
        .status(500)
        .send("Falha ao obter histórico de senhas no banco de dados!");
      return;
    }

    res.send(result);
  });
});

module.exports = router;
