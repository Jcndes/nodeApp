const bcrypt = require('bcrypt');
const { createUser, findUserByEmail, getAllUsers } = require('../models/road_db');
const RoadDB = require('../models/road_db'); // ou o nome correto do arquivo


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
  }
};

