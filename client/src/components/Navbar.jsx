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
    <nav className="bg-gradient-to-r from-primary-red to-dark-red text-white shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
        <Link to="/" className="flex items-center space-x-2">
          <div className="bg-white text-primary-red font-bold px-3 py-2 rounded-lg text-lg">
            📡
          </div>
          <span className="font-bold text-xl hidden sm:inline">StreetWifi</span>
        </Link>

        <div className="flex items-center space-x-6">
          <button
            onClick={() => window.location.href = '/portal.html'}
            className="hover:bg-dark-red px-3 py-2 rounded transition"
          >
            Portal
          </button>

          {adminToken ? (
            <>
              <Link
                to="/admin/dashboard"
                className="hidden md:inline hover:bg-dark-red px-3 py-2 rounded transition"
              >
                Dashboard
              </Link>
              <button
                onClick={handleAdminLogout}
                className="bg-light-red text-primary-red px-4 py-2 rounded font-semibold hover:bg-red-200 transition"
              >
                Admin Logout
              </button>
            </>
          ) : (
            <Link
              to="/admin/login"
              className="bg-light-red text-primary-red px-4 py-2 rounded font-semibold hover:bg-red-200 transition"
            >
              Admin
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
