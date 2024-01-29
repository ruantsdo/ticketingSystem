const {
  DATABASE_HOST,
  DATABASE_PORT,
  DATABASE_NAME,
  DATABASE_USER,
  DATABASE_PASSWORD,
  MAX_CONNECTIONS,
} = require("./variables");

const mysql = require("mysql");

const pool = mysql.createPool({
  connectionLimit: MAX_CONNECTIONS,
  host: DATABASE_HOST,
  port: DATABASE_PORT,
  database: DATABASE_NAME,
  user: DATABASE_USER,
  password: DATABASE_PASSWORD,
});

pool.getConnection((err, connection) => {
  if (err) {
    console.error(err);
  } else {
    console.log("Conexão com o banco de dados foi estabelecida com sucesso...");
    connection.release();
  }
});

module.exports = pool;
