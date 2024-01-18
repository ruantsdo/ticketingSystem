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
        res.status(500).send({ msg: "Erro interno do servidor" });
        return;
      }

      if (response.length > 0) {
        bcrypt.compare(
          req.body.password,
          response[0].password,
          (error, result) => {
            if (error) {
              res.status(500).send({ msg: "Erro interno do servidor" });
              return;
            }

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
        res.status(500).send("Erro interno do servidor");
        return;
      }

      if (response.length > 0) {
        const hashedPassword = response[0].password;

        bcrypt.compare(req.body.password, hashedPassword, (error, isValid) => {
          if (error) {
            res.status(500).send("Erro interno do servidor");
            return;
          }

          if (isValid) {
            res.send("valid");
          } else {
            res.send("expired");
          }
        });
      } else {
        res.send("invalid");
      }
    }
  );
});

router.post("/user/registration", async (req, res) => {
  try {
    const existingUser = await db.query("SELECT cpf FROM users WHERE cpf = ?", [
      req.body.cpf,
    ]);

    if (existingUser.length > 0) {
      return res.send("User already exists");
    }

    const hash = await bcrypt.hash(req.body.password, saltRounds);
    const emailValue = req.body.email || "";

    const userInsertResult = await db.query(
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

    const userId = userInsertResult.insertId;

    const selectedServicesResult = await insertSelectedServices(
      userId,
      req.body.services
    );

    res.send(selectedServicesResult);
  } catch (error) {
    console.error("Error during user registration:", error);
    res.status(500).send("Failed to register new user");
  }
});

router.post("/users/update", async (req, res) => {
  const { id, name, email, cpf, level, updated_by, password, passwordChanged } =
    req.body;

  let hash;

  try {
    if (passwordChanged) {
      hash = await bcrypt.hash(password, saltRounds);
    } else {
      hash = password;
    }

    await db.query(
      "UPDATE users SET name = ?, email = ?, cpf = ?, permission_level = ?, password = ?, updated_at = ?, updated_by = ? WHERE id = ?",
      [name, email, cpf, level, hash, getTime(), updated_by, id]
    );

    res.send("success");
  } catch (err) {
    console.error("Error updating user:", err);
    res.status(500).send("failed");
  }
});

router.post("/users/remove", async (req, res) => {
  const userId = req.body.id;

  try {
    await db.query("DELETE FROM user_services WHERE user_id = ?", [userId]);

    await db.query("DELETE FROM users WHERE id = ?", [userId]);

    res.send("success");
  } catch (err) {
    console.error("Error removing user:", err);
    res.status(500).send("failed");
  }
});

router.post("/token/registration", async (req, res) => {
  try {
    const { services, priority, created, requested_by } = req.body;

    const query = `
        INSERT INTO tokens (position, service, priority, created_by, requested_by, created_at)
        SELECT COALESCE(MAX(position) + 1, 1), ?, ?, ?, ?, ?
        FROM tokens
        WHERE service = ?
      `;

    await db.query(query, [
      services,
      priority,
      created,
      requested_by,
      getTime(),
      services,
    ]);

    res.send("success");
  } catch (err) {
    console.error("Error registering token:", err);
    res.status(500).send("failed");
  }
});

router.post("/token/update", async (req, res) => {
  try {
    let query, params;

    if (req.body.status === "ADIADO") {
      query =
        "UPDATE tokens SET status = ?, delayed_at = ?, delayed_by = ? WHERE id = ?";
      params = [req.body.status, getTime(), req.body.delayed_by, req.body.id];
    } else {
      query = "UPDATE tokens SET status = ? WHERE id = ?";
      params = [req.body.status, req.body.id];
    }

    await db.query(query, params);

    res.send({ msg: "Ficha atualizada com sucesso!" });
  } catch (err) {
    console.error("Error updating token:", err);
    res.status(500).send({ msg: "Falha na atualização da ficha!" });
  }
});

router.post("/token/close", async (req, res) => {
  try {
    const query =
      "UPDATE tokens SET status = ?, solved_by = ?, solved_at = ? WHERE id = ?";

    const params = [
      req.body.status,
      req.body.solved_by,
      getTime(),
      req.body.id,
    ];

    await db.query(query, params);

    res.send({ msg: "Ficha fechada com sucesso!" });
  } catch (err) {
    console.error("Error closing token:", err);
    res.status(500).send({ msg: "Falha no fechamento da ficha!" });
  }
});

router.post("/token/remove/byId/:id", async (req, res) => {
  try {
    const tokenId = req.params.id;

    await db.query("DELETE FROM queue WHERE token_id = ?", [tokenId]);
    await db.query("DELETE FROM tokens WHERE id = ?", [tokenId]);

    res.send("success");
  } catch (err) {
    console.error("Error removing token by ID:", err);
    res.status(500).send({ msg: "Falha na remoção do token!" });
  }
});

router.post("/queue/registration", async (req, res) => {
  try {
    const {
      token_id,
      position,
      service,
      priority,
      requested_by,
      table,
      location,
    } = req.body;

    const query = `
      INSERT INTO queue (token_id, position, service, priority, requested_by, \`table\`, location)
      VALUES (?,?,?,?,?,?,?)
    `;

    await db.query(query, [
      token_id,
      position,
      service,
      priority,
      requested_by,
      table,
      location,
    ]);

    res.send("success");
  } catch (err) {
    console.error("Error registering queue:", err);
    res.status(500).send("failed");
  }
});

router.post("/queue/remove", async (req, res) => {
  try {
    const token_id = req.body.token_id;

    await db.query("DELETE FROM queue WHERE token_id = ?", [token_id]);

    res.send("success");
  } catch (err) {
    console.error("Error removing from queue:", err);
    res.status(500).send("failed");
  }
});

router.post("/location/registration", async (req, res) => {
  try {
    const name = req.body.name;

    const existingLocation = await db.query(
      "SELECT * FROM locations WHERE name = ?",
      [name]
    );

    if (existingLocation.length > 0) {
      res.send("already exists");
    } else {
      await db.query(
        "INSERT INTO locations (name, description, tables, created_by, created_at) VALUES (?,?,?,?,?)",
        [
          name,
          req.body.description,
          req.body.tables,
          req.body.created_by,
          getTime(),
        ]
      );

      res.send("success");
    }
  } catch (err) {
    console.error("Error registering location:", err);
    res.status(500).send("failed");
  }
});

router.post("/location/remove", async (req, res) => {
  try {
    const locationId = req.body.id;

    await db.query("DELETE FROM locations WHERE id = ?", [locationId]);

    res.send("success");
  } catch (err) {
    console.error("Error removing location:", err);
    res.status(500).send("failed");
  }
});

router.post("/location/update", async (req, res) => {
  try {
    const { id, name, description, tables, updated_by } = req.body;

    await db.query(
      "UPDATE locations SET name = ?, description = ?, tables = ?, updated_by = ?, updated_at = ? WHERE id = ?",
      [name, description, tables, updated_by, getTime(), id]
    );

    res.send("success");
  } catch (err) {
    console.error("Error updating location:", err);
    res.status(500).send("failed");
  }
});

router.post("/service/registration", async (req, res) => {
  try {
    const serviceName = req.body.name;

    const existingService = await db.query(
      "SELECT * FROM services WHERE name = ?",
      [serviceName]
    );

    if (existingService.length > 0) {
      res.send("already exists");
    } else {
      await db.query(
        "INSERT INTO services (name, description, `limit`, created_by, created_at) VALUES (?,?,?,?,?)",
        [
          serviceName,
          req.body.description,
          req.body.limit,
          req.body.created_by,
          getTime(),
        ]
      );

      res.send("success");
    }
  } catch (err) {
    console.error("Error registering service:", err);
    res.status(500).send("failed");
  }
});

router.post("/service/remove", async (req, res) => {
  try {
    const serviceId = req.body.id;

    await db.query("DELETE FROM services WHERE id = ?", [serviceId]);

    res.send("success");
  } catch (err) {
    console.error("Error removing service:", err);
    res.status(500).send("failed");
  }
});

router.post("/service/update", async (req, res) => {
  try {
    const { id, name, description, limit, updated_by } = req.body;

    const existingService = await db.query(
      "SELECT * FROM services WHERE name = ?",
      [name]
    );

    if (existingService.length > 0) {
      res.send("Service with the same name already exists");
      return;
    }

    await db.query(
      "UPDATE services SET name = ?, description = ?, `limit` = ?, updated_by = ?, updated_at = ? WHERE id = ?",
      [name, description, limit, updated_by, getTime(), id]
    );

    res.send("success");
  } catch (err) {
    console.error("Error updating service:", err);
    res.status(500).send("failed");
  }
});

module.exports = router;

async function insertSelectedServices(userId, services) {
  try {
    await db.query("DELETE FROM user_services WHERE user_id = ?", [userId]);

    for (const serviceId of services) {
      await db.query(
        "INSERT INTO user_services (user_id, service_id) VALUES (?, ?)",
        [userId, serviceId]
      );
    }

    return "User registration successful";
  } catch (error) {
    console.error("Error linking user to services:", error);
    throw new Error("Failed to link user to services");
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
