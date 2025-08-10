import React, { useState, useEffect } from 'react';
import { expenseAPI } from '../utils/api';
import ExpenseForm from './ExpenseForm';
import ExpanseCard from './ExpanseCard';
import FilterBar from './FilterBar';
import Login from './Login';

const Dashboard = ({ user, onLogout }) => {
  const [expenses, setExpenses] = useState([]);
  const [filteredExpenses, setFilteredExpenses] = useState([]);
  const [stats, setStats] = useState({
    totalExpense: 0,
    totalProfit: 0,
    netAmount: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showRegisterModal, setShowRegisterModal] = useState(false);

  useEffect(() => {
    fetchExpenses();
    fetchStats();
  }, []);

  const fetchExpenses = async () => {
    try {
      const response = await expenseAPI.getAll();
      setExpenses(response.data);
      setFilteredExpenses(response.data);
    } catch (err) {
      setError('Failed to fetch expenses');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await expenseAPI.getStats();
      setStats(response.data);
    } catch (err) {
      console.error('Failed to fetch stats:', err);
    }
  };

  const handleExpenseAdded = () => {
    fetchExpenses();
    fetchStats();
  };

  const handleFilterChange = (filters) => {
    // If all filters are cleared, show all expenses
    if (
      !filters.itemName &&
      !filters.startDate &&
      !filters.endDate &&
      (filters.type === 'all' || !filters.type)
    ) {
      setFilteredExpenses(expenses);
      return;
    }

    let filtered = [...expenses];

    // Filter by item name
    if (filters.itemName) {
      filtered = filtered.filter(expense =>
        expense.itemName.toLowerCase().includes(filters.itemName.toLowerCase())
      );
    }

    // Filter by date range
    if (filters.startDate) {
      filtered = filtered.filter(expense =>
        new Date(expense.date) >= new Date(filters.startDate)
      );
    }
    if (filters.endDate) {
      filtered = filtered.filter(expense =>
        new Date(expense.date) <= new Date(filters.endDate)
      );
    }

    // Filter by type
    if (filters.type === 'expense') {
      filtered = filtered.filter(expense => expense.expense > 0);
    } else if (filters.type === 'profit') {
      filtered = filtered.filter(expense => expense.profit > 0);
    }

    setFilteredExpenses(filtered);
  };

  const handleDownload = async () => {
    try {
      const response = await expenseAPI.downloadExcel();
      const blob = new Blob([response.data], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `egg-farm-data-${new Date().toISOString().split('T')[0]}.xlsx`;
      link.click();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      setError('Failed to download Excel file');
    }
  };

  const handleDeleteExpense = async (id) => {
    if (window.confirm('Are you sure you want to delete this entry?')) {
      try {
        await expenseAPI.delete(id);
        fetchExpenses();
        fetchStats();
      } catch (err) {
        setError('Failed to delete expense');
      }
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  };

  // Download handlers for separate sheets
  const handleDownloadEgg = async () => {
    try {
      const response = await fetch('/api/records/download?type=egg');
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `egg-production-${new Date().toISOString().split('T')[0]}.xlsx`;
      link.click();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      setError('Failed to download Egg Production sheet');
    }
  };

  const handleDownloadExpense = async () => {
    try {
      const response = await fetch('/api/records/download?type=expense');
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `expenses-${new Date().toISOString().split('T')[0]}.xlsx`;
      link.click();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      setError('Failed to download Expenses sheet');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-green-50 to-yellow-50">
      <main className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8 py-6 sm:py-10">
        {/* Admin Register New User Button */}
        {user && user.is_admin && (
          <div className="mb-6 flex justify-end">
            <button
              className="bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2 px-4 rounded shadow-md transition"
              onClick={() => setShowRegisterModal(true)}
            >
              Register New User
            </button>
          </div>
        )}
        {/* Register Modal */}
        {showRegisterModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
            <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-md w-full relative">
              <button
                className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 text-2xl font-bold"
                onClick={() => setShowRegisterModal(false)}
                aria-label="Close"
              >
                ×
              </button>
              <Login
                onLogin={() => { setShowRegisterModal(false); }}
                user={user}
                forceRegister={true}
              />
            </div>
          </div>
        )}
        {/* Download Buttons */}
        <div className="flex flex-wrap gap-4 mb-6">
          <button
            onClick={handleDownloadEgg}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded shadow-md transition"
          >
            Download Egg Production Sheet
          </button>
          <button
            onClick={handleDownloadExpense}
            className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded shadow-md transition"
          >
            Download Expenses Sheet
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white shadow-lg rounded-xl p-6 border-l-4 border-l-red-500 flex items-center hover:scale-105 transition-transform">
            <div className="flex-1">
              <p className="text-sm text-red-600 font-semibold">Total Expenses</p>
              <p className="text-3xl font-bold text-red-700 mt-1">
                {formatCurrency(stats.totalExpense)}
              </p>
            </div>
            <div className="text-red-500 text-4xl ml-4">📉</div>
          </div>

          <div className="bg-white shadow-lg rounded-xl p-6 border-l-4 border-l-green-500 flex items-center hover:scale-105 transition-transform">
            <div className="flex-1">
              <p className="text-sm text-green-600 font-semibold">Total Profit</p>
              <p className="text-3xl font-bold text-green-700 mt-1">
                {formatCurrency(stats.totalProfit)}
              </p>
            </div>
            <div className="text-green-500 text-4xl ml-4">📈</div>
          </div>

          <div className={`bg-white shadow-lg rounded-xl p-6 border-l-4 ${
            stats.netAmount >= 0 
              ? 'border-l-blue-500' 
              : 'border-l-orange-500'
          } flex items-center hover:scale-105 transition-transform`}>
            <div className="flex-1">
              <p className={`text-sm font-semibold ${
                stats.netAmount >= 0 ? 'text-blue-600' : 'text-orange-600'
              }`}>
                Net Amount
              </p>
              <p className={`text-3xl font-bold mt-1 ${
                stats.netAmount >= 0 ? 'text-blue-700' : 'text-orange-700'
              }`}>
                {formatCurrency(stats.netAmount)}
              </p>
            </div>
            <div className={`text-4xl ml-4 ${
              stats.netAmount >= 0 ? 'text-blue-500' : 'text-orange-500'
            }`}>
              {stats.netAmount >= 0 ? '💰' : '⚠️'}
            </div>
          </div>
        </div>

        {/* Add Expense Form */}
        <div className="mb-8">
          <ExpenseForm onExpenseAdded={handleExpenseAdded} />
        </div>

        {/* Filter Bar */}
        <div className="mb-8">
          <FilterBar 
            onFilterChange={handleFilterChange}
          />
        </div>

        {/* Error Display */}
        {error && (
          <div className="mb-6 p-4 bg-red-100 border border-red-300 rounded-lg shadow text-red-700 font-semibold">
            <p>{error}</p>
          </div>
        )}

        {/* Expenses Grid */}
        <div className="space-y-4">
          <div className="flex justify-between items-center mb-2">
            <h2 className="text-2xl font-bold text-gray-900">Recent Entries ({filteredExpenses.length})</h2>
            {filteredExpenses.length !== expenses.length && (
              <p className="text-sm text-gray-500">
                Showing {filteredExpenses.length} of {expenses.length} entries
              </p>
            )}
          </div>

          {filteredExpenses.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-xl shadow-inner">
              <div className="text-7xl mb-4">📊</div>
              <p className="text-gray-500 text-lg font-semibold">No entries found</p>
              <p className="text-gray-400">
                {expenses.length === 0 
                  ? 'Add your first entry above to get started' 
                  : 'Try adjusting your filters'
                }
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {(Array.isArray(filteredExpenses) ? filteredExpenses : []).map((expense) => (
                <ExpanseCard
                  key={expense.id || `${expense.date}-${expense.timestamp}`}
                  expense={expense}
                  onDelete={handleDeleteExpense}
                />
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;