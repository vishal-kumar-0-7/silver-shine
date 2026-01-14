import ExcelJS from 'exceljs';
import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

const EXCEL_FILE_PATH = 'expenses_cleaned.xlsx';
const SHEET_NAME = 'Records';

class ExcelHandler {
  constructor() {
    this.workbook = new ExcelJS.Workbook();
    this.initializeWorkbook();
  }

  async initializeWorkbook() {
    try {
      if (fs.existsSync(EXCEL_FILE_PATH)) {
        await this.workbook.xlsx.readFile(EXCEL_FILE_PATH);
      } else {
        await this.createNewWorkbook();
      }
    } catch (error) {
      console.log('Creating new workbook due to error:', error.message);
      await this.createNewWorkbook();
    }
  }

  async createNewWorkbook() {
    const worksheet = this.workbook.addWorksheet(SHEET_NAME);
    // Define headers for expenses only
    const headers = [
      'ID', 'Date', 'Timestamp', 'Type', 'Item Name', 'Expense', 'Profit', 'Notes'
    ];
    worksheet.addRow(headers);
    await this.workbook.xlsx.writeFile(EXCEL_FILE_PATH);
  }

  async addExpense(expenseData) {
    try {
      await this.initializeWorkbook();
      const worksheet = this.workbook.getWorksheet(SHEET_NAME) || this.workbook.addWorksheet(SHEET_NAME);
      const id = expenseData.id || uuidv4();
      const timestamp = expenseData.timestamp || new Date().toISOString();
      worksheet.addRow([
        id,
        expenseData.date,
        timestamp,
        'Expense',
        expenseData.itemName,
        expenseData.expense,
        expenseData.profit,
        expenseData.notes || ''
      ]);
      await this.workbook.xlsx.writeFile(EXCEL_FILE_PATH);
      return true;
    } catch (error) {
      console.error('Error adding expense to Excel:', error);
      throw error;
    }
  }

  async getAllExpenses() {
    try {
      await this.initializeWorkbook();
      const worksheet = this.workbook.getWorksheet(SHEET_NAME);
      if (!worksheet) return [];
      const expenses = [];
      let needsUpdate = false;
      worksheet.eachRow((row, rowNumber) => {
        if (rowNumber === 1) return; // Skip header row
        let [id, date, timestamp, type, itemName, expense, profit, notes] = row.values.slice(1);
        if (type === 'Expense') {
          // If id is missing, generate and update in Excel
          if (!id) {
            id = uuidv4();
            row.getCell(1).value = id;
            needsUpdate = true;
          }
          expenses.push({
            id,
            date,
            timestamp,
            itemName,
            expense: parseFloat(expense) || 0,
            profit: parseFloat(profit) || 0,
            notes: notes || ''
          });
        }
      });
      if (needsUpdate) {
        await this.workbook.xlsx.writeFile(EXCEL_FILE_PATH);
      }
      return expenses.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    } catch (error) {
      console.error('Error reading expenses from Excel:', error);
      return [];
    }
  }

  async deleteExpense(expenseId) {
    try {
      await this.initializeWorkbook();
      const worksheet = this.workbook.getWorksheet(SHEET_NAME);
      if (!worksheet) return false;
      // Find the row with the matching ID (now first column)
      let rowToDelete = null;
      worksheet.eachRow((row, rowNumber) => {
        if (rowNumber === 1) return; // Skip header row
        if (row.getCell(1).value === expenseId) {
          rowToDelete = rowNumber;
        }
      });
      if (rowToDelete) {
        worksheet.spliceRows(rowToDelete, 1);
        await this.workbook.xlsx.writeFile(EXCEL_FILE_PATH);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error deleting expense from Excel:', error);
      throw error;
    }
  }

  async getStats() {
    try {
      const expenses = await this.getAllExpenses();
      let totalExpense = 0;
      let totalProfit = 0;
      expenses.forEach(expense => {
        totalExpense += expense.expense;
        totalProfit += expense.profit;
      });
      return {
        totalExpense,
        totalProfit,
        netAmount: totalProfit - totalExpense,
        totalEntries: expenses.length
      };
    } catch (error) {
      console.error('Error calculating stats:', error);
      return {
        totalExpense: 0,
        totalProfit: 0,
        netAmount: 0,
        totalEntries: 0
      };
    }
  }

  getFilePath() {
    return path.resolve(EXCEL_FILE_PATH);
  }

  // Get a single expense by ID
  async getExpense(id) {
    await this.initializeWorkbook();
    const worksheet = this.workbook.getWorksheet(SHEET_NAME);
    if (!worksheet) return null;
    let found = null;
    worksheet.eachRow((row, rowNumber) => {
      if (rowNumber === 1) return; // Skip header
      if (row.getCell(1).value === id) {
        found = {
          id: row.getCell(1).value,
          date: row.getCell(2).value,
          timestamp: row.getCell(3).value,
          type: row.getCell(4).value,
          egg_count: row.getCell(5).value,
          itemName: row.getCell(6).value,
          expense: parseFloat(row.getCell(7).value) || 0,
          profit: parseFloat(row.getCell(8).value) || 0,
          notes: row.getCell(9).value || ''
        };
      }
    });
    return found;
  }

  // Update an expense by ID
  async updateExpense(id, updatedData) {
    await this.initializeWorkbook();
    const worksheet = this.workbook.getWorksheet(SHEET_NAME);
    if (!worksheet) return false;
    let updated = false;
    worksheet.eachRow((row, rowNumber) => {
      if (rowNumber === 1) return; // Skip header
      if (row.getCell(1).value === id) {
        row.getCell(1).value = updatedData.id;
        row.getCell(2).value = updatedData.date;
        row.getCell(3).value = updatedData.timestamp;
        row.getCell(4).value = 'Expense';
        row.getCell(5).value = '';
        row.getCell(6).value = updatedData.itemName;
        row.getCell(7).value = updatedData.expense;
        row.getCell(8).value = updatedData.profit;
        row.getCell(9).value = updatedData.notes || '';
        updated = true;
      }
    });
    if (updated) await this.workbook.xlsx.writeFile(EXCEL_FILE_PATH);
    return updated;
  }
}

export default new ExcelHandler();