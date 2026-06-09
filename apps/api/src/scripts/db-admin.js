const fs = require("fs");
const path = require("path");
const mysql = require("mysql2/promise");
const env = require("../config/env");

const repoRoot = path.resolve(__dirname, "../../../..");
const databaseDir = path.join(repoRoot, "database");
const migrationsDir = path.join(databaseDir, "migrations");

function readSql(filePath) {
  return fs.readFileSync(filePath, "utf8").trim();
}

function splitStatements(sql) {
  return sql
    .split(/;\s*(?:\r?\n|$)/)
    .map((statement) => statement.trim())
    .filter(Boolean);
}

async function connect({ multipleStatements = false } = {}) {
  return mysql.createConnection({
    host: env.mysql.host,
    port: env.mysql.port,
    database: env.mysql.database,
    user: env.mysql.user,
    password: env.mysql.password,
    multipleStatements
  });
}

async function executeSqlFile(connection, filePath) {
  const sql = readSql(filePath);
  if (!sql) {
    return 0;
  }

  let count = 0;
  for (const statement of splitStatements(sql)) {
    await connection.query(statement);
    count += 1;
  }
  return count;
}

async function ensureMigrationTable(connection) {
  await connection.query(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      id BIGINT PRIMARY KEY AUTO_INCREMENT,
      filename VARCHAR(255) NOT NULL UNIQUE,
      applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);
}

function listMigrationFiles() {
  if (!fs.existsSync(migrationsDir)) {
    return [];
  }

  return fs
    .readdirSync(migrationsDir)
    .filter((name) => name.endsWith(".sql"))
    .sort();
}

async function markAllMigrationsApplied(connection) {
  await ensureMigrationTable(connection);
  for (const filename of listMigrationFiles()) {
    await connection.query(
      "INSERT INTO schema_migrations (filename) VALUES (?) ON DUPLICATE KEY UPDATE filename = filename",
      [filename]
    );
  }
}

async function check() {
  const connection = await connect();
  try {
    const [databaseRows] = await connection.query("SELECT DATABASE() AS databaseName, NOW() AS checkedAt");
    const [tableRows] = await connection.query(
      `
        SELECT TABLE_NAME AS tableName
        FROM information_schema.TABLES
        WHERE TABLE_SCHEMA = DATABASE()
        ORDER BY TABLE_NAME
      `
    );

    const tables = tableRows.map((row) => row.tableName);
    console.log(JSON.stringify({
      ok: true,
      database: databaseRows[0]?.databaseName,
      checkedAt: databaseRows[0]?.checkedAt,
      tableCount: tables.length,
      requiredTablesReady: ["users", "admission_applications", "student_documents"].every((name) => tables.includes(name))
    }, null, 2));
  } finally {
    await connection.end();
  }
}

async function seed() {
  const connection = await connect();
  try {
    const statementCount = await executeSqlFile(connection, path.join(databaseDir, "seed.sql"));
    console.log(`Seed completed. Statements executed: ${statementCount}`);
  } finally {
    await connection.end();
  }
}

async function migrate() {
  const connection = await connect();
  try {
    await ensureMigrationTable(connection);
    const [appliedRows] = await connection.query("SELECT filename FROM schema_migrations");
    const applied = new Set(appliedRows.map((row) => row.filename));
    let appliedCount = 0;

    for (const filename of listMigrationFiles()) {
      if (applied.has(filename)) {
        continue;
      }

      await executeSqlFile(connection, path.join(migrationsDir, filename));
      await connection.query("INSERT INTO schema_migrations (filename) VALUES (?)", [filename]);
      appliedCount += 1;
      console.log(`Applied migration: ${filename}`);
    }

    console.log(`Migration completed. New migrations applied: ${appliedCount}`);
  } finally {
    await connection.end();
  }
}

async function setup() {
  const connection = await connect();
  try {
    const schemaCount = await executeSqlFile(connection, path.join(databaseDir, "schema.sql"));
    const seedCount = await executeSqlFile(connection, path.join(databaseDir, "seed.sql"));
    await markAllMigrationsApplied(connection);
    console.log(`Fresh database setup completed. Schema statements: ${schemaCount}. Seed statements: ${seedCount}.`);
  } finally {
    await connection.end();
  }
}

const command = process.argv[2] || "check";

const commands = {
  check,
  setup,
  seed,
  migrate
};

if (!commands[command]) {
  console.error(`Unknown database command: ${command}`);
  console.error(`Available commands: ${Object.keys(commands).join(", ")}`);
  process.exit(1);
}

commands[command]().catch((error) => {
  console.error(`Database command failed: ${error.message}`);
  process.exit(1);
});
