const Image = require('../models/roadmgo');

const uploadImage = async (req, res) => {
  try {
    const { url, description } = req.body;
    if (!url) return res.status(422).json({ msg: 'URL obrigatória!' });

    const img = new Image({ url, description });
    await img.save();

    res.status(201).json({ msg: 'Imagem registrada', img });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = { uploadImage };
