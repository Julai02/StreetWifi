import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { sessionAPI, paymentAPI } from '../utils/api';
import SessionCard from '../components/SessionCard';

export default function DashboardPage() {
  const [session, setSession] = useState(null);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [extendHours, setExtendHours] = useState(1);
  const [extendLoading, setExtendLoading] = useState(false);
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    fetchSessionData();
  }, [isAuthenticated, navigate]);

  const fetchSessionData = async () => {
    try {
      setLoading(true);
      const [sessionRes, summaryRes] = await Promise.all([
        sessionAPI.getCurrentSession(),
        sessionAPI.getSessionSummary(),
      ]);

      setSession(sessionRes.data.session);
      setSummary(summaryRes.data);
      setError('');
    } catch (err) {
      const message = err.response?.data?.message || err.message;
      if (message.includes('No active session')) {
        setSession(null);
      } else {
        setError(message);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleExtendSession = async () => {
    try {
      setExtendLoading(true);
      await sessionAPI.extendSession(extendHours);
      await fetchSessionData();
      setExtendHours(1);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to extend session');
    } finally {
      setExtendLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-light-red to-white py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Welcome Section */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h1 className="text-3xl font-bold text-blue-600 mb-2">
            Welcome, {user?.firstName}!
          </h1>
          <p className="text-gray-600">
            Manage your WiFi session and purchase internet access below.
          </p>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        {/* Session Card or Buy Section */}
        {session ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="md:col-span-2">
              <SessionCard session={session} />
            </div>

            {/* Extend Session Card */}
            <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-primary-red">
              <h3 className="text-lg font-bold text-primary-red mb-4">Extend Session</h3>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Buy More Hours
                </label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    min="1"
                    value={extendHours}
                    onChange={(e) => setExtendHours(parseInt(e.target.value))}
                    className="flex-1 px-3 py-2 border-2 border-gray-300 rounded focus:outline-none focus:border-primary-red"
                  />
                  <span className="text-2xl font-bold text-primary-red py-2">
                    {extendHours * 10} KES
                  </span>
                </div>
                <button
                  onClick={handleExtendSession}
                  disabled={extendLoading}
                  className="w-full mt-4 bg-primary-red text-white font-bold py-2 rounded hover:bg-dark-red transition disabled:opacity-50"
                >
                  {extendLoading ? 'Processing...' : 'Buy & Extend'}
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-gradient-to-r from-light-red to-red-100 rounded-lg shadow-md p-8 text-center mb-6">
            <h2 className="text-2xl font-bold text-primary-red mb-4">No Active Session</h2>
            <p className="text-gray-600 mb-6">
              You don't have an active internet session. Purchase access below to get started!
            </p>
            <button
              onClick={() => navigate('/payment')}
              className="bg-gradient-to-r from-primary-red to-dark-red text-white font-bold px-8 py-3 rounded-lg hover:shadow-lg transition inline-block"
            >
              Buy Internet Access
            </button>
          </div>
        )}

        {/* Summary Stats */}
        {summary && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-lg shadow-md p-4 text-center">
              <p className="text-gray-600 text-sm">Total Spent</p>
              <p className="text-2xl font-bold text-primary-red">{summary.totalPaid} KES</p>
            </div>
            <div className="bg-white rounded-lg shadow-md p-4 text-center">
              <p className="text-gray-600 text-sm">Hours Purchased</p>
              <p className="text-2xl font-bold text-primary-red">
                {summary.totalHoursPurchased}h
              </p>
            </div>
            <div className="bg-white rounded-lg shadow-md p-4 text-center">
              <p className="text-gray-600 text-sm">Transactions</p>
              <p className="text-2xl font-bold text-primary-red">
                {summary.totalTransactions}
              </p>
            </div>
            <div className="bg-white rounded-lg shadow-md p-4 text-center">
              <p className="text-gray-600 text-sm">Status</p>
              <p className="text-lg font-bold text-green-600">Active</p>
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-xl font-bold text-primary-red mb-4">Quick Actions</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <button
              onClick={() => navigate('/payment')}
              className="bg-primary-red text-white py-2 rounded hover:bg-dark-red transition font-semibold"
            >
              Buy Hours
            </button>
            <button
              onClick={() => navigate('/transactions')}
              className="bg-primary-red text-white py-2 rounded hover:bg-dark-red transition font-semibold"
            >
              View History
            </button>
            <button
              onClick={fetchSessionData}
              className="bg-primary-red text-white py-2 rounded hover:bg-dark-red transition font-semibold"
            >
              Refresh
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
