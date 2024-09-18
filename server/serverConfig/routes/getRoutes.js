const express = require("express");
const router = express.Router();
const { getPoolReference } = require("../dbConnection");
const fs = require("fs");
const path = require("path");
const { exec } = require("child_process");

const { createBackup, getTables } = require("../backups");
const { cleanName, ensureDirectoryExistence } = require("../../utils/videos");
const { midNightSignal, disconnectAllUsers } = require("../socketUtils");
const {
  DATABASE_USER,
  DATABASE_PASSWORD,
  DATABASE_NAME,
} = require("../variables");

let db = getPoolReference();

const videosFolder = "./videos";
const thumbsFolder = "./videoThumbs";
const backupFolder = "./backups";
const databaseStructurePath = "./databaseStructure/createDatabaseStructure.sql";

router.get("/token/query", async (req, res) => {
  try {
    await db.query("SELECT * FROM tokens", (err, result) => {
      res.send(result);
    });
  } catch (err) {
    res.send({ msg: "Falha da consulta dos tokens!" });
  }
});

router.post("/token/query/by_services_list", async (req, res) => {
  try {
    const services = req.body.userServices;
    const inClause = `(${services.join(",")})`;

    await db.query(
      `SELECT * FROM tokens WHERE service IN ${inClause}`,
      (err, result) => {
        res.send(result);
      }
    );
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

router.get("/location/query/actives", async (req, res) => {
  try {
    await db.query(
      "SELECT * FROM locations WHERE status = 1",
      (err, result) => {
        res.send(result);
      }
    );
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

router.get("/services/query/actives", async (req, res) => {
  try {
    await db.query(
      "SELECT * FROM services WHERE status = 1 ORDER BY name ASC",
      (err, result) => {
        res.send(result);
      }
    );
  } catch (error) {
    console.log(error);
  }
});

router.post("/services/query/name", async (req, res) => {
  const { name, id } = req.body;
  try {
    if (id !== null) {
      await db.query(
        "SELECT * FROM services WHERE name = ? AND id != ?",
        [name, id],
        (err, result) => {
          res.send(result);
        }
      );
    } else {
      await db.query(
        "SELECT * FROM services WHERE name = ?",
        [name],
        (err, result) => {
          res.send(result);
        }
      );
    }
  } catch (error) {
    console.error(error);
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

router.get("/thumbnail/:videoName", (req, res) => {
  const videoName = req.params.videoName;
  const cleanVideoName = cleanName(videoName);
  const thumbnailPath = path.join(thumbsFolder, `${cleanVideoName}-Thumb.png`);

  fs.access(thumbnailPath, fs.constants.F_OK, (err) => {
    if (err) {
      res.status(404).json({ error: "Thumbnail não encontrada" });
    } else {
      res.sendFile(path.resolve(thumbnailPath));
    }
  });
});

router.get("/verifySettings", (req, res) => {
  db.query(
    "SELECT autoAprove, forceDailyLogin, registerForm, canLogin, defaultVolume, minimum_delay, deficiency_delay from settings WHERE id = 1",
    (err, result) => {
      if (err) {
        res.status(500).send("Falha ao obter configurações atuais!");
        return;
      }

      res.send(result[0]);
    }
  );
});

router.get("/backup/:tableName", (req, res) => {
  const tableName = req.params.tableName;
  const backupFile = path.join(backupFolder, `${tableName}_backup.sql`);

  ensureDirectoryExistence(backupFolder);

  let dumpCommand;

  if (tableName === "users") {
    dumpCommand = `mysqldump -u ${DATABASE_USER} -p${DATABASE_PASSWORD} ${DATABASE_NAME} ${tableName} user_services > ${backupFile}`;
  } else {
    dumpCommand = `mysqldump -u ${DATABASE_USER} -p${DATABASE_PASSWORD} ${DATABASE_NAME} ${tableName} > ${backupFile}`;
  }

  exec(dumpCommand, (error, stdout, stderr) => {
    if (error) {
      console.error(`Erro ao criar backup: ${error.message}`);
      return res.status(500).json({ error: "Erro ao criar backup" });
    }
    if (
      stderr &&
      !stderr.includes(
        "Using a password on the command line interface can be insecure."
      )
    ) {
      console.error(`Erro: ${stderr}`);
      return res.status(500).json({ error: stderr });
    }

    res.download(backupFile, `${tableName}_backup.sql`, (err) => {
      if (err) {
        console.error("Erro ao enviar o arquivo:", err);
        return res.status(500).json({ error: "Erro ao enviar o arquivo" });
      }

      fs.unlink(backupFile, (err) => {
        if (err) {
          console.error("Erro ao apagar o arquivo de backup:", err);
        }
      });
    });
  });
});

router.get("/clearTable/:tableName", async (req, res) => {
  const tableName = req.params.tableName;

  let command;
  let secondCommand;

  if (tableName === "users" || tableName === "services") {
    if (tableName === "users") {
      command = `DELETE FROM ${tableName} WHERE id != ?`;
    } else {
      command = `DELETE FROM ${tableName}`;
    }
    secondCommand = `DELETE FROM user_services`;
  } else {
    command = `TRUNCATE TABLE ${tableName}`;
  }

  try {
    await new Promise((resolve, reject) => {
      db.query("SET FOREIGN_KEY_CHECKS=0", (err) => {
        if (err) {
          return reject(err);
        }
        resolve();
      });
    });

    if (tableName === "users" || tableName === "services") {
      await new Promise((resolve, reject) => {
        db.query(secondCommand, (err) => {
          if (err) {
            return reject(err);
          }
          resolve();
        });
      });

      await new Promise((resolve, reject) => {
        db.query(command, [1], (err) => {
          if (err) {
            return reject(err);
          }
          resolve();
        });
      });

      res
        .status(200)
        .send("Tabela users e dependente user_services limpas com sucesso!");
    } else {
      await new Promise((resolve, reject) => {
        db.query(command, (err) => {
          if (err) {
            return reject(err);
          }
          resolve();
        });
      });

      res.status(200).send(`Tabela ${tableName} limpa com sucesso!`);
    }

    await new Promise((resolve, reject) => {
      db.query("SET FOREIGN_KEY_CHECKS=1", (err) => {
        if (err) {
          return reject(err);
        }
        resolve();
      });
    });
  } catch (err) {
    console.error("Erro ao limpar tabela:", err);
    res.status(500).send("Falha ao limpar tabela!");
  }
});

router.get("/backupCurrentTokens", async (req, res) => {
  try {
    await createBackup();
    await midNightSignal();
    res.status(200).send("Backup concluído!");
  } catch (err) {
    console.error("Erro na criação do backup:", err);
    res.status(500).send("Falha criar backup.");
  }
});

router.get("/restoreDatabase", (req, res) => {
  const restoreCommand = `mysql -u ${DATABASE_USER} -p${DATABASE_PASSWORD} ${DATABASE_NAME} < ${databaseStructurePath}`;

  if (!fs.existsSync(databaseStructurePath)) {
    console.error(`Arquivo de backup não encontrado: ${databaseStructurePath}`);
    return res.status(404).json({ error: "Arquivo de backup não encontrado" });
  }

  exec(restoreCommand, (error, stdout, stderr) => {
    if (error) {
      console.error(`Erro ao restaurar backup: ${error.message}`);
      return res.status(500).json({ error: "Erro ao restaurar backup" });
    }

    if (
      stderr &&
      !stderr.includes(
        "Using a password on the command line interface can be insecure."
      )
    ) {
      console.error(`Erro: ${stderr}`);
      return res.status(500).json({ error: stderr });
    }

    disconnectAllUsers();
    res.status(200).json({ message: "Restaurado com sucesso" });
  });
});

module.exports = router;
