const db = require("../../../config/mysql");

async function runSeeders() {
  try {
    console.log("🌱 Inserindo dados iniciais...");

    await db.query(`INSERT INTO users (name, email) VALUES 
      ('Admin', 'admin@silak.com'),
      ('User Teste', 'teste@silak.com')`);

    console.log("✅ Seeders aplicados com sucesso!");
    process.exit(0);
  } catch (err) {
    console.error("❌ Erro ao rodar seeders:", err);
    process.exit(1);
  }
}

runSeeders();
