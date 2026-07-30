import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const navigate = useNavigate();
  const adminToken = localStorage.getItem('adminToken');

  const handleAdminLogout = () => {
    localStorage.removeItem('adminToken');
    navigate('/admin/login');
  };

  return (
    <nav className="sticky top-0 z-50 border-b border-blue-100/70 bg-gradient-to-r from-sky-700 via-blue-700 to-indigo-800 text-white shadow-lg shadow-blue-900/20">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4">
        <Link to="/" className="flex items-center space-x-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/15 text-xl backdrop-blur-sm">
            📡
          </div>
          <span className="hidden text-lg font-semibold sm:inline">StreetWifi</span>
        </Link>

        <div className="flex items-center space-x-2 sm:space-x-4">
          <button
            onClick={() => window.location.href = '/portal.html'}
            className="rounded-full px-3 py-2 text-sm font-medium transition hover:bg-white/10"
          >
            Portal
          </button>

          {adminToken ? (
            <>
              <Link
                to="/admin/dashboard"
                className="hidden rounded-full px-3 py-2 text-sm font-medium transition hover:bg-white/10 md:inline"
              >
                Dashboard
              </Link>
              <button
                onClick={handleAdminLogout}
                className="rounded-full bg-white/15 px-4 py-2 text-sm font-semibold transition hover:bg-white/25"
              >
                Admin Logout
              </button>
            </>
          ) : (
            <Link
              to="/admin/login"
              className="rounded-full bg-white/15 px-4 py-2 text-sm font-semibold transition hover:bg-white/25"
            >
              Admin
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
