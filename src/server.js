const app = require('./src/app');
const connectMongo = require('./config/mongo');

(async () => {
  await connectMongo();

  app.listen(process.env.PORT || 3000, () => {
    console.log(`Servidor rodando na porta ${process.env.PORT || 3000}`);
  });
})();
