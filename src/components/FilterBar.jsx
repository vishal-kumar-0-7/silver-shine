import React, { useState } from 'react';
import { recordsAPI } from '../utils/api';

const FilterBar = ({ onFilterChange }) => {
  const [filters, setFilters] = useState({
    itemName: '',
    startDate: '',
    endDate: '',
    type: 'all' // all, expense, profit
  });

  const handleFilterChange = (name, value) => {
    const newFilters = { ...filters, [name]: value };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const clearFilters = () => {
    const clearedFilters = {
      itemName: '',
      startDate: '',
      endDate: '',
      type: 'all'
    };
    setFilters(clearedFilters);
    onFilterChange(clearedFilters);
  };

  return (
    <div className="card mb-6 px-2 sm:px-4 py-4">
      <div className="flex flex-col lg:flex-row gap-4 items-end">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 flex-1">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Item Name
            </label>
            <input
              type="text"
              value={filters.itemName}
              onChange={(e) => handleFilterChange('itemName', e.target.value)}
              placeholder="Filter by item"
              className="input-field"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Start Date
            </label>
            <input
              type="date"
              value={filters.startDate}
              onChange={(e) => handleFilterChange('startDate', e.target.value)}
              className="input-field"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              End Date
            </label>
            <input
              type="date"
              value={filters.endDate}
              onChange={(e) => handleFilterChange('endDate', e.target.value)}
              className="input-field"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Type
            </label>
            <select
              value={filters.type}
              onChange={(e) => handleFilterChange('type', e.target.value)}
              className="input-field"
            >
              <option value="all">All</option>
              <option value="expense">Expenses Only</option>
              <option value="profit">Profits Only</option>
            </select>
          </div>
        </div>

        <div className="flex gap-2 items-end mt-4 lg:mt-0">
          <button
            onClick={clearFilters}
            className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
          >
            Clear
          </button>
        </div>
      </div>
    </div>
  );
};

export default FilterBar;