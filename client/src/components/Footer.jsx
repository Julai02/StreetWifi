import React from 'react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="bg-dark-red text-white mt-auto">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          <div>
            <h3 className="font-bold text-lg mb-4">StreetWifi</h3>
            <p className="text-light-red text-sm">
              High-speed WiFi access for everyone in the streets. Developed by HolyTech Ltd.
            </p>
          </div>
          <div>
            <h4 className="font-bold mb-4">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/" className="hover:text-light-red transition">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/login" className="hover:text-light-red transition">
                  Login
                </Link>
              </li>
              <li>
                <Link to="/register" className="hover:text-light-red transition">
                  Register
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold mb-4">Contact</h4>
            <p className="text-sm text-light-red">support@streetwifi.com</p>
            <p className="text-sm text-light-red">+254 XXX XXX XXX</p>
          </div>
        </div>
        <div className="border-t border-red-700 pt-4 text-center text-sm text-light-red">
          <p>&copy; 2026 StreetWifi by HolyTech Ltd. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
