const fs = require("fs");
const path = require("path");
const db = require("../../../config/mysql");

async function runMigrations() {
  try {
    const migrationsDir = path.join(__dirname);
    const files = fs.readdirSync(migrationsDir)
                    .filter(f => f.endsWith(".sql"))
                    .sort(); // garante execução na ordem numérica

    for (const file of files) {
      const sql = fs.readFileSync(path.join(migrationsDir, file), "utf-8");
      console.log(`🚀 Executando migration: ${file}`);
      await db.query(sql);
    }

    console.log("✅ Todas as migrations executadas com sucesso!");
    process.exit(0);
  } catch (err) {
    console.error("❌ Erro nas migrations:", err);
    process.exit(1);
  }
}

runMigrations();

