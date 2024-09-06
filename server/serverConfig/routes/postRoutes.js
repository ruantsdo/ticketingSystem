const express = require("express");
const router = express.Router();
const { getPoolReference } = require("../dbConnection");
const { exec } = require("child_process");
const bcrypt = require("bcrypt");
const saltRounds = 10;

const multer = require("multer");
const path = require("path");
const fs = require("fs");

const { cleanName, generateThumbnail } = require("../../utils/videos");
const { ensureDirectoryExistence } = require("../../utils/videos");
const {
  DATABASE_USER,
  DATABASE_PASSWORD,
  DATABASE_NAME,
} = require("../variables");

let db = getPoolReference();
const videosFolder = "./videos";
const thumbsFolder = "./videoThumbs";
const tempFolder = "./temp";

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, videosFolder);
  },
  filename: (req, file, cb) => {
    cb(null, Buffer.from(file.originalname, "latin1").toString("utf8"));
  },
});

const upload = multer({ storage });
const tempUpload = multer({ dest: tempFolder });

router.post("/login", (req, res) => {
  db.query(
    "SELECT * FROM users WHERE cpf = ?",
    [req.body.cpf],
    (error, response) => {
      if (error) {
        res.send(error);
      }

      if (response.length > 0) {
        bcrypt.compare(
          req.body.password,
          response[0].password,
          (error, result) => {
            if (result) {
              if (response[0].status === 0 && !response[0].updated_at) {
                res.send({ msg: "Esse usuário ainda não foi validado!" });
                return;
              }
              if (response[0].status === 0 && response[0].updated_at !== "") {
                res.send({ msg: "Esse usuário está desativado!" });
                return;
              }
              res.send(response);
              return;
            }
            res.send({
              msg: "Verifique suas credenciais e tente novamente!",
            });
          }
        );
      } else {
        res.send({ msg: "Usuário não encontrado!" });
      }
    }
  );
});

router.post("/user/check", (req, res) => {
  db.query(
    "SELECT * FROM users WHERE cpf = ?",
    [req.body.cpf],
    (error, response) => {
      if (error) {
        res.send(error);
        return;
      }

      if (response.length > 0) {
        const isValid = req.body.password === response[0].password;

        if (isValid) {
          res.send("valid");
        } else {
          res.send("expired");
        }
      } else {
        res.send("invalid");
      }
    }
  );
});

router.post("/user/registration", async (req, res) => {
  db.query(
    //Checks if the user already exists
    "SELECT cpf FROM users WHERE cpf = ?",
    [req.body.cpf],
    async (err, result) => {
      if (err) {
        return res.send("Failed to check users");
      }

      if (result.length > 0) {
        return res.send("User already exists");
      } else {
        //If it does not exist, start the registration procedure
        const hash = await bcrypt.hash(req.body.password, saltRounds);
        let emailValue = req.body.email !== undefined ? req.body.email : "";

        try {
          await db.query(
            "INSERT INTO users (name, password, cpf, email, permission_level, created_at, created_by, status) VALUES (?,?,?,?,?,?,?,?)",
            [
              req.body.name,
              hash,
              req.body.cpf,
              emailValue,
              req.body.permissionLevel,
              getTime(),
              req.body.created_by,
              req.body.status,
            ]
          );
        } catch (error) {
          res.send("Falied to create new user in database");
        } finally {
          setTimeout(async () => {
            try {
              await db.query(
                "SELECT id FROM users WHERE cpf = ?",
                [req.body.cpf],
                (err, result) => {
                  if (err) {
                    console.log(
                      "Falha ao inserir os serviços para este usuário!"
                    );
                    console.log(err);
                    return;
                  }

                  insertSelectedServices(result[0].id, req.body.services).then(
                    (response) => {
                      res.send(response);
                    }
                  );
                }
              );
            } catch (error) {
              res.send("Failed to link user to services");
              await db.query("DELETE FROM users WHERE cpf = ?", [req.body.cpf]);
            } //Attempts to link the user to the services, and if it fails, removes the user from the database
          }, 500);
        }
      } //End of insertion attempt
    }
  );
});

