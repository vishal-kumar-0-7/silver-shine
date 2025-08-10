import ExcelJS from 'exceljs';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const filePath = path.join(__dirname, '../egg_production_cleaned.xlsx');
const SHEET_NAME = 'Records';

export async function addEggProduction({ date, egg_count, feed_consumed }) {
  const workbook = new ExcelJS.Workbook();
  let worksheet;
  const timestamp = new Date().toISOString();

  // Try to load existing file, or create new
  try {
    await workbook.xlsx.readFile(filePath);
    worksheet = workbook.getWorksheet(SHEET_NAME);
    if (!worksheet) {
      worksheet = workbook.addWorksheet(SHEET_NAME);
      worksheet.addRow(['Date', 'Timestamp', 'Type', 'Egg Boxes', 'Item Name', 'Expense', 'Profit', 'Feed Packets']);
    }
  } catch (err) {
    worksheet = workbook.addWorksheet(SHEET_NAME);
    worksheet.addRow(['Date', 'Timestamp', 'Type', 'Egg Boxes', 'Item Name', 'Expense', 'Profit', 'Feed Packets']);
  }

  worksheet.addRow([
    date,
    timestamp,
    'Egg Production',
    egg_count,
    '', // Item Name
    '', // Expense
    '', // Profit
    feed_consumed || ''
  ]);
  await workbook.xlsx.writeFile(filePath);
}

export async function getAllEggProduction() {
  const workbook = new ExcelJS.Workbook();
  if (!fs.existsSync(filePath)) {
    return [];
  }
  await workbook.xlsx.readFile(filePath);
  let worksheet = workbook.getWorksheet(SHEET_NAME);
  if (!worksheet) {
    worksheet = workbook.worksheets[0]; // fallback to the first worksheet
  }
  if (!worksheet) {
    return [];
  }
  const rows = [];
  worksheet.eachRow((row, rowNumber) => {
    if (rowNumber === 1) return; // skip header
    const [date, timestamp, type, egg_count, itemName, expense, profit, feed_consumed] = row.values.slice(1);
    if (type === 'Egg Production') {
      rows.push({ date, timestamp, egg_count, feed_consumed });
    }
  });
  return rows;
}

export async function updateEggProduction({ date, timestamp, egg_count, feed_consumed }) {
  const workbook = new ExcelJS.Workbook();
  if (!fs.existsSync(filePath)) {
    throw new Error('Excel file not found');
  }
  await workbook.xlsx.readFile(filePath);
  let worksheet = workbook.getWorksheet(SHEET_NAME);
  if (!worksheet) {
    worksheet = workbook.worksheets[0]; // fallback to the first worksheet
  }
  if (!worksheet) throw new Error('Records worksheet not found');
  let updated = false;
  worksheet.eachRow((row, rowNumber) => {
    if (rowNumber === 1) return; // skip header
    const [rowDate, rowTimestamp, type] = row.values.slice(1, 4);
    if (type === 'Egg Production' && rowDate === date && rowTimestamp === timestamp) {
      // Corrected: update egg_count (col 4) and feed_consumed (col 8)
      row.getCell(4).value = egg_count;
      row.getCell(8).value = feed_consumed || '';
      updated = true;
    }
  });
  if (updated) {
    await workbook.xlsx.writeFile(filePath);
    return true;
  }
  return false;
}

export async function deleteEggProduction({ date, timestamp }) {
  const workbook = new ExcelJS.Workbook();
  if (!fs.existsSync(filePath)) {
    throw new Error('Excel file not found');
  }
  await workbook.xlsx.readFile(filePath);
  let worksheet = workbook.getWorksheet(SHEET_NAME);
  if (!worksheet) {
    worksheet = workbook.worksheets[0]; // fallback to the first worksheet
  }
  if (!worksheet) throw new Error('Records worksheet not found');
  let deleted = false;
  worksheet.eachRow((row, rowNumber) => {
    if (rowNumber === 1) return; // skip header
    const [rowDate, rowTimestamp, type] = row.values.slice(1, 4);
    if (type === 'Egg Production' && rowDate === date && rowTimestamp === timestamp) {
      worksheet.spliceRows(rowNumber, 1);
      deleted = true;
    }
  });
  if (deleted) {
    await workbook.xlsx.writeFile(filePath);
    return true;
  }
  return false;
}
