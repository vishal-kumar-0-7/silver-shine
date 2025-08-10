import React from 'react';

const Header = ({ user, onLogout }) => (
  <header className="bg-white shadow-lg border-b rounded-b-2xl w-full">
    <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8">
      <div className="flex flex-col sm:flex-row justify-between items-center h-auto sm:h-20 py-3 sm:py-0 gap-2 sm:gap-0">
        <div className="flex items-center">
          <h3 className="text-xl sm:text-2xl font-extrabold text-gray-900 tracking-tight drop-shadow-sm">
            🥚 Egg Farm Tracker
          </h3>
        </div>
        <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-4 w-full sm:w-auto">
          <span className="text-gray-700 font-medium text-base sm:text-lg text-center sm:text-left w-full sm:w-auto">Welcome, {user.username}</span>
          <button
            onClick={onLogout}
            className="w-full sm:w-auto px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg shadow-sm transition font-semibold"
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  </header>
);

export default Header; 