router.post("/users/update", async (req, res) => {
  const {
    id,
    name,
    email,
    cpf,
    level,
    updated_by,
    password,
    passwordChanged,
    services,
    status,
  } = req.body;

  let hash;

  if (passwordChanged) {
    hash = await bcrypt.hash(password, saltRounds);
  } else {
    hash = password;
  }

  try {
    await db.query(
      "SELECT cpf FROM users WHERE cpf = ? AND id != ?",
      [cpf, id],
      async (err, result) => {
        if (err) {
          return res.send("Failed to check users");
        }

        if (result.length > 0) {
          return res.send("User already exists");
        } else {
          await db.query(
            "UPDATE users SET name = ?, email = ?, status = ?, cpf = ?, permission_level = ?, updated_by = ?, updated_at = ?, password = ? WHERE id = ?",
            [name, email, status, cpf, level, updated_by, getTime(), hash, id]
          );

          const response = await UpdateSelectedServices(id, services);

          if (response) {
            res.send("success");
          } else {
            res.send("failed");
          }
        }
      }
    );
  } catch (err) {
    res.send("failed");
  }
});

router.post("/users/remove", async (req, res) => {
  if (req.body.id === 1) {
    res.send("failed");
    return;
  }

  try {
    await db.query("DELETE FROM user_services WHERE user_id = ?", [
      req.body.id,
    ]);
    await db.query("DELETE FROM users WHERE id = ?", [req.body.id]);
    res.send("success");
  } catch (err) {
    res.send("failed");
  }
});

router.post("/token/registration", async (req, res) => {
  try {
    const service = req.body.service;
    const priority = req.body.priority;
    const created_by = req.body.created;
    const requested_by = req.body.requested_by;
    const description = req.body.description;
    const visual_impairment = req.body.visual_impairment;
    const motor_disability = req.body.motor_disability;
    const hearing_impairment = req.body.hearing_impairment;
    const cognitive_impairment = req.body.cognitive_impairment;

    const insertQuery = `
      INSERT INTO tokens (position, service, priority, created_by, requested_by, created_at, description, visual_impairment, motor_disability, hearing_impairment, cognitive_impairment)
      SELECT COALESCE(MAX(position) + 1, 1), ?, ?, ?, ?, ?, ?, ?, ?, ?, ?
      FROM tokens
      WHERE service = ?
    `;

    await db.query(
      insertQuery,
      [
        service,
        priority,
        created_by,
        requested_by,
        getTime(),
        description,
        visual_impairment,
        motor_disability,
        hearing_impairment,
        cognitive_impairment,
        service,
      ],
      async (err, result) => {
        if (result) {
          const insertedId = result.insertId;

          const selectQuery = "SELECT * FROM tokens WHERE id = ?";

          await db.query(selectQuery, [insertedId], (err, result) => {
            if (result) {
              res.status(200).json({
                message: "success",
                tokenData: result[0],
              });
            } else {
              res.status(500).json({
                message: "failed",
                error: err,
              });
            }
          });
        } else {
          res.status(500).json({
            message: "failed",
            error: err,
          });
        }
      }
    );
  } catch (err) {
    res.status(500).json({
      message: "failed",
      error: err.message,
    });
  }
});

router.post("/token/update/", async (req, res) => {
  const { called_by, id } = req.body;
  try {
    await db.query(
      "UPDATE tokens SET called_by = ?, called_at = ? WHERE id = ?",
      [called_by, getTime(), id]
    );

    res.send({ status: 200 });
  } catch (err) {
    res.send({ msg: "Falha ao atualizar ficha!" });
  }
});

router.post("/token/update/status", async (req, res) => {
  try {
    if (req.body.status === "ADIADO") {
      await db.query(
        "UPDATE tokens SET status = ?, delayed_at = ?, delayed_by = ? WHERE id = ?",
        [req.body.status, getTime(), req.body.delayed_by, req.body.id]
      );
    } else {
      await db.query("UPDATE tokens SET status = ? WHERE id = ?", [
        req.body.status,
        req.body.id,
      ]);
    }

    res.send({ msg: "Ficha cadastrada com sucesso!" });
  } catch (err) {
    res.send({ msg: "Falha no cadastramento da ficha!" });
  }
});

router.post("/token/close", async (req, res) => {
  try {
    await db.query(
      "UPDATE tokens SET status = ?, solved_by = ?, solved_at = ? WHERE id = ?",
      [req.body.status, req.body.solved_by, getTime(), req.body.id]
    );

    res.send({ msg: "Ficha cadastrada com sucesso!" });
  } catch (err) {
    res.send({ msg: "Falha no cadastramento da ficha!" });
  }
});

router.post("/token/remove/byId/:id", async (req, res) => {
  try {
    await db.query("DELETE FROM queue WHERE token_id = ?", [req.params.id]);
    await db.query("DELETE FROM tokens WHERE id = ?", [req.params.id]);
    res.send("success");
  } catch (err) {
    res.send({ msg: "Falha da consulta dos tokens!" });
  }
});

