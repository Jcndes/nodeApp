const jwt = require('jsonwebtoken');
const redis = require('../config/redis');

async function authMiddleware(req, res, next) {
  try {
    // Captura o token do header Authorization: Bearer <token>
    const authHeader = req.headers['authorization'];
    if (!authHeader) {
      return res.status(401).json({ msg: 'Token não fornecido' });
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      return res.status(401).json({ msg: 'Token inválido' });
    }

    // Verifica se o token é válido com JWT
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Verifica se o token ainda existe no Redis
    const session = await redis.get(`session:${decoded.id}`);
    if (!session) {
      return res.status(403).json({ msg: 'Sessão expirada ou inválida' });
    }

    // Anexa o usuário ao request
    req.user = JSON.parse(session);

    next();
  } catch (err) {
    res.status(401).json({ msg: 'Token inválido ou expirado', error: err.message });
  }
}

module.exports = authMiddleware;
