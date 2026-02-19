import React from 'react';

export default function SessionCard({ session }) {
  if (!session) {
    return null;
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'grace_period':
        return 'bg-yellow-100 text-yellow-800';
      case 'expired':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-primary-red">
      <div className="mb-4 flex justify-between items-start">
        <h3 className="text-xl font-bold text-primary-red">Active Session</h3>
        <span
          className={`px-3 py-1 rounded-full text-sm font-semibold capitalize ${getStatusColor(
            session.status
          )}`}
        >
          {session.status === 'grace_period' ? 'Grace Period' : session.status}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-4 text-sm">
        <div>
          <p className="text-gray-600">Time Remaining</p>
          <p className="text-2xl font-bold text-primary-red">{formatTime(session.timeRemaining)}</p>
        </div>
        <div>
          <p className="text-gray-600">Data Used</p>
          <p className="text-xl font-semibold">{session.dataUsedMB} MB</p>
        </div>
        <div>
          <p className="text-gray-600">Started</p>
          <p className="font-semibold">{new Date(session.startTime).toLocaleString()}</p>
        </div>
        <div>
          <p className="text-gray-600">Expires</p>
          <p className="font-semibold">{new Date(session.expiryTime).toLocaleString()}</p>
        </div>
      </div>

      {session.status === 'grace_period' && (
        <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded text-sm text-yellow-800">
          ⚠️ Your session is in grace period. Please purchase more hours to continue.
        </div>
      )}
    </div>
  );
}
