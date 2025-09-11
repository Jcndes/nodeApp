require('dotenv').config();
const express = require('express');
const app = express();
const routes = require('./src/routes/index'); // rotas centralizadas
const connectMongo = require('./config/mongo'); // função de conexão Mongo
const mysql = require('./config/mysql'); // conexão MySQL (pool)

app.use(express.json());
app.use('/api', routes); // todas rotas prefixadas com /api

module.exports = app;
