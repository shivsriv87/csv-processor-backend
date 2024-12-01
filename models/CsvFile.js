const mongoose = require('mongoose');

const CsvFileSchema = new mongoose.Schema({
  originalName: String,
  processedData: Array,
  uploadedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('CsvFile', CsvFileSchema);
