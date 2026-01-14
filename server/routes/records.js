import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

// Try multiple locations (server folder and repo root) to find the cleaned files.
function findDataFile(relativePaths) {
  for (const rel of relativePaths) {
    const p = path.join(__dirname, rel);
    if (fs.existsSync(p)) return p;
  }
  return null;
}

router.get('/download', async (req, res) => {
  const { type } = req.query;
  let fileName;
  let candidateRel;

  if (type === 'egg') {
    fileName = 'egg_production_cleaned.xlsx';
    candidateRel = ['../egg_production_cleaned.xlsx', '../../egg_production_cleaned.xlsx'];
  } else {
    fileName = 'expenses_cleaned.xlsx';
    candidateRel = ['../expenses_cleaned.xlsx', '../../expenses_cleaned.xlsx'];
  }

  const filePath = findDataFile(candidateRel);
  if (!filePath) {
    console.warn(`Requested ${fileName} but none of the candidate paths exist: ${candidateRel.join(', ')}`);
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