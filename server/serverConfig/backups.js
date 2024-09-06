const mysql = require("mysql2/promise");

const {
  DATABASE_HOST,
  DATABASE_PORT,
  DATABASE_NAME,
  DATABASE_USER,
  DATABASE_PASSWORD,
  MIN_CONNECTIONS,
} = require("./variables");

const { midNightSignal } = require("./socketUtils");

const prefix = "historic";

const pool = new mysql.createPool({
  host: DATABASE_HOST,
  port: DATABASE_PORT,
  user: DATABASE_USER,
  password: DATABASE_PASSWORD,
  database: DATABASE_NAME,
  connectionLimit: MIN_CONNECTIONS,
});

const dbConfig = {
  host: DATABASE_HOST,
  user: DATABASE_USER,
  password: DATABASE_PASSWORD,
  database: DATABASE_NAME,
};

async function backupAndResetTable() {
  console.log("-> Iniciando processo de limpeza das tabelas...");
  const tableName = "tokens";
  const secondTable = "queue";
  const connection = await pool.getConnection();

  try {
    const resetTableCommand = `TRUNCATE TABLE ??`;

    await connection.query(resetTableCommand, [secondTable]);
    console.log("--> Fila zerada com sucesso!");

    await connection.query(resetTableCommand, [tableName]);
    console.log("--> Senhas limpas com sucesso!");
  } catch (resetError) {
    console.error("***Erro ao zerar as tabelas***", resetError);
  } finally {
    await connection.release();
  }

  console.log("-> Limpeza dos dados residuais completa!");
}

async function createAndInsertHistoricTable() {
  const connection = await pool.getConnection();

  try {
    console.log("-> Verificando existência da tabela de histórico");
    const tableName = `${prefix}`;

    const [tableExists] = await connection.execute(
      `SELECT 1 FROM information_schema.tables WHERE table_schema = ? AND table_name = ?`,
      [dbConfig.database, tableName]
    );

    if (tableExists.length === 0) {
      console.log("--> Tabela de histórico não encontrada...");
      console.log("--> Iniciando processo de criação...");

      try {
        await connection.execute(`
        CREATE TABLE ${tableName} (
          id INT NOT NULL AUTO_INCREMENT,
          daily_id INT NOT NULL,
          position INT NOT NULL,
          service VARCHAR(150) NOT NULL,
          priority BOOLEAN NOT NULL,
          requested_by VARCHAR(150) NULL,
          created_by VARCHAR(150) NOT NULL,
          created_at VARCHAR(100) NOT NULL,
          called_by VARCHAR(150) NULL,
          called_at VARCHAR(100) NULL,
          solved_by VARCHAR(150) NULL,
          solved_at VARCHAR(100) NULL,
          delayed_by VARCHAR(150) NULL,
          delayed_at VARCHAR(100) NULL,
          status VARCHAR(50) NULL,
          description VARCHAR(1000) NULL,
          visual_impairment BOOLEAN NOT NULL DEFAULT 0,
          motor_disability BOOLEAN NOT NULL DEFAULT 0,
          hearing_impairment BOOLEAN NOT NULL DEFAULT 0,
          cognitive_impairment BOOLEAN NOT NULL DEFAULT 0,
          PRIMARY KEY (id)
        )
      `);
      } catch (error) {
        console.log("***Falha ao criar tabela de histórico!***");
        return false;
      }
      console.log("---> Tabela de histórico criada com sucesso!");
    } else {
      console.log("--> Tabela encontrada!");
    }

    console.log("-> Iniciando clonagem de dados...");

    try {
      await connection.execute(
        `INSERT INTO ${tableName} (daily_id, position, service, priority, requested_by, created_by, created_at, solved_by, solved_at, delayed_by, delayed_at, status, description, called_by, called_at, visual_impairment, motor_disability, hearing_impairment, cognitive_impairment)
        SELECT tokens.id AS daily_id, tokens.position, services.name AS service, tokens.priority, tokens.requested_by, tokens.created_by, tokens.created_at,
               COALESCE(tokens.solved_by, 'ENCERRADO PELO SISTEMA') AS solved_by,
               tokens.solved_at, tokens.delayed_by, tokens.delayed_at,
               CASE WHEN tokens.solved_by IS NULL THEN 'ENCERRADO PELO SISTEMA' ELSE tokens.status END AS status,
               tokens.description, tokens.called_by, tokens.called_at, tokens.visual_impairment, tokens.motor_disability, tokens.hearing_impairment, tokens.cognitive_impairment
        FROM tokens
        INNER JOIN services ON tokens.service = services.id`
      );

      console.log(
        `--> Dados da tabela principal clonados para a tabela "${tableName}" com sucesso.`
      );
    } catch (error) {
      console.log("***Falha ao clonar os dados!***");
      return false;
    }
  } catch (error) {
    console.error(
      `***Erro ao criar e inserir dados na tabela ${tableName}***`,
      error
    );
    return false;
  } finally {
    await connection.release();
  }
}

async function getTables() {
  const connection = await pool.getConnection();

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
    await connection.release();
  }
}

async function createBackup() {
  console.log("===================================");
  console.log("Iniciando rotina de backup das fichas!");
  console.log("===================================");

  const success = await createAndInsertHistoricTable();

  if (success === false) {
    console.log(
      "Devido a falha no processo de clonagem dos dados, a limpeza será abordada!"
    );
  } else {
    await backupAndResetTable();
  }

  console.log("===================================");
  console.log("Rotina de backup encerrada!");
  console.log("===================================");

  console.log("===================================");
  console.log("Solicitando reload aos clientes conectados...");
  console.log("===================================");

  if (midNightSignal()) {
    console.log("===================================");
    console.log("Solicitação enviada aos clientes conectados!");
    console.log("===================================");
  } else {
    console.log("===================================");
    console.log("Falha ao enviar solicitação aos clientes conectados!");
    console.log("===================================");
  }

  console.log("===================================");
  console.log("As rotina foi concluída!");
  console.log("===================================");
}

module.exports = {
  backupAndResetTable,
  createAndInsertHistoricTable,
  getTables,
  createBackup,
};
