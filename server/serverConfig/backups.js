require("dotenv").config();

const cron = require("node-cron");
const path = require("path");
const fs = require("fs");
const { exec } = require("child_process");
const mysql = require("mysql2/promise");

const dbConfig = {
  host: process.env.DATABASE_HOST,
  user: process.env.DATABASE_USER,
  password: process.env.DATABASE_PASSWORD,
  database: process.env.DATABASE_NAME,
};

const mysqlWorkbenchPath =
  '"C:\\Program Files\\MySQL\\MySQL Workbench 8.0\\mysqldump.exe"';

cron.schedule("0 0 * * *", async () => {
  console.log("Iniciando rotina de backup diário!");
  await createAndInsertMonthlyTable();
  backupAndResetTable();
});

function backupAndResetTable() {
  const tableName = "tokens";
  const backupFolder = path.join(__dirname, "..", "Backups");
  const backupFileName = `backup_${tableName}_${new Date().toISOString()}.sql`;
  const sanitizedFileName = backupFileName.replace(/[^\w\s.-]/gi, "");
  const fullPath = path.join(backupFolder, sanitizedFileName);

  if (!fs.existsSync(backupFolder)) {
    fs.mkdirSync(backupFolder);
  }

  const backupCommand = `${mysqlWorkbenchPath} -u${dbConfig.user} -p${dbConfig.password} ${dbConfig.database} ${tableName} > ${fullPath}`;

  exec(backupCommand, (backupError) => {
    if (backupError) {
      console.error("Erro ao criar backup:", backupError);
    } else {
      console.log("Backup criado com sucesso:", fullPath);

      // exec(resetTableCommand, (resetError) => {
      //   if (resetError) {
      //     console.error('Erro ao zerar a tabela:', resetError);
      //   } else {
      //     console.log('Tabela zerada com sucesso.');
      //   }
      // });

      console.log("Rotina de backup diário encerrada!");
    }
  });
}

async function createAndInsertMonthlyTable() {
  const connection = await mysql.createConnection(dbConfig);

  try {
    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth();

    const monthsInPortuguese = [
      "Janeiro",
      "Fevereiro",
      "Março",
      "Abril",
      "Maio",
      "Junho",
      "Julho",
      "Agosto",
      "Setembro",
      "Outubro",
      "Novembro",
      "Dezembro",
    ];

    const formattedMonth = monthsInPortuguese[currentMonth];
    const monthlyTableName = `backup_${formattedMonth}_de_${currentYear}`;

    const [tableExists] = await connection.execute(
      `SELECT 1 FROM information_schema.tables WHERE table_schema = ? AND table_name = ?`,
      [dbConfig.database, monthlyTableName]
    );

    if (tableExists.length === 0) {
      await connection.execute(`
        CREATE TABLE ${monthlyTableName} (
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
      `INSERT INTO ${monthlyTableName} (daily_id, position, service, priority, requested_by, created_by, created_at, solved_by, solved_at, delayed_by, delayed_at, status, description)
      SELECT id AS daily_id, position, service, priority, requested_by, created_by, created_at, solved_by, solved_at, delayed_by, delayed_at, status, description
      FROM tokens`
    );

    console.log(
      `Dados da tabela principal clonados para a tabela ${monthlyTableName} com sucesso.`
    );
  } catch (error) {
    console.error("Erro ao criar e inserir dados na tabela mensal:", error);
  } finally {
    await connection.end();
  }
}

module.exports = { backupAndResetTable, createAndInsertMonthlyTable };
