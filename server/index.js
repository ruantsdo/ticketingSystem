require("dotenv").config({ path: "./.env" });

const express = require("express");
const app = express();
const mysql = require("mysql");
const cors = require("cors");
const bcrypt = require("bcrypt");
const saltRounds = 10;

const config = {
  host: process.env.DATABASE_HOST,
  port: process.env.DATABASE_PORT,
  database: process.env.DATABASE_NAME,
  user: process.env.DATABASE_USER,
  password: process.env.DATABASE_PASSWORD,
};

const db = mysql.createConnection(config);

app.use(express.json());
app.use(cors());

db.connect((err) => {
  if (err) {
    console.error(err);
  } else {
    console.log("Conexão com o banco de dados foi estabelecida com sucesso...");
  }
});

app.post("/login", (req, res) => {
  const cpf = req.body.cpf;
  const password = req.body.password;

  db.query("SELECT * FROM users WHERE cpf = ?", [cpf], (error, response) => {
    if (error) {
      res.send(error);
    }

    if (response.length > 0) {
      bcrypt.compare(password, response[0].password, (error, result) => {
        if (result) {
          console.log("Logado com sucesso!");
          res.send(response);
          return;
        }
        console.log("Senha incorreta!");
        res.send({ msg: "Senha incorreta!" });
      });
    } else {
      console.log("Usuário não encontrado!");
      res.send({ msg: "Usuário não encontrado!" });
    }
  });
});

app.post("/newUser", async (req, res) => {
  db.query(
    "SELECT cpf FROM users WHERE cpf = ?",
    [req.body.cpf],
    async (err, result) => {
      if (err) {
        return;
      }

      const hash = await bcrypt.hash(req.body.password, saltRounds);

      try {
        await db.query(
          "INSERT INTO users (name, password, cpf, sector, email, permission_level) VALUES (?, ?, ?, ?, ?, ?)",
          [
            req.body.name,
            hash,
            req.body.cpf,
            req.body.sector,
            req.body.email,
            req.body.permissionLevel,
          ]
        );

        res.send({ msg: "Cadastrado com sucesso!" });
      } catch (err) {
        res.send({ msg: "Falha no cadastrado!" });
      }
    }
  );
});

app.post("/token/registration", async (req, res) => {
  try {
    await db.query(
      "INSERT INTO tokens (sector, service, priority, created_by) VALUES (?, ?, ?, ?)",
      [req.body.sector, req.body.service, req.body.priority, req.body.created]
    );
    res.send({ msg: "Ficha cadastrada com sucesso!" });
  } catch (err) {
    res.send({ msg: "Falha no cadastramento da ficha!" });
  }
});

app.get("/token/query", async (req, res) => {
  try {
    await db.query("SELECT * FROM tokens ", (err, result) => {
      res.send(result);
    });
  } catch (err) {
    res.send({ msg: "Falha da consulta dos tokens!" });
  }
});

app.get("/sectors", async (req, res) => {
  try {
    await db.query("SELECT id, name FROM sectors", (err, result) => {
      res.send(result);
    });
  } catch (error) {
    console.log(error);
  }
});

app.get("/permissionsLevels", async (req, res) => {
  try {
    await db.query("SELECT * FROM permission_levels", (err, result) => {
      res.send(result);
    });
  } catch (error) {
    console.log(error);
  }
});

app.get("/queue", async (req, res) => {
  try {
    await db.query("SELECT * FROM queue", (err, result) => {
      res.send(result);
    });
  } catch (error) {
    console.error("Erro ao buscar dados do banco de dados:", error);
    res.status(500).json({ error: "Erro ao buscar dados do banco de dados" });
  }
});

app.get("/usersLevel/:cpf", (req, res) => {
  const cpf = req.params.cpf;

  db.query(
    "SELECT permission_level FROM users WHERE cpf = ?",
    [cpf],
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

app.listen(process.env.SERVER_PORT, process.env.SERVER_IP, () => {
  console.log(
    "Servidor está ouvindo na porta => " + process.env.SERVER_PORT + " ..."
  );
});
