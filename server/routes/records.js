import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

router.get('/download', async (req, res) => {
  const { type } = req.query;
  let filePath;
  let fileName;
  if (type === 'egg') {
    filePath = path.join(__dirname, '../egg_production_cleaned.xlsx');
    fileName = 'egg_production_cleaned.xlsx';
  } else {
    filePath = path.join(__dirname, '../expenses_cleaned.xlsx');
    fileName = 'expenses_cleaned.xlsx';
  }
  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ message: 'No data file found' });
  }
  res.download(filePath, fileName);
});

// Direct download for cleaned egg production file
router.get('/download-egg', async (req, res) => {
  const filePath = path.join(__dirname, '../egg_production_cleaned.xlsx');
  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ message: 'No data file found' });
  }
  res.download(filePath, 'egg_production_cleaned.xlsx');
});

// Direct download for cleaned expenses file
router.get('/download-expenses', async (req, res) => {
  const filePath = path.join(__dirname, '../expenses_cleaned.xlsx');
  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ message: 'No data file found' });
  }
  res.download(filePath, 'expenses_cleaned.xlsx');
});

export default router;