router.post("/queue/registration", async (req, res) => {
  try {
    await db.query(
      "INSERT INTO queue (token_id, position, service, priority, requested_by, `table`, location) VALUES (?,?,?,?,?,?,?)",
      [
        req.body.token_id,
        req.body.position,
        req.body.service,
        req.body.priority,
        req.body.requested_by,
        req.body.table,
        req.body.location,
      ]
    );
    res.send("success");
  } catch (err) {
    res.send("failed");
  }
});

router.post("/queue/remove", async (req, res) => {
  try {
    await db.query("DELETE FROM queue WHERE token_id = ?", [req.body.token_id]);
    res.send("success");
  } catch (err) {
    res.send("failed");
  }
});

router.post("/location/registration", async (req, res) => {
  try {
    await db.query(
      "SELECT * FROM locations WHERE name = ?",
      [req.body.name],
      (err, result) => {
        if (result.length > 0) {
          res.send("already exists");
        } else {
          db.query(
            "INSERT INTO locations (name, description, tables, created_by, created_at) VALUES (?,?,?,?,?)",
            [
              req.body.name,
              req.body.description,
              req.body.tables,
              req.body.created_by,
              getTime(),
            ]
          );
          res.send("success");
        }
      }
    );
  } catch (err) {
    res.send("failed");
  }
});

router.post("/location/remove", async (req, res) => {
  try {
    await db.query("DELETE FROM locations WHERE id = ?", [req.body.id]);
    res.send("success");
  } catch (err) {
    res.send("failed");
  }
});

router.post("/location/update", async (req, res) => {
  try {
    await db.query(
      "UPDATE locations SET name = ?, description = ?, tables = ?, updated_by = ?, updated_at = ?, status = ?  WHERE id = ?",
      [
        req.body.name,
        req.body.description,
        req.body.tables,
        req.body.updated_by,
        getTime(),
        req.body.status,
        req.body.id,
      ]
    );
    res.send("success");
  } catch (err) {
    res.send("failed");
  }
});

router.post("/service/registration", async (req, res) => {
  try {
    await db.query(
      "SELECT * FROM services WHERE name = ?",
      [req.body.name],
      (err, result) => {
        if (result.length > 0) {
          res.send("already exists");
        } else {
          db.query(
            "INSERT INTO services (name, description, `limit`, created_by, created_at) VALUES (?,?,?,?,?)",
            [
              req.body.name,
              req.body.description,
              req.body.limit,
              req.body.created_by,
              getTime(),
            ]
          );
          res.send("success");
        }
      }
    );
  } catch (err) {
    res.send("failed");
  }
});

router.post("/service/remove", async (req, res) => {
  try {
    await db.query("DELETE FROM services WHERE id = ?", [req.body.id]);
    res.send("success");
  } catch (err) {
    res.send("failed");
  }
});

router.post("/service/update", async (req, res) => {
  try {
    await db.query(
      "UPDATE services SET name = ?, description = ?, `limit` = ?, status = ?, updated_by = ?, updated_at = ? WHERE id = ?",
      [
        req.body.name,
        req.body.desc,
        req.body.limit,
        req.body.status,
        req.body.updated_by,
        getTime(),
        req.body.id,
      ]
    );
    res.send("success");
  } catch (err) {
    res.send("failed");
  }
});

router.post("/uploadVideo", upload.single("video"), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "Nenhum arquivo enviado" });
  }

  ensureDirectoryExistence(videosFolder);

  const fileName = req.body.fileName;
  await generateThumbnail(fileName);

  res.status(200).json({ message: "Upload bem-sucedido", file: req.file });
});

router.delete("/deleteVideo/:videoName", (req, res) => {
  const videoName = req.params.videoName;
  const videoPath = path.join(videosFolder, videoName);
  const cleanVideoName = cleanName(videoName);
  const thumbnailPath = path.join(thumbsFolder, `${cleanVideoName}-Thumb.png`);

  fs.access(videoPath, fs.constants.F_OK, (err) => {
    if (err) {
      return res.status(404).json({ error: "Arquivo de vídeo não encontrado" });
    }

    fs.unlink(videoPath, (err) => {
      if (err) {
        return res
          .status(500)
          .json({ error: "Erro ao apagar o arquivo de vídeo" });
      }

      fs.access(thumbnailPath, fs.constants.F_OK, (err) => {
        if (!err) {
          fs.unlink(thumbnailPath, (err) => {
            if (err) {
              console.error("Erro ao apagar a thumbnail:", err);
            }
          });
        }
      });

      res.status(200).json({ message: "Arquivo de vídeo apagado com sucesso" });
    });
  });
});

