import cron from 'node-cron';
import Session from '../models/Session.js';

/**
 * Initialize cron jobs for session management
 */
export const initializeCronJobs = () => {
  // Run every minute to check for expired sessions
  cron.schedule('* * * * *', async () => {
    try {
      await disconnectExpiredSessions();
    } catch (error) {
      console.error('Cron job error (disconnect sessions):', error);
    }
  });

  // Run every 5 minutes to clean up old disconnected sessions
  cron.schedule('*/5 * * * *', async () => {
    try {
      await cleanupOldSessions();
    } catch (error) {
      console.error('Cron job error (cleanup sessions):', error);
    }
  });

  console.log('Cron jobs initialized successfully');
};

/**
 * Disconnect sessions that have expired
 */
const disconnectExpiredSessions = async () => {
  try {
    const now = new Date();

    // Find all active sessions that have expired
    const expiredSessions = await Session.find({
      status: 'active',
      expiryTime: { $lt: now },
    });

    if (expiredSessions.length > 0) {
      // Update sessions to disconnected status
      await Session.updateMany(
        {
          status: 'active',
          expiryTime: { $lt: now },
        },
        {
          status: 'expired',
          isDisconnected: true,
        }
      );

      console.log(`[CRON] Disconnected ${expiredSessions.length} expired sessions`);
    }

    // Handle grace period sessions that have expired
    const graceExpiredSessions = await Session.find({
      status: 'grace_period',
      gracePeriodEnd: { $lt: now },
    });

    if (graceExpiredSessions.length > 0) {
      await Session.updateMany(
        {
          status: 'grace_period',
          gracePeriodEnd: { $lt: now },
        },
        {
          status: 'expired',
          isDisconnected: true,
        }
      );

      console.log(`[CRON] Expired ${graceExpiredSessions.length} grace period sessions`);
    }
  } catch (error) {
    console.error('Error in disconnectExpiredSessions:', error);
  }
};

/**
 * Clean up old disconnected sessions (remove records older than 30 days)
 */
const cleanupOldSessions = async () => {
  try {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    const result = await Session.deleteMany({
      status: 'disconnected',
      expiryTime: { $lt: thirtyDaysAgo },
    });

    if (result.deletedCount > 0) {
      console.log(`[CRON] Cleaned up ${result.deletedCount} old disconnected sessions`);
    }
  } catch (error) {
    console.error('Error in cleanupOldSessions:', error);
  }
};

export { disconnectExpiredSessions, cleanupOldSessions };
