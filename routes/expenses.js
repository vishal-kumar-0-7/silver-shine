import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import excelHandler from '../utils/excelHandler.js';
import { authenticateToken } from '../middleware/auth.js';
import { logExpenseAudit } from '../utils/expenseAudit.js';
import { logProfitAudit } from '../utils/profitAudit.js';

const router = express.Router();

// Apply authentication middleware to all routes
router.use(authenticateToken);

// Get all expenses
router.get('/', async (req, res) => {
  try {
    const expenses = await excelHandler.getAllExpenses();
    res.json(expenses);
  } catch (error) {
    console.error('Error fetching expenses:', error);
    res.status(500).json({ message: 'Failed to fetch expenses' });
  }
});

// Create new expense
router.post('/', async (req, res) => {
  try {
    const { date, itemName, expense, profit, timestamp } = req.body;

    // Validate required fields
    if (!date || !itemName) {
      return res.status(400).json({ message: 'Date and item name are required' });
    }

    const expenseData = {
      id: uuidv4(),
      date,
      itemName,
      expense: parseFloat(expense) || 0,
      profit: parseFloat(profit) || 0,
      timestamp: timestamp || new Date().toISOString(),
      createdBy: req.user.username
    };

    await excelHandler.addExpense(expenseData);

    // Expense audit log
    try {
      await logExpenseAudit({
        userId: req.user.id,
        action: 'create',
        expenseId: expenseData.id,
        details: expenseData
      });
    } catch (e) {
      console.error('Expense audit log error (create):', e);
    }
    // Profit audit log (if profit > 0)
    if (expenseData.profit > 0) {
      try {
        await logProfitAudit({
          userId: req.user.id,
          action: 'create',
          profitId: expenseData.id,
          details: expenseData
        });
      } catch (e) {
        console.error('Profit audit log error (create):', e);
      }
    }
    
    res.status(201).json({
      message: 'Expense added successfully',
      expense: expenseData
    });
  } catch (error) {
    console.error('Error creating expense:', error);
    res.status(500).json({ message: 'Failed to create expense' });
  }
});

// Update expense
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { date, itemName, expense, profit, timestamp } = req.body;

    // Validate required fields
    if (!date || !itemName) {
      return res.status(400).json({ message: 'Date and item name are required' });
    }

    // Get old expense for audit log
    const oldExpense = await excelHandler.getExpense(id);
    if (!oldExpense) {
      return res.status(404).json({ message: 'Expense not found' });
    }

    const updatedExpense = {
      id,
      date,
      itemName,
      expense: parseFloat(expense) || 0,
      profit: parseFloat(profit) || 0,
      timestamp: timestamp || new Date().toISOString(),
      createdBy: req.user.username
    };

    const updated = await excelHandler.updateExpense(id, updatedExpense);
    if (!updated) {
      return res.status(500).json({ message: 'Failed to update expense' });
    }

    // Expense audit log
    try {
      await logExpenseAudit({
        userId: req.user.id,
        action: 'update',
        expenseId: id,
        details: { old: oldExpense, new: updatedExpense }
      });
    } catch (e) {
      console.error('Expense audit log error (update):', e);
    }
    // Profit audit log (if profit > 0)
    if (updatedExpense.profit > 0) {
      try {
        await logProfitAudit({
          userId: req.user.id,
          action: 'update',
          profitId: id,
          details: { old: oldExpense, new: updatedExpense }
        });
      } catch (e) {
        console.error('Profit audit log error (update):', e);
      }
    }

    res.status(200).json({
      message: 'Expense updated successfully',
      expense: updatedExpense
    });
  } catch (error) {
    console.error('Error updating expense:', error);
    res.status(500).json({ message: 'Failed to update expense' });
  }
});

// Delete expense
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const oldExpense = await excelHandler.getExpense(id);
    const success = await excelHandler.deleteExpense(id);
    
    if (success) {
      // Expense audit log
      try {
        await logExpenseAudit({
          userId: req.user.id,
          action: 'delete',
          expenseId: id,
          details: { deleted: true, old: oldExpense }
        });
      } catch (e) {
        console.error('Expense audit log error (delete):', e);
      }
      // Profit audit log (if profit > 0)
      if (oldExpense && oldExpense.profit > 0) {
        try {
          await logProfitAudit({
            userId: req.user.id,
            action: 'delete',
            profitId: id,
            details: { deleted: true, old: oldExpense }
          });
        } catch (e) {
          console.error('Profit audit log error (delete):', e);
        }
      }
      res.json({ message: 'Expense deleted successfully' });
    } else {
      res.status(404).json({ message: 'Expense not found' });
    }
  } catch (error) {
    console.error('Error deleting expense:', error);
    res.status(500).json({ message: 'Failed to delete expense' });
  }
});

// Get statistics
router.get('/stats', async (req, res) => {
  try {
    const stats = await excelHandler.getStats();
    res.json(stats);
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ message: 'Failed to fetch statistics' });
  }
});

// Download Excel file
router.get('/download', async (req, res) => {
  try {
    const filePath = excelHandler.getFilePath();
    const fileName = `egg-farm-data-${new Date().toISOString().split('T')[0]}.xlsx`;
    
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
    
    res.download(filePath, fileName, (err) => {
      if (err) {
        console.error('Error downloading file:', err);
        res.status(500).json({ message: 'Failed to download file' });
      }
    });
  } catch (error) {
    console.error('Error preparing download:', error);
    res.status(500).json({ message: 'Failed to prepare download' });
  }
});

export default router;