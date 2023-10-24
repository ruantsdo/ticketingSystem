const express = require("express")
const app = express()
const mysql = require("mysql")
const cors = require("cors");

const config = {
    host: "127.0.0.1",
    port: 3306,
    database: "database",
    user: "root",
    password: "password",
  };
  
  const db = mysql.createConnection(config);

  app.use(express.json())
  app.use(cors())
  
  db.connect((err) => {
    if (err) {
      console.error(err);
    } else {
      console.log("Conexão com o banco de dados foi estabelecida com sucesso...")
    }
  });

  app.post("/newUser", (req, res) => {
    const name = req.body.name
    const password = req.body.password

    db.query("SELECT name FROM users WHERE name = ?", [name], (err, res) => {
        if(err){
            res.send(err)
        }
        res.send(res)
    })
  })