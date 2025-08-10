import ExcelJS from 'exceljs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const filePath = path.join(__dirname, '../expenses_cleaned.xlsx');
const SHEET_NAME = 'Records';

(async () => {
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.readFile(filePath);
  const worksheet = workbook.getWorksheet(SHEET_NAME) || workbook.worksheets[0];
  worksheet.eachRow((row, rowNumber) => {
    console.log(row.values);
  });
})();