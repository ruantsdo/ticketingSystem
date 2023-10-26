const express = require("express");
const app = express();
const mysql = require("mysql");
const cors = require("cors");
const bcrypt = require("bcrypt");
const saltRounds = 10;

const databaseHost = "127.0.0.1";
const databasePort = "3306";

const config = {
  host: databaseHost,
  port: databasePort,
  database: "database",
  user: "root",
  password: "password",
};

const myIp = "192.168.0.38";
const port = "3001";

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
        //console.log(permissionLevel);
        res.send({ permissionLevel });
      } else {
        res.status(404).send("CPF não encontrado");
      }
    }
  );
});

app.listen(port, myIp, () => {
  console.log("Servidor está ouvindo na porta 3001...");
});
