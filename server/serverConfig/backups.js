const mysql = require("mysql2/promise");

const {
  DATABASE_HOST,
  DATABASE_NAME,
  DATABASE_USER,
  DATABASE_PASSWORD,
} = require("./variables");

const prefix = "historic";

const dbConfig = {
  host: DATABASE_HOST,
  user: DATABASE_USER,
  password: DATABASE_PASSWORD,
  database: DATABASE_NAME,
};

async function backupAndResetTable() {
  const tableName = "tokens";
  const secondTable = "queue";
  const connection = await mysql.createConnection(dbConfig);

  try {
    const resetTableCommand = `TRUNCATE TABLE ??`;

    await connection.query(resetTableCommand, [secondTable]);
    console.log("Fila zerada com sucesso!");

    await connection.query(resetTableCommand, [tableName]);
    console.log("Senhas limpas com sucesso!");
  } catch (resetError) {
    console.error("Erro ao zerar a tabelas:", resetError);
  } finally {
    await connection.end();
  }

  console.log("Rotina de backup diário encerrada!");
}

async function createAndInsertHistoricTable() {
  const connection = await mysql.createConnection(dbConfig);

  try {
    const tableName = `${prefix}`;

    const [tableExists] = await connection.execute(
      `SELECT 1 FROM information_schema.tables WHERE table_schema = ? AND table_name = ?`,
      [dbConfig.database, tableName]
    );

    if (tableExists.length === 0) {
      await connection.execute(`
        CREATE TABLE ${tableName} (
          id INT NOT NULL AUTO_INCREMENT,
          daily_id INT NOT NULL,
          position INT NOT NULL,
          service INT NOT NULL,
          priority BOOLEAN NOT NULL,
          requested_by VARCHAR(150) NULL,
          created_by VARCHAR(150) NOT NULL,
          created_at VARCHAR(100) NOT NULL,
          solved_by VARCHAR(150) NULL,
          solved_at VARCHAR(100) NULL,
          delayed_by VARCHAR(150) NULL,
          delayed_at VARCHAR(100) NULL,
          status VARCHAR(50) NULL,
          description VARCHAR(1000) NULL,
          PRIMARY KEY (id)
        )
      `);
    }

    await connection.execute(
      `INSERT INTO ${tableName} (daily_id, position, service, priority, requested_by, created_by, created_at, solved_by, solved_at, delayed_by, delayed_at, status, description)
      SELECT id AS daily_id, position, service, priority, requested_by, created_by, created_at, solved_by, solved_at, delayed_by, delayed_at, status, description
      FROM tokens`
    );

    console.log(
      `Dados da tabela principal clonados para a tabela ${tableName} com sucesso.`
    );
  } catch (error) {
    console.error(
      `Erro ao criar e inserir dados na tabela ${tableName}:`,
      error
    );
  } finally {
    await connection.end();
  }
}

async function getTables() {
  const connection = await mysql.createConnection(dbConfig);

  try {
    const query = `SHOW TABLES LIKE '${prefix}%'`;
    const [results] = await connection.execute(query);

    const tables = results.map((row, index) => {
      const tableName = Object.values(row)[0];
      return { id: index + 1, name: tableName };
    });

    return tables;
  } catch (error) {
    console.error("Erro ao executar a consulta:", error);
  } finally {
    await connection.end();
  }
}

module.exports = {
  backupAndResetTable,
  createAndInsertHistoricTable,
  getTables,
};
