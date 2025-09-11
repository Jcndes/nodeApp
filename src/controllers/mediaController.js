const path = require('path');
const fs = require('fs');

// Lista arquivos de mídia
exports.listMedia = (req, res) => {
    const mediaDir = path.join(__dirname, '../../media');
    fs.readdir(mediaDir, (err, files) => {
        if (err) {
            return res.status(500).json({ error: 'Erro ao listar arquivos.' });
        }
        res.json({ files });
    });
};

// Faz upload de mídia
exports.uploadMedia = (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: 'Nenhum arquivo enviado.' });
    }
    res.json({ filename: req.file.filename, message: 'Upload realizado com sucesso.' });
};

// Remove arquivo de mídia
exports.deleteMedia = (req, res) => {
    const { filename } = req.params;
    const filePath = path.join(__dirname, '../../media', filename);
    fs.unlink(filePath, (err) => {
        if (err) {
            return res.status(404).json({ error: 'Arquivo não encontrado.' });
        }
        res.json({ message: 'Arquivo removido com sucesso.' });
    });
};