router.post("/settings/update", async (req, res) => {
  const { autoAprove, forceDailyLogin, registerForm, canLogin, userId } =
    req.body;

  try {
    const isAdmin = await db.query(
      "SELECT permission_level from users WHERE id = ?",
      [userId]
    );

    if (isAdmin < 4) {
      return res.status(403).send("Ação não autorizada!");
    }

    await db.query(
      "UPDATE settings SET autoAprove = ?, forceDailyLogin = ?, registerForm = ?, canLogin = ? WHERE id = 1",
      [autoAprove, forceDailyLogin, registerForm, canLogin]
    );
    res.send("Configurações atualizadas");
  } catch (err) {
    console.error(err);
    res.status(500).send("Erro ao atualizar configurações");
  }
});

router.post("/settings/update/delay", async (req, res) => {
  const { minimumDelay, deficiencyDelay } = req.body;

  try {
    await db.query(
      "UPDATE settings SET minimum_delay = ?, deficiency_delay = ? WHERE id = 1",
      [minimumDelay, deficiencyDelay]
    );
    res.send("Configurações atualizadas");
  } catch (err) {
    console.error(err);
    res.status(500).send("Erro ao atualizar configurações");
  }
});

router.post("/settings/update/defaultVolume", async (req, res) => {
  const { defaultVolume, userId } = req.body;

  try {
    const isAdmin = await db.query(
      "SELECT permission_level from users WHERE id = ?",
      [userId]
    );

    if (isAdmin < 4) {
      return res.status(403).send("Ação não autorizada!");
    }

    await db.query("UPDATE settings SET defaultVolume = ? WHERE id = 1", [
      defaultVolume,
    ]);
    res.send("Configurações atualizadas");
  } catch (err) {
    console.error(err);
    res.status(500).send("Erro ao atualizar configurações");
  }
});

router.post("/restoreBackup", tempUpload.single("backup"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "Nenhum arquivo enviado" });
  }

  ensureDirectoryExistence(tempFolder);

  const backupFile = req.file.path;

  const restoreCommand = `mysql -u ${DATABASE_USER} -p${DATABASE_PASSWORD} ${DATABASE_NAME} < ${backupFile}`;

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

    res.status(200).json({ message: "Restaurado com sucesso" });

    fs.unlink(backupFile, (err) => {
      if (err) {
        console.error("Erro ao apagar o arquivo de backup:", err);
      }
    });
  });
});

module.exports = router;

async function insertSelectedServices(id, services) {
  let connection;

  try {
    connection = await new Promise((resolve, reject) => {
      db.getConnection((err, conn) => {
        if (err) {
          reject(err);
        } else {
          resolve(conn);
        }
      });
    });

    await new Promise((resolve, reject) => {
      connection.beginTransaction((err) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });

    for (const service of services) {
      await db.query(
        "INSERT INTO user_services (user_id, service_id) VALUES (?, ?)",
        [id, service]
      );
    }

    await new Promise((resolve, reject) => {
      connection.commit((err) => {
        if (err) {
          connection.rollback(() => {
            reject(err);
          });
        } else {
          resolve();
        }
      });
    });

    return "New user created";
  } catch (error) {
    console.error(error);
    await new Promise((resolve) => connection.rollback(() => resolve()));
    return "Failed to link services";
  } finally {
    if (connection) {
      connection.release();
    }
  }
}

async function UpdateSelectedServices(id, services) {
  let connection;

  try {
    connection = await new Promise((resolve, reject) => {
      db.getConnection((err, conn) => {
        if (err) {
          reject(err);
        } else {
          resolve(conn);
        }
      });
    });

    await new Promise((resolve, reject) => {
      connection.beginTransaction((err) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });

    await db.query("DELETE FROM user_services WHERE user_id = ?", [id]);

    for (const service of services) {
      await db.query(
        "INSERT INTO user_services (user_id, service_id) VALUES (?, ?)",
        [id, service]
      );
    }

    await new Promise((resolve, reject) => {
      connection.commit((err) => {
        if (err) {
          // Reverte a transação em caso de erro no commit
          connection.rollback(() => {
            reject(err);
          });
        } else {
          resolve();
        }
      });
    });

    return true;
  } catch (error) {
    console.error(error);
    await new Promise((resolve) => connection.rollback(() => resolve()));
    return false;
  } finally {
    if (connection) {
      connection.release();
    }
  }
}

function getTime() {
  const currentDate = new Date();
  const timeZone = "America/Sao_Paulo";

  const formattedDate = currentDate.toLocaleString("pt-BR", {
    timeZone: timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });

  const date = formattedDate.replace(",", " às");

  return date;
}
