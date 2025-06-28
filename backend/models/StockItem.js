const mongoose = require('mongoose');

const stockItemSchema = new mongoose.Schema({
  itemName: { type: String, required: true },
  category: { type: String, required: true },
  quantity: { type: Number, required: true, min: 1 },
  unitPrice: { type: Number, required: true, min: 0 },
  supplier: { type: String, required: true },
  location: { type: String, required: true },
  description: { type: String },
}, {
  timestamps: true
});

module.exports = mongoose.model('StockItem', stockItemSchema);