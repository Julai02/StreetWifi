import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminAPI } from '../utils/api';

export default function AdminDashboardPage() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('overview');
  const [users, setUsers] = useState([]);
  const [payments, setPayments] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [routers, setRouters] = useState([]);
  const [adminUser, setAdminUser] = useState(null);
  const [showAddRouter, setShowAddRouter] = useState(false);
  const [routerFormData, setRouterFormData] = useState({
    name: '',
    macAddress: '',
    location: '',
    ipAddress: '',
    bandwidth: '10Mbps',
    description: '',
  });
  const navigate = useNavigate();

  useEffect(() => {
    const adminToken = localStorage.getItem('adminToken');
    const adminData = localStorage.getItem('adminUser');

    if (!adminToken || !adminData) {
      navigate('/admin/login');
      return;
    }

    setAdminUser(JSON.parse(adminData));
    fetchDashboardData();
  }, [navigate]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      const [statsRes, usersRes, paymentsRes, sessionsRes, routersRes] = await Promise.all([
        adminAPI.getDashboardStats(),
        adminAPI.getAllUsers(1, 10),
        adminAPI.getAllPayments(1, 10),
        adminAPI.getActiveSessions(1, 10),
        fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/admin/routers`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('adminToken')}` },
        }).then(r => r.json()),
      ]);

      // responses received

      setStats(statsRes.data.stats);
      setUsers(usersRes.data.users);
      setPayments(paymentsRes.data.payments);
      setSessions(sessionsRes.data.sessions);
      setRouters(routersRes.routers || []);
      setError('');
      console.log('Dashboard data loaded successfully');
    } catch (err) {
      console.error('Dashboard fetch error:', err);
      setError(err.response?.data?.message || 'Failed to fetch dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');
    navigate('/admin/login');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Admin Navbar */}
      <nav className="bg-gradient-to-r from-primary-red to-dark-red text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold">StreetWifi Admin</h1>
          <div className="flex items-center space-x-4">
            <span className="text-sm">Hi, {adminUser?.fullName}</span>
            <button
              onClick={handleLogout}
              className="bg-light-red text-primary-red px-4 py-2 rounded font-semibold hover:bg-red-200 transition"
            >
              Logout
            </button>
          </div>
        </div>
      </nav>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 m-4 rounded">
          {error}
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Tab Navigation */}
        <div className="flex space-x-4 mb-6 border-b border-gray-300 overflow-x-auto">
          {['overview', 'users', 'payments', 'sessions', 'routers'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 font-semibold whitespace-nowrap ${
                activeTab === tab
                  ? 'border-b-2 border-primary-red text-primary-red'
                  : 'text-gray-600 hover:text-primary-red'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && stats && (
          <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white rounded-lg shadow-md p-6">
                <p className="text-gray-600 text-sm">Total Users</p>
                <p className="text-3xl font-bold text-primary-red">{stats.users.total}</p>
                <p className="text-xs text-green-600">Active: {stats.users.active}</p>
              </div>
              <div className="bg-white rounded-lg shadow-md p-6">
                <p className="text-gray-600 text-sm">Total Revenue</p>
                <p className="text-3xl font-bold text-primary-red">{stats.payments.totalRevenue} KES</p>
                <p className="text-xs text-gray-600">{stats.payments.completed} completed</p>
              </div>
              <div className="bg-white rounded-lg shadow-md p-6">
                <p className="text-gray-600 text-sm">Active Sessions</p>
                <p className="text-3xl font-bold text-primary-red">{stats.sessions.active}</p>
                <p className="text-xs text-yellow-600">Grace period: {stats.sessions.gracePeriod}</p>
              </div>
              <div className="bg-white rounded-lg shadow-md p-6">
                <p className="text-gray-600 text-sm">Total Transactions</p>
                <p className="text-3xl font-bold text-primary-red">{stats.payments.total}</p>
              </div>
            </div>

            {/* Top Users */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold text-primary-red mb-4">Top Paying Users</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-light-red">
                    <tr>
                      <th className="px-4 py-2 text-left">Name</th>
                      <th className="px-4 py-2 text-left">Phone</th>
                      <th className="px-4 py-2 text-right">Total Spent</th>
                      <th className="px-4 py-2 text-right">Transactions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.topUsers.map((user, idx) => (
                      <tr key={idx} className="border-t hover:bg-light-red">
                        <td className="px-4 py-2">{user.name}</td>
                        <td className="px-4 py-2">{user.phoneNumber}</td>
                        <td className="px-4 py-2 text-right font-semibold">
                          {user.totalSpent} KES
                        </td>
                        <td className="px-4 py-2 text-right">{user.transactions}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Daily Revenue Chart */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold text-primary-red mb-4">Recent Daily Revenue</h2>
              <div className="space-y-2">
                {stats.dailyRevenue.slice(0, 10).map((day, idx) => (
                  <div key={idx} className="flex items-center">
                    <span className="w-24">{day._id}</span>
                    <div className="flex-1 h-6 bg-light-red rounded">
                      <div
                        className="h-full bg-primary-red rounded"
                        style={{
                          width: `${(day.revenue / Math.max(...stats.dailyRevenue.map(d => d.revenue))) * 100}%`,
                        }}
                      />
                    </div>
                    <span className="ml-4 font-semibold">{day.revenue} KES ({day.transactions} txn)</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold text-primary-red mb-4">Users Management</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-light-red">
                  <tr>
                    <th className="px-4 py-2 text-left">Name</th>
                    <th className="px-4 py-2 text-left">Phone</th>
                    <th className="px-4 py-2 text-left">Email</th>
                    <th className="px-4 py-2 text-center">Status</th>
                    <th className="px-4 py-2 text-left">Joined</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user._id} className="border-t hover:bg-light-red">
                      <td className="px-4 py-2 font-semibold">
                        {user.firstName} {user.lastName}
                      </td>
                      <td className="px-4 py-2">{user.phoneNumber}</td>
                      <td className="px-4 py-2 text-sm">{user.email || 'N/A'}</td>
                      <td className="px-4 py-2 text-center">
                        <span
                          className={`px-2 py-1 rounded text-xs ${
                            user.isActive
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {user.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-4 py-2 text-sm">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Payments Tab */}
        {activeTab === 'payments' && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold text-primary-red mb-4">Payment Transactions</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-light-red">
                  <tr>
                    <th className="px-4 py-2 text-left">User</th>
                    <th className="px-4 py-2 text-left">Amount</th>
                    <th className="px-4 py-2 text-left">Hours</th>
                    <th className="px-4 py-2 text-left">Status</th>
                    <th className="px-4 py-2 text-left">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {payments.map((payment, idx) => (
                    <tr key={idx} className="border-t hover:bg-light-red">
                      <td className="px-4 py-2">
                        <div>
                          <p className="font-semibold">{payment.userId?.firstName} {payment.userId?.lastName}</p>
                          <p className="text-xs text-gray-600">{payment.userId?.phoneNumber}</p>
                        </div>
                      </td>
                      <td className="px-4 py-2 font-semibold">{payment.amount} KES</td>
                      <td className="px-4 py-2">{payment.hoursAllowed}h</td>
                      <td className="px-4 py-2">
                        <span
                          className={`px-2 py-1 rounded text-xs ${
                            payment.status === 'completed'
                              ? 'bg-green-100 text-green-800'
                              : payment.status === 'pending'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {payment.status}
                        </span>
                      </td>
                      <td className="px-4 py-2 text-sm">
                        {new Date(payment.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Sessions Tab */}
        {activeTab === 'sessions' && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold text-primary-red mb-4">Active Sessions</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-light-red">
                  <tr>
                    <th className="px-4 py-2 text-left">User</th>
                    <th className="px-4 py-2 text-left">Status</th>
                    <th className="px-4 py-2 text-left">Time Remaining</th>
                    <th className="px-4 py-2 text-left">Started</th>
                    <th className="px-4 py-2 text-left">Expires</th>
                  </tr>
                </thead>
                <tbody>
                  {sessions.map((session, idx) => (
                    <tr key={idx} className="border-t hover:bg-light-red">
                      <td className="px-4 py-2">
                        <div>
                          <p className="font-semibold">
                            {session.userId?.firstName} {session.userId?.lastName}
                          </p>
                          <p className="text-xs text-gray-600">{session.userId?.phoneNumber}</p>
                        </div>
                      </td>
                      <td className="px-4 py-2">
                        <span
                          className={`px-2 py-1 rounded text-xs ${
                            session.status === 'active'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-yellow-100 text-yellow-800'
                          }`}
                        >
                          {session.status}
                        </span>
                      </td>
                      <td className="px-4 py-2 font-semibold">
                        {Math.floor(session.timeRemaining / 3600)}h{' '}
                        {Math.floor((session.timeRemaining % 3600) / 60)}m
                      </td>
                      <td className="px-4 py-2 text-sm">
                        {new Date(session.startTime).toLocaleString()}
                      </td>
                      <td className="px-4 py-2 text-sm">
                        {new Date(session.expiryTime).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Routers Tab */}
        {activeTab === 'routers' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-primary-red">WiFi Routers</h2>
                <button
                  onClick={() => setShowAddRouter(!showAddRouter)}
                  className="bg-primary-red text-white px-4 py-2 rounded font-semibold hover:bg-dark-red transition"
                >
                  {showAddRouter ? 'Cancel' : '+ Add Router'}
                </button>
              </div>

              {showAddRouter && (
                <div className="bg-light-red p-6 rounded-lg mb-6">
                  <h3 className="text-lg font-bold text-primary-red mb-4">Add New Router</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input
                      type="text"
                      placeholder="Router Name"
                      value={routerFormData.name}
                      onChange={(e) => setRouterFormData({ ...routerFormData, name: e.target.value })}
                      className="p-2 border border-gray-300 rounded"
                    />
                    <input
                      type="text"
                      placeholder="MAC Address (e.g., AA:BB:CC:DD:EE:FF)"
                      value={routerFormData.macAddress}
                      onChange={(e) => setRouterFormData({ ...routerFormData, macAddress: e.target.value })}
                      className="p-2 border border-gray-300 rounded"
                    />
                    <input
                      type="text"
                      placeholder="Location"
                      value={routerFormData.location}
                      onChange={(e) => setRouterFormData({ ...routerFormData, location: e.target.value })}
                      className="p-2 border border-gray-300 rounded"
                    />
                    <input
                      type="text"
                      placeholder="IP Address (optional)"
                      value={routerFormData.ipAddress}
                      onChange={(e) => setRouterFormData({ ...routerFormData, ipAddress: e.target.value })}
                      className="p-2 border border-gray-300 rounded"
                    />
                    <select
                      value={routerFormData.bandwidth}
                      onChange={(e) => setRouterFormData({ ...routerFormData, bandwidth: e.target.value })}
                      className="p-2 border border-gray-300 rounded"
                    >
                      <option value="1Mbps">1 Mbps</option>
                      <option value="5Mbps">5 Mbps</option>
                      <option value="10Mbps">10 Mbps (Default)</option>
                      <option value="25Mbps">25 Mbps</option>
                      <option value="50Mbps">50 Mbps</option>
                      <option value="100Mbps">100 Mbps</option>
                    </select>
                    <textarea
                      placeholder="Description (optional)"
                      value={routerFormData.description}
                      onChange={(e) => setRouterFormData({ ...routerFormData, description: e.target.value })}
                      className="p-2 border border-gray-300 rounded col-span-1 md:col-span-2"
                      rows="3"
                    />
                  </div>
                  <button
                    onClick={async () => {
                      try {
                        const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/admin/routers`, {
                          method: 'POST',
                          headers: {
                            'Content-Type': 'application/json',
                            Authorization: `Bearer ${localStorage.getItem('adminToken')}`,
                          },
                          body: JSON.stringify(routerFormData),
                        });
                        const data = await response.json();
                        if (data.success) {
                          setRouters([...routers, data.router]);
                          setRouterFormData({
                            name: '',
                            macAddress: '',
                            location: '',
                            ipAddress: '',
                            bandwidth: '10Mbps',
                            description: '',
                          });
                          setShowAddRouter(false);
                        } else {
                          setError(data.message);
                        }
                      } catch (err) {
                        console.error('Create router error:', err);
                        setError(err.response?.data?.message || 'Failed to create router');
                      }
                    }}
                    className="mt-4 bg-primary-red text-white px-6 py-2 rounded font-semibold hover:bg-dark-red transition"
                  >
                    Create Router
                  </button>
                </div>
              )}

              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-light-red">
                    <tr>
                      <th className="px-4 py-2 text-left">Name</th>
                      <th className="px-4 py-2 text-left">MAC Address</th>
                      <th className="px-4 py-2 text-left">Location</th>
                      <th className="px-4 py-2 text-left">Bandwidth</th>
                      <th className="px-4 py-2 text-center">Status</th>
                      <th className="px-4 py-2 text-left">Portal URL</th>
                    </tr>
                  </thead>
                  <tbody>
                    {routers.length > 0 ? (
                      routers.map((router) => (
                        <tr key={router._id} className="border-t hover:bg-light-red">
                          <td className="px-4 py-2 font-semibold">{router.name}</td>
                          <td className="px-4 py-2 text-xs font-mono">{router.macAddress}</td>
                          <td className="px-4 py-2">{router.location}</td>
                          <td className="px-4 py-2">{router.bandwidth}</td>
                          <td className="px-4 py-2 text-center">
                            <span
                              className={`px-2 py-1 rounded text-xs ${
                                router.status === 'active'
                                  ? 'bg-green-100 text-green-800'
                                  : router.status === 'inactive'
                                  ? 'bg-gray-100 text-gray-800'
                                  : 'bg-yellow-100 text-yellow-800'
                              }`}
                            >
                              {router.status}
                            </span>
                          </td>
                          <td className="px-4 py-2 text-xs">
                            <code className="bg-gray-200 px-2 py-1 rounded">
                              {router.portalUrl}
                            </code>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="6" className="px-4 py-6 text-center text-gray-600">
                          No routers added yet. Click "Add Router" to get started.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
