import ExcelJS from 'exceljs';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const inputFile = path.join(__dirname, 'all-records-2025-06-28.xlsx');
const outputFile = path.join(__dirname, 'all-records-2025-06-28.cleaned.xlsx');
const SHEET_NAME = 'Records';

function extractInt(val) {
  if (val == null || val === '') return 0;
  const match = String(val).match(/\d+/);
  return match ? parseInt(match[0], 10) : 0;
}

(async () => {
  if (!fs.existsSync(inputFile)) {
    console.error('Input file not found:', inputFile);
    process.exit(1);
  }

  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.readFile(inputFile);
  const worksheet = workbook.getWorksheet(SHEET_NAME) || workbook.worksheets[0];
  if (!worksheet) {
    console.error('Worksheet not found.');
    process.exit(1);
  }

  // Create new workbook for output
  const outWorkbook = new ExcelJS.Workbook();
  const outSheet = outWorkbook.addWorksheet(SHEET_NAME);

  // Copy header
  const headerRow = worksheet.getRow(1);
  outSheet.addRow(headerRow.values.slice(1));

  worksheet.eachRow((row, rowNumber) => {
    if (rowNumber === 1) return;
    const values = row.values.slice(1); // ExcelJS rows are 1-indexed
    let type = values[2];
    if (typeof type === 'string' && type.toLowerCase().startsWith('egg produc')) {
      // Clean Egg Production row
      type = 'Egg Production';
      // Egg Count is col 4, Feed Consumed is col 8 (0-based: 3, 7)
      values[2] = type;
      values[3] = extractInt(values[3]);
      values[7] = extractInt(values[7]);
    }
    outSheet.addRow(values);
  });

  await outWorkbook.xlsx.writeFile(outputFile);
  console.log('Cleaned file written to:', outputFile);
})(); 