import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { paymentAPI } from '../utils/api';

export default function PaymentPage() {
  const [hours, setHours] = useState(1);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [lastPayment, setLastPayment] = useState(null);
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  const handleInitiatePayment = async () => {
    try {
      setError('');
      setMessage('');
      setLoading(true);

      const response = await paymentAPI.initiatePayment(hours);
      setMessage(response.data.message);
      setLastPayment(response.data.payment);

      // Clear message after 5 seconds
      setTimeout(() => setMessage(''), 5000);
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Failed to initiate payment';
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickBuy = (numHours) => {
    setHours(numHours);
    setTimeout(() => handleInitiatePayment(), 0);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-light-red to-white py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h1 className="text-3xl font-bold text-primary-red mb-2">Buy Internet Access</h1>
          <p className="text-gray-600">
            Select hours of WiFi access. Just 10 KES per hour!
          </p>
        </div>

        {message && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-6">
            <p className="font-semibold">✓ {message}</p>
            <p className="text-sm mt-1">Check your phone for payment prompt. Enter your M-Pesa PIN to confirm.</p>
          </div>
        )}

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Main Payment Form */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold text-primary-red mb-6">Custom Hours</h2>

            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Select Hours
              </label>
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => setHours(Math.max(1, hours - 1))}
                  className="bg-gray-300 text-gray-700 px-4 py-2 rounded font-bold hover:bg-gray-400"
                >
                  −
                </button>
                <input
                  type="number"
                  min="1"
                  max="24"
                  value={hours}
                  onChange={(e) => setHours(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-20 text-center text-2xl font-bold border-2 border-primary-red rounded px-2 py-1"
                />
                <button
                  onClick={() => setHours(Math.min(24, hours + 1))}
                  className="bg-gray-300 text-gray-700 px-4 py-2 rounded font-bold hover:bg-gray-400"
                >
                  +
                </button>
              </div>
              <p className="text-xs text-gray-600 mt-2">Max 24 hours per purchase</p>
            </div>

            {/* Price Breakdown */}
            <div className="bg-light-red rounded-lg p-4 mb-6">
              <div className="flex justify-between mb-2">
                <span className="text-gray-700">{hours} hour(s) × 10 KES</span>
                <span className="font-semibold">{hours * 10} KES</span>
              </div>
              <div className="border-t border-primary-red pt-2">
                <div className="flex justify-between text-lg font-bold">
                  <span>Total:</span>
                  <span className="text-primary-red">{hours * 10} KES</span>
                </div>
              </div>
            </div>

            <button
              onClick={handleInitiatePayment}
              disabled={loading}
              className="w-full bg-gradient-to-r from-primary-red to-dark-red text-white font-bold py-3 rounded-lg hover:shadow-lg transition disabled:opacity-50"
            >
              {loading ? 'Processing...' : `Pay ${hours * 10} KES`}
            </button>

            <p className="text-xs text-gray-600 text-center mt-4">
              💳 Powered by PayHero - Fast & Secure M-Pesa payments
            </p>
          </div>

          {/* Quick Buy Cards */}
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-primary-red">Quick Buy</h2>

            {[1, 2, 5, 10].map((numHours) => (
              <button
                key={numHours}
                onClick={() => handleQuickBuy(numHours)}
                disabled={loading}
                className="w-full bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition border-l-4 border-primary-red disabled:opacity-50"
              >
                <div className="flex justify-between items-center">
                  <div className="text-left">
                    <p className="font-bold text-primary-red">{numHours} Hour{numHours > 1 ? 's' : ''}</p>
                    <p className="text-xs text-gray-600">High-speed WiFi access</p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-primary-red">{numHours * 10} KES</p>
                    <p className="text-xs text-gray-600">10 KES/hr</p>
                  </div>
                </div>
              </button>
            ))}

            {/* Info Box */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-semibold text-blue-900 mb-2">📋 How it works:</h3>
              <ul className="text-xs text-blue-800 space-y-1">
                <li>✓ Select hours and click buy</li>
                <li>✓ Enter your M-Pesa PIN</li>
                <li>✓ Session starts immediately</li>
                <li>✓ Auto-disconnect after expiry</li>
                <li>✓ Grace period: 1 minute</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Last Payment Info */}
        {lastPayment && (
          <div className="mt-6 bg-green-50 border border-green-200 rounded-lg p-4">
            <p className="text-sm text-green-800">
              <strong>Payment ID:</strong> {lastPayment.id} | <strong>Amount:</strong> {lastPayment.amount} KES |{' '}
              <strong>Status:</strong> {lastPayment.status}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
