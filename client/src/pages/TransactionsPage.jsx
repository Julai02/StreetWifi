import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { paymentAPI } from '../utils/api';

export default function TransactionsPage() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState(null);
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    fetchPaymentHistory();
  }, [isAuthenticated, navigate, page]);

  const fetchPaymentHistory = async () => {
    try {
      setLoading(true);
      const response = await paymentAPI.getPaymentHistory(page, 10);
      setPayments(response.data.payments);
      setPagination(response.data.pagination);
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch payment history');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-light-red to-white py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h1 className="text-3xl font-bold text-primary-red mb-2">Transaction History</h1>
          <p className="text-gray-600">
            View all your WiFi purchases and payment information.
          </p>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="spinner"></div>
          </div>
        ) : payments.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <p className="text-gray-600 text-lg mb-4">No transactions yet</p>
            <button
              onClick={() => navigate('/payment')}
              className="bg-primary-red text-white px-6 py-2 rounded hover:bg-dark-red transition font-semibold"
            >
              Buy Internet Access
            </button>
          </div>
        ) : (
          <>
            {/* Table */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <table className="w-full">
                <thead className="bg-primary-red text-white">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-semibold">Date</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold">Amount</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold">Hours</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold">Status</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold">Expiry</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold">Txn ID</th>
                  </tr>
                </thead>
                <tbody>
                  {payments.map((payment, index) => (
                    <tr key={index} className="border-t hover:bg-light-red transition">
                      <td className="px-6 py-3 text-sm">
                        {new Date(payment.createdAt).toLocaleDateString()}{' '}
                        {new Date(payment.createdAt).toLocaleTimeString()}
                      </td>
                      <td className="px-6 py-3 text-sm font-semibold">{payment.amount} KES</td>
                      <td className="px-6 py-3 text-sm">{payment.hoursAllowed}h</td>
                      <td className="px-6 py-3 text-sm">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold capitalize ${getStatusColor(
                            payment.status
                          )}`}
                        >
                          {payment.status}
                        </span>
                      </td>
                      <td className="px-6 py-3 text-sm">
                        {payment.expiryTime
                          ? new Date(payment.expiryTime).toLocaleDateString()
                          : 'N/A'}
                      </td>
                      <td className="px-6 py-3 text-xs text-gray-600 font-mono">
                        {payment.transactionId ? payment.transactionId.substring(0, 8) + '...' : 'N/A'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {pagination && pagination.pages > 1 && (
              <div className="mt-6 flex justify-center items-center space-x-4">
                <button
                  onClick={() => setPage(Math.max(1, page - 1))}
                  disabled={page === 1}
                  className="px-4 py-2 bg-primary-red text-white rounded hover:bg-dark-red disabled:opacity-50 transition"
                >
                  Previous
                </button>
                <div className="flex items-center space-x-2">
                  {Array.from({ length: pagination.pages }).map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setPage(i + 1)}
                      className={`px-3 py-2 rounded ${
                        page === i + 1
                          ? 'bg-primary-red text-white'
                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }`}
                    >
                      {i + 1}
                    </button>
                  ))}
                </div>
                <button
                  onClick={() => setPage(Math.min(pagination.pages, page + 1))}
                  disabled={page === pagination.pages}
                  className="px-4 py-2 bg-primary-red text-white rounded hover:bg-dark-red disabled:opacity-50 transition"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
