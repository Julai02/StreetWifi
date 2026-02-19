import Session from '../models/Session.js';
import Payment from '../models/Payment.js';
import User from '../models/User.js';

/**
 * Get current user session
 */
export const getSession = async (req, res) => {
  try {
    const userId = req.user.id;

    const session = await Session.findOne({ userId });

    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'No active session found',
        needsPayment: true,
      });
    }

    const now = new Date();
    let status = session.status;

    // Check if expired
    if (now > session.expiryTime) {
      status = 'expired';
    } else if (now > session.expiryTime && now <= session.gracePeriodEnd) {
      status = 'grace_period';
    } else {
      status = 'active';
    }

    const expiresIn = Math.floor((session.expiryTime - now) / 1000); // seconds
    const hoursRemaining = Math.floor(expiresIn / 3600);
    const minutesRemaining = Math.floor((expiresIn % 3600) / 60);

    res.status(200).json({
      success: true,
      session: {
        id: session._id,
        status,
        startTime: session.startTime,
        expiryTime: session.expiryTime,
        expiresIn,
        hoursRemaining,
        minutesRemaining,
        dataUsedMB: session.dataUsedMB,
        isDisconnected: session.isDisconnected,
      },
    });
  } catch (error) {
    console.error('Get session error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error fetching session',
    });
  }
};

/**
 * Extend existing session (buy more hours)
 */
export const extendSession = async (req, res) => {
  try {
    const userId = req.user.id;
    const { hours } = req.body;

    if (!hours || hours < 1) {
      return res.status(400).json({
        success: false,
        message: 'Please specify number of hours to extend (minimum 1)',
      });
    }

    const session = await Session.findOne({
      userId,
      status: { $in: ['active', 'grace_period'] },
    });

    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'No active session found. Please purchase new access.',
      });
    }

    const now = new Date();

    // If already expired, user needs to buy new session
    if (now > session.expiryTime && now > session.gracePeriodEnd) {
      return res.status(400).json({
        success: false,
        message: 'Session has completely expired. Please purchase new access.',
      });
    }

    // Calculate new expiry time based on current expiry time
    const additionalTime = hours * 60 * 60 * 1000; // hours to milliseconds
    const newExpiryTime = new Date(session.expiryTime.getTime() + additionalTime);

    session.expiryTime = newExpiryTime;
    session.gracePeriodEnd = new Date(newExpiryTime.getTime() + 60000); // +1 minute
    session.status = 'active';

    await session.save();

    res.status(200).json({
      success: true,
      message: 'Session extended successfully',
      session: {
        id: session._id,
        newExpiryTime: session.expiryTime,
        hoursAdded: hours,
      },
    });
  } catch (error) {
    console.error('Extend session error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error extending session',
    });
  }
};

/**
 * End user session (e.g., user wants to disconnect)
 */
export const endSession = async (req, res) => {
  try {
    const userId = req.user.id;

    const session = await Session.findOne({ userId });

    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'No active session found',
      });
    }

    session.status = 'disconnected';
    session.isDisconnected = true;
    await session.save();

    res.status(200).json({
      success: true,
      message: 'Session ended successfully',
    });
  } catch (error) {
    console.error('End session error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error ending session',
    });
  }
};

/**
 * Session summary - get usage info
 */
export const getSessionSummary = async (req, res) => {
  try {
    const userId = req.user.id;

    const session = await Session.findOne({ userId }).populate('paymentId');
    const payments = await Payment.find({ userId });

    if (!session) {
      // Return summary even without active session
      return res.status(200).json({
        success: true,
        hasActiveSession: false,
        totalPaid: payments.reduce((sum, p) => sum + (p.amount || 0), 0),
        totalHoursPurchased: payments.reduce((sum, p) => sum + (p.hoursAllowed || 0), 0),
        totalTransactions: payments.length,
      });
    }

    res.status(200).json({
      success: true,
      hasActiveSession: true,
      session: {
        status: session.status,
        startTime: session.startTime,
        expiryTime: session.expiryTime,
        dataUsedMB: session.dataUsedMB,
      },
      totalPaid: payments.reduce((sum, p) => sum + (p.amount || 0), 0),
      totalHoursPurchased: payments.reduce((sum, p) => sum + (p.hoursAllowed || 0), 0),
      totalTransactions: payments.length,
    });
  } catch (error) {
    console.error('Get session summary error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error fetching session summary',
    });
  }
};
