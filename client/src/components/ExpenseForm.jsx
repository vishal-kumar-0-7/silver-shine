import React, { useState } from 'react';
import { expenseAPI } from '../utils/api';

const ExpenseForm = ({ onExpenseAdded }) => {
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    itemName: '',
    expense: '',
    profit: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const itemSuggestions = [
    'Feed', 'Medicine', 'Maintenance', 'Egg Sales', 'Equipment', 
    'Utilities', 'Labor', 'Transportation', 'Packaging', 'Other'
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const expenseValue = parseFloat(formData.expense) || 0;
      const profitValue = parseFloat(formData.profit) || 0;

      const dataToSubmit = {
        ...formData,
        expense: expenseValue,
        profit: profitValue,
        timestamp: new Date().toISOString()
      };

      await expenseAPI.create(dataToSubmit);
      
      // Reset form
      setFormData({
        date: new Date().toISOString().split('T')[0],
        itemName: '',
        expense: '',
        profit: ''
      });

      onExpenseAdded();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add expense');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card mb-8">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Add New Entry</h2>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Date
            </label>
            <input
              type="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              className="input-field"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Item Name
            </label>
            <input
              type="text"
              name="itemName"
              value={formData.itemName}
              onChange={handleChange}
              list="item-suggestions"
              className="input-field"
              placeholder="Enter item name"
              required
            />
            <datalist id="item-suggestions">
              {itemSuggestions.map((item, index) => (
                <option key={index} value={item} />
              ))}
            </datalist>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Expense (₹)
            </label>
            <input
              type="number"
              name="expense"
              value={formData.expense}
              onChange={handleChange}
              className="input-field"
              placeholder="0.00"
              step="0.01"
              min="0"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Profit (₹)
            </label>
            <input
              type="number"
              name="profit"
              value={formData.profit}
              onChange={handleChange}
              className="input-field"
              placeholder="0.00"
              step="0.01"
              min="0"
            />
          </div>
        </div>

        {error && (
          <div className="text-red-600 text-sm">{error}</div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 rounded-lg shadow-md transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Adding...' : 'Add Entry'}
        </button>
      </form>
    </div>
  );
};

export default ExpenseForm;