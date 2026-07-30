import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminAPI } from '../utils/api';

const tabs = ['overview', 'users', 'payments', 'sessions', 'routers'];

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
        }).then((r) => r.json()),
      ]);

      setStats(statsRes.data.stats);
      setUsers(usersRes.data.users);
      setPayments(paymentsRes.data.payments);
      setSessions(sessionsRes.data.sessions);
      setRouters(routersRes.routers || []);
      setError('');
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
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="spinner" />
      </div>
    );
  }

  const revenueValues = stats?.dailyRevenue?.map((day) => day.revenue) || [];
  const maxRevenue = Math.max(...revenueValues, 1);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
      <nav className="border-b border-blue-100 bg-gradient-to-r from-sky-700 via-blue-700 to-indigo-800 text-white shadow-lg shadow-blue-900/20">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4">
          <div>
            <h1 className="text-2xl font-semibold">StreetWifi Admin</h1>
            <p className="text-sm text-blue-100">Operations and revenue overview</p>
          </div>
          <div className="flex items-center space-x-3">
            <span className="hidden rounded-full bg-white/10 px-3 py-1 text-sm sm:inline">
              Hi, {adminUser?.fullName}
            </span>
            <button
              onClick={handleLogout}
              className="rounded-full bg-white/15 px-4 py-2 text-sm font-semibold transition hover:bg-white/25"
            >
              Logout
            </button>
          </div>
        </div>
      </nav>

      {error && (
        <div className="mx-4 mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="mx-auto max-w-7xl px-4 py-8">
        <div className="mb-6 flex gap-2 overflow-x-auto rounded-2xl border border-blue-100 bg-white p-2 shadow-sm">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`rounded-full px-4 py-2 text-sm font-semibold whitespace-nowrap transition ${
                activeTab === tab
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-600 hover:bg-blue-50 hover:text-blue-700'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {activeTab === 'overview' && stats && (
          <div className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <div className="rounded-2xl border border-blue-100 bg-white p-6 shadow-sm">
                <p className="text-sm text-slate-500">Total Users</p>
                <p className="mt-2 text-3xl font-bold text-blue-700">{stats.users.total}</p>
                <p className="mt-1 text-sm text-emerald-600">Active: {stats.users.active}</p>
              </div>
              <div className="rounded-2xl border border-blue-100 bg-white p-6 shadow-sm">
                <p className="text-sm text-slate-500">Total Revenue</p>
                <p className="mt-2 text-3xl font-bold text-blue-700">{stats.payments.totalRevenue} KES</p>
                <p className="mt-1 text-sm text-slate-500">{stats.payments.completed} completed</p>
              </div>
              <div className="rounded-2xl border border-blue-100 bg-white p-6 shadow-sm">
                <p className="text-sm text-slate-500">Active Sessions</p>
                <p className="mt-2 text-3xl font-bold text-blue-700">{stats.sessions.active}</p>
                <p className="mt-1 text-sm text-amber-600">Grace period: {stats.sessions.gracePeriod}</p>
              </div>
              <div className="rounded-2xl border border-blue-100 bg-white p-6 shadow-sm">
                <p className="text-sm text-slate-500">Transactions</p>
                <p className="mt-2 text-3xl font-bold text-blue-700">{stats.payments.total}</p>
              </div>
            </div>

            <div className="rounded-2xl border border-blue-100 bg-white p-6 shadow-sm">
              <h2 className="mb-4 text-xl font-semibold text-blue-700">Top Paying Users</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-blue-50 text-slate-700">
                    <tr>
                      <th className="px-4 py-2 text-left">Name</th>
                      <th className="px-4 py-2 text-left">Phone</th>
                      <th className="px-4 py-2 text-right">Total Spent</th>
                      <th className="px-4 py-2 text-right">Transactions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.topUsers.map((user, idx) => (
                      <tr key={idx} className="border-t border-slate-100 hover:bg-blue-50">
                        <td className="px-4 py-3">{user.name}</td>
                        <td className="px-4 py-3">{user.phoneNumber}</td>
                        <td className="px-4 py-3 text-right font-semibold">{user.totalSpent} KES</td>
                        <td className="px-4 py-3 text-right">{user.transactions}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="rounded-2xl border border-blue-100 bg-white p-6 shadow-sm">
              <h2 className="mb-4 text-xl font-semibold text-blue-700">Recent Daily Revenue</h2>
              <div className="space-y-3">
                {(stats.dailyRevenue || []).slice(0, 10).map((day, idx) => (
                  <div key={idx} className="flex items-center gap-3">
                    <span className="w-24 text-sm text-slate-500">{day._id}</span>
                    <div className="h-2 flex-1 rounded-full bg-blue-50">
                      <div
                        className="h-2 rounded-full bg-gradient-to-r from-sky-600 to-blue-700"
                        style={{ width: `${(day.revenue / maxRevenue) * 100}%` }}
                      />
                    </div>
                    <span className="min-w-[8rem] text-sm font-semibold text-slate-700">
                      {day.revenue} KES ({day.transactions} txn)
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'users' && (
          <div className="rounded-2xl border border-blue-100 bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-xl font-semibold text-blue-700">Users Management</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-blue-50 text-slate-700">
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
                    <tr key={user._id} className="border-t border-slate-100 hover:bg-blue-50">
                      <td className="px-4 py-3 font-semibold">{user.firstName} {user.lastName}</td>
                      <td className="px-4 py-3">{user.phoneNumber}</td>
                      <td className="px-4 py-3 text-sm">{user.email || 'N/A'}</td>
                      <td className="px-4 py-3 text-center">
                        <span className={`rounded-full px-2.5 py-1 text-xs ${user.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                          {user.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm">{new Date(user.createdAt).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'payments' && (
          <div className="rounded-2xl border border-blue-100 bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-xl font-semibold text-blue-700">Payment Transactions</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-blue-50 text-slate-700">
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
                    <tr key={idx} className="border-t border-slate-100 hover:bg-blue-50">
                      <td className="px-4 py-3">
                        <div>
                          <p className="font-semibold">{payment.userId?.firstName} {payment.userId?.lastName}</p>
                          <p className="text-xs text-slate-500">{payment.userId?.phoneNumber}</p>
                        </div>
                      </td>
                      <td className="px-4 py-3 font-semibold">{payment.amount} KES</td>
                      <td className="px-4 py-3">{payment.hoursAllowed}h</td>
                      <td className="px-4 py-3">
                        <span className={`rounded-full px-2.5 py-1 text-xs ${payment.status === 'completed' ? 'bg-emerald-100 text-emerald-700' : payment.status === 'pending' ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'}`}>
                          {payment.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm">{new Date(payment.createdAt).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'sessions' && (
          <div className="rounded-2xl border border-blue-100 bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-xl font-semibold text-blue-700">Active Sessions</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-blue-50 text-slate-700">
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
                    <tr key={idx} className="border-t border-slate-100 hover:bg-blue-50">
                      <td className="px-4 py-3">
                        <div>
                          <p className="font-semibold">{session.userId?.firstName} {session.userId?.lastName}</p>
                          <p className="text-xs text-slate-500">{session.userId?.phoneNumber}</p>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`rounded-full px-2.5 py-1 text-xs ${session.status === 'active' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                          {session.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-semibold">{Math.floor(session.timeRemaining / 3600)}h {Math.floor((session.timeRemaining % 3600) / 60)}m</td>
                      <td className="px-4 py-3 text-sm">{new Date(session.startTime).toLocaleString()}</td>
                      <td className="px-4 py-3 text-sm">{new Date(session.expiryTime).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'routers' && (
          <div className="space-y-6">
            <div className="rounded-2xl border border-blue-100 bg-white p-6 shadow-sm">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-xl font-semibold text-blue-700">WiFi Routers</h2>
                <button
                  onClick={() => setShowAddRouter(!showAddRouter)}
                  className="rounded-full bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700"
                >
                  {showAddRouter ? 'Cancel' : '+ Add Router'}
                </button>
              </div>

              {showAddRouter && (
                <div className="mb-6 rounded-2xl border border-blue-100 bg-blue-50 p-6">
                  <h3 className="mb-4 text-lg font-semibold text-blue-700">Add New Router</h3>
                  <div className="grid gap-4 md:grid-cols-2">
                    <input
                      type="text"
                      placeholder="Router Name"
                      value={routerFormData.name}
                      onChange={(e) => setRouterFormData({ ...routerFormData, name: e.target.value })}
                      className="rounded-xl border border-slate-200 bg-white p-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                    />
                    <input
                      type="text"
                      placeholder="MAC Address (e.g., AA:BB:CC:DD:EE:FF)"
                      value={routerFormData.macAddress}
                      onChange={(e) => setRouterFormData({ ...routerFormData, macAddress: e.target.value })}
                      className="rounded-xl border border-slate-200 bg-white p-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                    />
                    <input
                      type="text"
                      placeholder="Location"
                      value={routerFormData.location}
                      onChange={(e) => setRouterFormData({ ...routerFormData, location: e.target.value })}
                      className="rounded-xl border border-slate-200 bg-white p-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                    />
                    <input
                      type="text"
                      placeholder="IP Address (optional)"
                      value={routerFormData.ipAddress}
                      onChange={(e) => setRouterFormData({ ...routerFormData, ipAddress: e.target.value })}
                      className="rounded-xl border border-slate-200 bg-white p-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                    />
                    <select
                      value={routerFormData.bandwidth}
                      onChange={(e) => setRouterFormData({ ...routerFormData, bandwidth: e.target.value })}
                      className="rounded-xl border border-slate-200 bg-white p-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
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
                      className="col-span-1 rounded-xl border border-slate-200 bg-white p-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200 md:col-span-2"
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
                    className="mt-4 rounded-full bg-blue-600 px-6 py-2 text-sm font-semibold text-white transition hover:bg-blue-700"
                  >
                    Create Router
                  </button>
                </div>
              )}

              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-blue-50 text-slate-700">
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
                        <tr key={router._id} className="border-t border-slate-100 hover:bg-blue-50">
                          <td className="px-4 py-3 font-semibold">{router.name}</td>
                          <td className="px-4 py-3 text-xs font-mono">{router.macAddress}</td>
                          <td className="px-4 py-3">{router.location}</td>
                          <td className="px-4 py-3">{router.bandwidth}</td>
                          <td className="px-4 py-3 text-center">
                            <span className={`rounded-full px-2.5 py-1 text-xs ${router.status === 'active' ? 'bg-emerald-100 text-emerald-700' : router.status === 'inactive' ? 'bg-slate-100 text-slate-700' : 'bg-amber-100 text-amber-700'}`}>
                              {router.status}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-xs">
                            <code className="rounded bg-slate-100 px-2 py-1">{router.portalUrl}</code>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="6" className="px-4 py-6 text-center text-slate-500">
                          No routers added yet. Click “Add Router” to get started.
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
