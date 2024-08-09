const {
  DATABASE_HOST,
  DATABASE_PORT,
  DATABASE_NAME,
  DATABASE_USER,
  DATABASE_PASSWORD,
  MAX_CONNECTIONS,
} = require("./variables");

const mysql = require("mysql");

let pool = mysql.createPool({
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

function resetPool() {
  return new Promise((resolve, reject) => {
    pool.end((err) => {
      if (err) {
        return reject(err);
      }
      console.log("Pool de conexões encerrado.");
      pool = mysql.createPool({
        connectionLimit: MAX_CONNECTIONS,
        host: DATABASE_HOST,
        port: DATABASE_PORT,
        database: DATABASE_NAME,
        user: DATABASE_USER,
        password: DATABASE_PASSWORD,
      });
      console.log("Novo pool de conexões criado.");
      resolve();
    });
  });
}

module.exports = { pool, resetPool };
