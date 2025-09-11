const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { uploadImage } = require('../controllers/exampleController');

// Usuários MySQL
router.get('/users', userController.getUsers);
router.post('/users', userController.createUser);

// Registro Mongo
router.post('/auth/register', userController.registerUser);

// Upload de imagens Mongo
router.post('/media/upload', uploadImage);

// exemplo de rota teste
router.get('/', (req, res) => {
  res.send('API funcionando 🚀');
});

module.exports = router;



