import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// One-time migration script: Move 'Notes' to 'Feed Consumed' for egg production records
import ExcelJS from 'exceljs';
import path from 'path';
import fs from 'fs';

const filePath = path.join(__dirname, 'data.xlsx');
const SHEET_NAME = 'Records';

(async () => {
  if (!fs.existsSync(filePath)) {
    console.error('Excel file not found:', filePath);
    process.exit(1);
  }

  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.readFile(filePath);
  const worksheet = workbook.getWorksheet(SHEET_NAME);
  if (!worksheet) {
    console.error('Worksheet not found:', SHEET_NAME);
    process.exit(1);
  }

  // Update header: change 'Egg Count' to 'Egg Boxes', 'Feed Consumed' to 'Feed Packets'
  const headerRow = worksheet.getRow(1);
  let feedPacketsColIdx = null;
  let notesColIdx = null;
  headerRow.eachCell((cell, colNumber) => {
    if (typeof cell.value === 'string') {
      const val = cell.value.trim().toLowerCase();
      if (val === 'feed packets' || val === 'feed consumed') {
        feedPacketsColIdx = colNumber;
      }
      if (val === 'notes') {
        notesColIdx = colNumber;
      }
    }
  });

  if (!feedPacketsColIdx && !notesColIdx) {
    // Print header row for debugging
    console.error('Could not find Feed Packets, Feed Consumed, or Notes column. Header row is:');
    const headerValues = [];
    headerRow.eachCell((cell) => headerValues.push(cell.value));
    console.error(headerValues);
    process.exit(1);
  }

  // For each row, if type is 'Egg Production', move Notes to Feed Packets if needed
  worksheet.eachRow((row, rowNumber) => {
    if (rowNumber === 1) return; // skip header
    const typeCell = row.getCell(3).value;
    if (typeCell === 'Egg Production') {
      // If Notes column exists and Feed Packets column exists and Notes has value, move it
      if (notesColIdx && feedPacketsColIdx) {
        const notesValue = row.getCell(notesColIdx).value;
        if (notesValue) {
          row.getCell(feedPacketsColIdx).value = notesValue;
          row.getCell(notesColIdx).value = '';
        }
      }
      row.commit();
    }
  });

  await workbook.xlsx.writeFile(filePath);
  console.log('Migration complete: Notes moved to Feed Consumed for egg production records.');
})(); 