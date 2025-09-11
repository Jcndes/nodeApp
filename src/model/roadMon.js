const mongoose = require('../../config/mongo');

const imageSchema = new mongoose.Schema({
  url: { type: String, required: true },
  description: { type: String },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Image', imageSchema);
