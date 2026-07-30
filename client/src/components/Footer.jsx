import React from 'react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="mt-auto bg-slate-900 text-slate-200">
      <div className="mx-auto max-w-7xl px-4 py-10">
        <div className="mb-8 grid grid-cols-1 gap-8 md:grid-cols-3">
          <div>
            <h3 className="mb-4 text-lg font-semibold text-white">StreetWifi</h3>
            <p className="text-sm text-slate-400">
              Fast, simple WiFi access for busy public spaces, powered by seamless payments and smart session control.
            </p>
          </div>
          <div>
            <h4 className="mb-4 font-semibold text-white">Quick Links</h4>
            <ul className="space-y-2 text-sm text-slate-400">
              <li>
                <Link to="/" className="transition hover:text-blue-300">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/admin/login" className="transition hover:text-blue-300">
                  Admin Login
                </Link>
              </li>
              <li>
                <a href="/portal.html" className="transition hover:text-blue-300">
                  Portal
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="mb-4 font-semibold text-white">Contact</h4>
            <p className="text-sm text-slate-400">support@streetwifi.com</p>
            <p className="text-sm text-slate-400">+254 700 000 000</p>
          </div>
        </div>
        <div className="border-t border-slate-800 pt-4 text-center text-sm text-slate-500">
          <p>&copy; 2026 StreetWifi by HolyTech Ltd. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
