const express = require("express");
const router = express.Router();
const db = require("../dbConnection");
const bcrypt = require("bcrypt");
const saltRounds = 10;

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
              res.send(response);
              return;
            }
            res.send({ msg: "Senha incorreta!" });
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
        return res.send("Falied to check users");
      }

      if (result.length > 0) {
        return res.send("User already exists");
      } else {
        //If it does not exist, start the registration procedure
        const hash = await bcrypt.hash(req.body.password, saltRounds);
        let emailValue = req.body.email !== undefined ? req.body.email : "";

        try {
          await db.query(
            "INSERT INTO users (name, password, cpf, email, permission_level, created_at, created_by) VALUES (?,?,?,?,?,?,?)",
            [
              req.body.name,
              hash,
              req.body.cpf,
              emailValue,
              req.body.permissionLevel,
              getTime(),
              req.body.created_by,
            ]
          );
        } catch (error) {
          res.send("Falied to create new user in database");
        } //Try to insert a new user into the database

        try {
          await db.query(
            "SELECT * FROM users WHERE cpf = ?",
            [req.body.cpf],
            (err, result) => {
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
      } //End of insertion attempt
    }
  );
});

router.post("/token/registration", async (req, res) => {
  try {
    const service = req.body.services;
    const priority = req.body.priority;
    const created_by = req.body.created;
    const requested_by = req.body.requested_by;

    const query = `
        INSERT INTO tokens (position, service, priority, created_by, requested_by, created_at)
        SELECT COALESCE(MAX(position) + 1, 1), ?, ?, ?, ?, ?
        FROM tokens
        WHERE service = ?
      `;

    await db.query(query, [
      service,
      priority,
      created_by,
      requested_by,
      getTime(),
      service,
    ]);

    res.send("success");
  } catch (err) {
    res.send("failed");
  }
});

router.post("/token/update", async (req, res) => {
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
      "INSERT INTO locations (name, description, tables, created_by) VALUES (?,?,?,?)",
      [
        req.body.name,
        req.body.description,
        req.body.tables,
        req.body.created_by,
      ]
    );
    res.send("success");
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
      "UPDATE locations SET name = ?, description = ?, tables = ?, created_by = ? WHERE id = ?",
      [
        req.body.name,
        req.body.description,
        req.body.tables,
        req.body.created_by,
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
      "INSERT INTO services (name, description, `limit`, created_by) VALUES (?,?,?,?)",
      [req.body.name, req.body.description, req.body.limit, req.body.created_by]
    );
    res.send("success");
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
      "UPDATE services SET name = ?, description = ?, `limit` = ?, created_by = ? WHERE id = ?",
      [
        req.body.name,
        req.body.desc,
        req.body.limit,
        req.body.created_by,
        req.body.id,
      ]
    );
    res.send("success");
  } catch (err) {
    res.send("failed");
  }
});

module.exports = router;

async function insertSelectedServices(id, services) {
  try {
    await services.map(async (service) => {
      await db.query(
        "INSERT INTO user_services (user_id, service_id) VALUES (?, ?)",
        [id, service]
      );
    });
    return "New user created";
  } catch (error) {
    return "Failed to link services";
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

  return formattedDate;
}
