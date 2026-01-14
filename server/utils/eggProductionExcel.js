import ExcelJS from 'exceljs';
import fs from 'fs';
import path from 'path';

const FILE_PATH = 'egg_production_cleaned.xlsx';
const SHEET_NAME = 'EggProduction';

export async function addEggProduction({ date, egg_count, feed_consumed }) {
  const workbook = new ExcelJS.Workbook();
  if (fs.existsSync(FILE_PATH)) {
    await workbook.xlsx.readFile(FILE_PATH);
  }
  const worksheet = workbook.getWorksheet(SHEET_NAME) || workbook.addWorksheet(SHEET_NAME);
  worksheet.addRow([date, new Date().toISOString(), egg_count, feed_consumed]);
  await workbook.xlsx.writeFile(FILE_PATH);
}

export async function getAllEggProduction() {
  const workbook = new ExcelJS.Workbook();
  if (!fs.existsSync(FILE_PATH)) return [];
  await workbook.xlsx.readFile(FILE_PATH);
  const worksheet = workbook.getWorksheet(SHEET_NAME);
  if (!worksheet) return [];
  const rows = [];
  worksheet.eachRow((row, rowNumber) => {
    if (rowNumber === 1) return; // skip header
    const [date, timestamp, egg_count, feed_consumed] = row.values.slice(1);
    rows.push({ date, timestamp, egg_count, feed_consumed });
  });
  return rows.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
}

export async function updateEggProduction({ date, timestamp, egg_count, feed_consumed }) {
  const workbook = new ExcelJS.Workbook();
  if (!fs.existsSync(FILE_PATH)) return false;
  await workbook.xlsx.readFile(FILE_PATH);
  const worksheet = workbook.getWorksheet(SHEET_NAME);
  if (!worksheet) return false;
  let updated = false;
  worksheet.eachRow((row, rowNumber) => {
    if (rowNumber === 1) return;
    const [rDate, rTimestamp] = row.values.slice(1);
    if (rDate === date && rTimestamp === timestamp) {
      row.getCell(3).value = egg_count;
      row.getCell(4).value = feed_consumed;
      updated = true;
    }
  });
  if (updated) await workbook.xlsx.writeFile(FILE_PATH);
  return updated;
}

export async function deleteEggProduction({ date, timestamp }) {
  const workbook = new ExcelJS.Workbook();
  if (!fs.existsSync(FILE_PATH)) return false;
  await workbook.xlsx.readFile(FILE_PATH);
  const worksheet = workbook.getWorksheet(SHEET_NAME);
  if (!worksheet) return false;
  let rowToDelete = null;
  worksheet.eachRow((row, rowNumber) => {
    if (rowNumber === 1) return;
    const [rDate, rTimestamp] = row.values.slice(1);
    if (rDate === date && rTimestamp === timestamp) {
      rowToDelete = rowNumber;
    }
  });
  if (rowToDelete) {
    worksheet.spliceRows(rowToDelete, 1);
    await workbook.xlsx.writeFile(FILE_PATH);
    return true;
  }
  return false;
}
