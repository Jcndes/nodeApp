const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const redis = require('../config/redis');
const { createUser, findUserByEmail, getAllUsers } = require('../models/road_db');

// Controller de usuários
module.exports = {

  // Listar todos os usuários
  async getUsers(req, res) {
    try {
      const users = await getAllUsers();
      res.json(users);
    } catch (err) {
      res.status(500).json({ error: "Erro ao buscar usuários" });
    }
  },

  // Criar usuário simples (sem senha)
  async createUser(req, res) {
    try {
      const { name, email } = req.body;
      await createUser(name, email, null); // senha pode ser null
      res.status(201).json({ message: "Usuário criado com sucesso" });
    } catch (err) {
      res.status(500).json({ error: "Erro ao criar usuário" });
    }
  },

  // Registrar usuário com senha criptografada
  async registerUser(req, res) {
    try {
      const { name, email, password, confirmpassword } = req.body;

      if (!name || !email || !password) {
        return res.status(422).json({ msg: 'Campos obrigatórios faltando!' });
      }
      if (password !== confirmpassword) {
        return res.status(422).json({ msg: 'As senhas não conferem!' });
      }

      const existingUser = await findUserByEmail(email);
      if (existingUser) {
        return res.status(422).json({ msg: 'Email já cadastrado!' });
      }

      const salt = await bcrypt.genSalt(12);
      const passwordHash = await bcrypt.hash(password, salt);

      const user = await createUser(name, email, passwordHash);

      res.status(201).json({ msg: 'Usuário criado com sucesso!', user });
    } catch (err) {
      res.status(500).json({ msg: 'Erro no servidor', error: err.message });
    }
  },

  // Login do usuário
  async loginUser(req, res) {
    try {
      const { email, password } = req.body;

      const user = await findUserByEmail(email);
      if (!user) return res.status(404).json({ msg: 'Usuário não encontrado' });

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) return res.status(401).json({ msg: 'Senha inválida' });

      // Gera token JWT
      const token = jwt.sign(
        { id: user.id, email: user.email },
        process.env.JWT_SECRET,
        { expiresIn: '1h' }
      );

      // Salva sessão no Redis
      await redis.set(`session:${user.id}`, JSON.stringify(user), { EX: 3600 });

      res.json({ msg: 'Login realizado com sucesso', token });
    } catch (err) {
      res.status(500).json({ msg: 'Erro no login', error: err.message });
    }
  },

  // Logout do usuário
  async logoutUser(req, res) {
    try {
      const authHeader = req.headers['authorization'];
      if (!authHeader) {
        return res.status(401).json({ msg: 'Token não fornecido' });
      }

      const token = authHeader.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Remove a sessão do Redis
      await redis.del(`session:${decoded.id}`);

      res.json({ msg: 'Logout realizado com sucesso!' });
    } catch (err) {
      res.status(500).json({ msg: 'Erro ao realizar logout', error: err.message });
    }
  }
};
