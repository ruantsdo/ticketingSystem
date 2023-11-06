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

router.post("/newUser", async (req, res) => {
  db.query(
    "SELECT cpf FROM users WHERE cpf = ?",
    [req.body.cpf],
    async (err, result) => {
      if (err) {
        return;
      }

      const hash = await bcrypt.hash(req.body.password, saltRounds);

      try {
        let emailValue = req.body.email !== undefined ? req.body.email : "";
        await db.query(
          "INSERT INTO users (name, password, cpf, sector, email, permission_level) VALUES (?, ?, ?, ?, ?, ?)",
          [
            req.body.name,
            hash,
            req.body.cpf,
            req.body.sector,
            emailValue,
            req.body.permissionLevel,
          ]
        );
      } catch (err) {
        res.send({ msg: "Falha no cadastrado!" });
      }
    }
  );
});

router.post("/token/registration", async (req, res) => {
  try {
    const sector = req.body.sector;
    const service = req.body.services;
    const priority = req.body.priority;
    const created_by = req.body.created;
    const requested_by = req.body.requested_by;

    const query = `
        INSERT INTO tokens (sector, position, service, priority, created_by, requested_by)
        SELECT ?, COALESCE(MAX(position) + 1, 1), ?, ?, ?, ?
        FROM tokens
        WHERE sector = ?
      `;

    await db.query(query, [
      sector,
      service,
      priority,
      created_by,
      requested_by,
      sector,
    ]);

    res.send({ msg: "Ficha cadastrada com sucesso!" });
  } catch (err) {
    res.send({ msg: "Falha no cadastramento da ficha!" });
  }
});

router.post("/queue/registration", async (req, res) => {
  try {
    await db.query(
      "INSERT INTO queue (token_id, sector, position, service, priority, requested_by, created_by, table) VALUES (?,?,?,?,?,?,?,?)",
      [
        req.body.token_id,
        req.body.sector,
        req.body.position,
        req.body.service,
        req.body.priority,
        req.body.requested_by,
        req.body.created_by,
        req.body.table,
      ]
    );
    res.send({ msg: "Ficha cadastrada com sucesso!" });
  } catch (err) {
    res.status(500).send({ msg: "Falha no cadastramento da ficha!" });
  }
});

module.exports = router;
