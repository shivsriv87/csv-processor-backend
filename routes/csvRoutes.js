const express = require('express');
const multer = require('multer');
const fastCsv = require('fast-csv');
const fs = require('fs');
const path = require('path');
const CsvFile = require('../models/CsvFile');

const router = express.Router();
const upload = multer({ dest: 'uploads/' });

// Parse formulas and compute values
const parseCell = (data, cell, visited = new Set()) => {
  if (!isNaN(cell)) return parseFloat(cell); // Numeric value
  if (cell.startsWith('=')) {
    const formula = cell.slice(1);
    if (visited.has(cell)) {
      throw new Error(`Circular reference detected in formula: ${cell}`);
    }
    visited.add(cell); // Track visited cells to detect circular references

    const result = formula.replace(/([A-Z]+\d+)/g, (match) => {
      const [col, row] = [match.charCodeAt(0) - 65, parseInt(match.slice(1)) - 1];
      return parseCell(data, data[row]?.[col] || '0', visited); // Handle missing data
    });

    return eval(result); // Evaluate formula
  }
  return 0; // Default value for invalid cells
};

const processCsv = (filePath) => {
  return new Promise((resolve, reject) => {
    const data = [];
    fs.createReadStream(filePath)
      .pipe(fastCsv.parse({ headers: false }))
      .on('data', (row) => data.push(Object.values(row)))
      .on('end', () => {
        try {
          const result = data.map((row, i) =>
            row.map((cell) => parseCell(data, cell))
          );
          resolve(result);
        } catch (error) {
          reject(error);
        }
      })
      .on('error', (error) => reject(error));
  });
};

// Route: Upload and process CSV
router.post('/upload', upload.single('file'), async (req, res) => {
  const filePath = path.resolve(req.file.path);
  try {
    const processedData = await processCsv(filePath);

    // Save processed data and file metadata in MongoDB
    const csvFile = new CsvFile({
      originalName: req.file.originalname,
      processedData,
    });
    await csvFile.save();

    // Clean up the uploaded file
    fs.unlinkSync(filePath);

    // Return processed data as response
    res.status(200).json({ processedData });
  } catch (error) {
    console.error('Error processing CSV:', error.message);
    res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
});

module.exports = router;
