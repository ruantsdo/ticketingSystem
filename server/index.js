const express = require("express");
const app = express();
const mysql = require("mysql");
const cors = require("cors");
const bcrypt = require("bcrypt");
const saltRounds = 10;

const config = {
  host: "127.0.0.1",
  port: 3306,
  database: "database",
  user: "root",
  password: "password",
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

app.post("/newUser", (req, res) => {
  const name = req.body.name;
  const password = req.body.password;
  const cpf = req.body.cpf;
  const sector = req.body.sector;
  const email = req.body.email;

  db.query("SELECT cpf FROM users WHERE cpf = ?", [cpf], (err, result) => {
    if (err) {
      return;
    }

    if (result.length == 0) {
      bcrypt.hash(password, saltRounds, (err, hash) => {
        db.query(
          "INSERT INTO users (name, password, cpf, sector, email) VALUES (?, ?, ?, ?, ?)",
          [name, hash, cpf, sector, email],
          (err) => {
            if (err) {
              res.send({ msg: "Falha no cadastrado!" });
            } else {
              res.send({ msg: "Cadastrado com sucesso!" });
            }
          }
        );
      });
    } else {
      res.send({ msg: "Usuário já cadastrado!" });
    }
  });
});

app.get("/sectors", (req, res) => {
  db.query("SELECT id, name FROM sectors", (err, result) => {
    res.send(result);
  });
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
        console.log(permissionLevel);
        res.send({ permissionLevel });
      } else {
        res.status(404).send("CPF não encontrado");
      }
    }
  );
});

app.listen(3001, () => {
  console.log("Servidor está ouvindo na porta 3001...");
});
