import React from 'react';

const ExpenseCard = ({ expense, onDelete }) => {
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  };

  const getNetAmount = () => {
    return expense.profit - expense.expense;
  };

  const getNetAmountColor = () => {
    const net = getNetAmount();
    if (net > 0) return 'text-green-600';
    if (net < 0) return 'text-red-600';
    return 'text-gray-600';
  };

  return (
    <div className="card border-l-4 border-l-primary-500 p-4 sm:p-6 mb-4 rounded-xl shadow-md bg-white">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            {expense.itemName}
          </h3>
          <p className="text-sm text-gray-600">
            {formatDate(expense.date)}
            {expense.timestamp && (
              <span className="ml-2">
                • {formatTime(expense.timestamp)}
              </span>
            )}
          </p>
        </div>
        {onDelete && (
          <button
            className="text-red-500 hover:text-red-700 text-sm"
            onClick={() => onDelete(expense.id || expense._id || expense.expenseId)}
          >
            Delete
          </button>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <p className="text-sm text-gray-600">Expense</p>
          <p className="text-lg font-medium text-red-600">
            {formatCurrency(expense.expense)}
          </p>
        </div>
        <div>
          <p className="text-sm text-gray-600">Profit</p>
          <p className="text-lg font-medium text-green-600">
            {formatCurrency(expense.profit)}
          </p>
        </div>
      </div>

      <div className="border-t pt-3">
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium text-gray-700">Net Amount:</span>
          <span className={`text-lg font-bold ${getNetAmountColor()}`}>
            {formatCurrency(getNetAmount())}
          </span>
        </div>
      </div>
    </div>
  );
};

export default ExpenseCard;