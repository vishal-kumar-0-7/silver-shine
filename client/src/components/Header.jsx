import React from 'react';

const Header = ({ user, onLogout }) => {
  return (
    <header className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-xl font-bold">🥚 Egg Farm Tracker</h1>
        </div>
        <div className="flex items-center gap-4">
          {user && (
            <div className="text-sm text-gray-700">Signed in as <strong>{user.username}</strong></div>
          )}
          {onLogout && (
            <button
              onClick={onLogout}
              className="px-3 py-1 rounded-md bg-red-600 text-white hover:bg-red-700"
            >
              Logout
            </button>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
