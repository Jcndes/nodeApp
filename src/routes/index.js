const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { uploadImage } = require('../controllers/exampleController');
const authMiddleware = require('../middleware/auth');

// Usuários MySQL
router.get('/users', authMiddleware, userController.getUsers); // protegido
router.get('/users', userController.getUsers);
router.post('/users', userController.createUser);

// Login, validação e recuperação
router.post('/auth/login', userController.loginUser);
router.post('/auth/logout', authMiddleware, userController.logoutUser);
router.post('/auth/validate-email', userController.validateEmail);
router.post('/auth/validate-password', userController.validatePassword);
router.post('/auth/recover-password', userController.recoverPassword);
router.post('/auth/reset-password', userController.resetPassword);

// Registro Mongo
router.post('/auth/register', userController.registerUser);

// Upload de imagens Mongo
router.post('/media/upload', uploadImage);

// exemplo de rota teste
router.get('/', (req, res) => {
  res.send('API funcionando 🚀');
});

module.exports = router;



