const bcrypt = require('bcrypt');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const redis = require('../config/redis');
const { emailQueue } = require('../queues'); // fila de e-mails
const { createUser, findUserByEmail, getAllUsers, updateUserPassword } = require('../models/road_db');

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

      // Adiciona job para enviar e-mail de boas-vindas
      await emailQueue.add('send-welcome-email', {
        userId: user.insertId || user.id, // ajuste conforme o retorno do MySQL
        name,
        email,
      }, {
        attempts: 3,
        backoff: { type: 'exponential', delay: 5000 },
        removeOnComplete: true,
        removeOnFail: false,
      });

      return res.status(201).json({ msg: 'Usuário criado com sucesso! E-mail de boas-vindas será enviado.', user });
    } catch (err) {
      res.status(500).json({ msg: 'Erro no servidor', error: err.message });
    }
  },

  // Validar se o email existe
  async validateEmail(req, res) {
    try {
      const { email } = req.body;
      if (!email) {
        return res.status(422).json({ msg: 'Email é obrigatório.' });
      }

      const user = await findUserByEmail(email);
      if (!user) {
        return res.status(404).json({ exists: false, msg: 'Email não encontrado.' });
      }

      return res.json({ exists: true, msg: 'Email válido.' });
    } catch (err) {
      res.status(500).json({ msg: 'Erro ao validar email', error: err.message });
    }
  },

  // Validar senha do usuário sem gerar token
  async validatePassword(req, res) {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        return res.status(422).json({ msg: 'Email e senha são obrigatórios.' });
      }

      const user = await findUserByEmail(email);
      if (!user) {
        return res.status(404).json({ valid: false, msg: 'Usuário não encontrado.' });
      }

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(401).json({ valid: false, msg: 'Senha inválida.' });
      }

      return res.json({ valid: true, msg: 'Senha válida.' });
    } catch (err) {
      res.status(500).json({ msg: 'Erro ao validar senha', error: err.message });
    }
  },

  // Iniciar recuperação de senha
  async recoverPassword(req, res) {
    try {
      const { email } = req.body;
      if (!email) {
        return res.status(422).json({ msg: 'Email é obrigatório.' });
      }

      const user = await findUserByEmail(email);
      if (!user) {
        return res.status(404).json({ msg: 'Usuário não encontrado.' });
      }

      const token = crypto.randomBytes(32).toString('hex');
      await redis.set(`passwordRecovery:${token}`, email, { EX: 900 });

      return res.json({
        msg: 'Token de recuperação gerado. Use-o para redefinir a senha.',
        token,
      });
    } catch (err) {
      res.status(500).json({ msg: 'Erro ao iniciar recuperação de senha', error: err.message });
    }
  },

  // Redefinir senha usando token de recuperação
  async resetPassword(req, res) {
    try {
      const { token, password, confirmpassword } = req.body;
      if (!token || !password || !confirmpassword) {
        return res.status(422).json({ msg: 'Token, senha e confirmação são obrigatórios.' });
      }
      if (password !== confirmpassword) {
        return res.status(422).json({ msg: 'As senhas não conferem.' });
      }

      const email = await redis.get(`passwordRecovery:${token}`);
      if (!email) {
        return res.status(404).json({ msg: 'Token de recuperação inválido ou expirado.' });
      }

      const user = await findUserByEmail(email);
      if (!user) {
        return res.status(404).json({ msg: 'Usuário não encontrado.' });
      }

      const salt = await bcrypt.genSalt(12);
      const passwordHash = await bcrypt.hash(password, salt);
      await updateUserPassword(email, passwordHash);
      await redis.del(`passwordRecovery:${token}`);

      return res.json({ msg: 'Senha redefinida com sucesso.' });
    } catch (err) {
      res.status(500).json({ msg: 'Erro ao redefinir senha', error: err.message });
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

