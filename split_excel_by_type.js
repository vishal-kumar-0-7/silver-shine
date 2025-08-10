import ExcelJS from 'exceljs';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const inputFile = path.join(__dirname, 'data.xlsx');
const eggFile = path.join(__dirname, 'egg_production.xlsx');
const expenseFile = path.join(__dirname, 'expenses.xlsx');
const SHEET_NAME = 'Records';

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

  // Prepare output workbooks
  const eggWb = new ExcelJS.Workbook();
  const eggSheet = eggWb.addWorksheet(SHEET_NAME);
  const expenseWb = new ExcelJS.Workbook();
  const expenseSheet = expenseWb.addWorksheet(SHEET_NAME);

  // Copy header
  const headerRow = worksheet.getRow(1);
  eggSheet.addRow(headerRow.values.slice(1));
  expenseSheet.addRow(headerRow.values.slice(1));

  worksheet.eachRow((row, rowNumber) => {
    if (rowNumber === 1) return; // skip header
    const values = row.values.slice(1);
    const type = (values[2] || '').toString().toLowerCase();
    if (type === 'egg production') {
      eggSheet.addRow(values);
    } else if (type === 'expense') {
      expenseSheet.addRow(values);
    }
  });

  await eggWb.xlsx.writeFile(eggFile);
  await expenseWb.xlsx.writeFile(expenseFile);
  console.log('Egg Production and Expense sheets created.');

  // Remove the original file
  fs.unlinkSync(inputFile);
  console.log('Original data.xlsx removed.');
})(); 