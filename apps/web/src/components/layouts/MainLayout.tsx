import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';

export default function MainLayout() {
  const { isAuthenticated, user, logout } = useAuthStore();

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <nav className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/" className="text-2xl font-bold text-primary-600">
            LookSell
          </Link>

          <div className="flex items-center gap-6">
            <Link to="/" className="hover:text-primary-600">
              Home
            </Link>
            <Link to="/explore" className="hover:text-primary-600">
              Explore
            </Link>

            {isAuthenticated ? (
              <>
                <Link to="/library" className="hover:text-primary-600">
                  Library
                </Link>
                {user?.role === 'creator' && (
                  <Link to="/dashboard" className="hover:text-primary-600">
                    Dashboard
                  </Link>
                )}
                <Link to="/settings" className="hover:text-primary-600">
                  Settings
                </Link>
                <button onClick={logout} className="btn-secondary">
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="btn-secondary">
                  Login
                </Link>
                <Link to="/register" className="btn-primary">
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </nav>
      </header>

      {/* Main Content */}
      <main className="flex-1 container mx-auto px-4 py-8">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-gray-100 dark:bg-gray-800 py-8 mt-auto">
        <div className="container mx-auto px-4 text-center text-gray-600 dark:text-gray-400">
          <p>&copy; 2025 LookSell. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
