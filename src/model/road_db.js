// src/models/road_db.js
const pool = require('../../config/mysql');
const bcrypt = require('bcrypt');

// Cria usuário completo com senha
const createUser = async (name, email, password) => {
  const [result] = await pool.query(
    'INSERT INTO users (name, email, password) VALUES (?, ?, ?)',
    [name, email, password]
  );
  return result;
};

// Buscar usuário pelo email
const findUserByEmail = async (email) => {
  const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
  return rows[0];
};

// Listar todos usuários
const getAllUsers = async () => {
  const [rows] = await pool.query('SELECT * FROM users');
  return rows;
};

// Criar usuário simples (sem senha)
const createSimpleUser = async (user) => {
  const { name, email } = user;
  await pool.query('INSERT INTO users (name, email) VALUES (?, ?)', [name, email]);
};

// 🔑 Autenticar usuário (email + senha)
const authenticateUser = async (email, password) => {
  const user = await findUserByEmail(email);
  if (!user) {
    return null; // usuário não encontrado
  }

  const validPassword = await bcrypt.compare(password, user.password);
  if (!validPassword) {
    return null; // senha incorreta
  }

  return user; // sucesso → retorna os dados do usuário
};

module.exports = { 
  createUser, 
  findUserByEmail, 
  getAllUsers, 
  createSimpleUser, 
  authenticateUser 
};
