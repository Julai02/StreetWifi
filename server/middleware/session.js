import Session from '../models/Session.js';
import User from '../models/User.js';

/**
 * Middleware to validate user session
 * Checks if session is active, in grace period, or expired
 */
export const validateSession = async (req, res, next) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated',
      });
    }

    const session = await Session.findOne({ userId });

    if (!session) {
      return res.status(403).json({
        success: false,
        message: 'No active session found. Please purchase internet access.',
        needsPayment: true,
      });
    }

    const now = new Date();

    // Check if expired
    if (now > session.expiryTime) {
      // Set session to expired
      session.status = 'expired';
      session.isDisconnected = true;
      await session.save();

      return res.status(403).json({
        success: false,
        message: 'Your session has expired. Please purchase internet access again.',
        sessionStatus: 'expired',
        needsPayment: true,
      });
    }

    // Check if in grace period (1 minute after expiry)
    if (!session.gracePeriodEnd) {
      session.gracePeriodEnd = new Date(session.expiryTime.getTime() + 60000); // +1 minute
    }

    if (now > session.expiryTime && now <= session.gracePeriodEnd) {
      session.status = 'grace_period';
      await session.save();

      return res.status(403).json({
        success: false,
        message: 'Your session is in grace period (1 minute). Please repay to continue.',
        sessionStatus: 'grace_period',
        timeRemaining: Math.floor((session.gracePeriodEnd - now) / 1000), // seconds
        needsPayment: true,
      });
    }

    // Session is active
    session.status = 'active';
    await session.save();

    // Calculate remaining time
    const timeRemaining = Math.floor((session.expiryTime - now) / 1000); // in seconds
    const hoursRemaining = Math.floor(timeRemaining / 3600);
    const minutesRemaining = Math.floor((timeRemaining % 3600) / 60);

    req.session = {
      ...session.toObject(),
      timeRemaining,
      hoursRemaining,
      minutesRemaining,
    };

    next();
  } catch (error) {
    console.error('Session validation error:', error);
    res.status(500).json({
      success: false,
      message: 'Error validating session',
    });
  }
};

/**
 * Middleware to check session in body (for captive portal)
 * Used by captive portal to verify if user can access internet
 */
export const checkSessionValidity = async (req, res, next) => {
  try {
    const phoneNumber = req.body.phoneNumber || req.query.phoneNumber;

    if (!phoneNumber) {
      return res.status(400).json({
        success: false,
        message: 'Phone number is required',
      });
    }

    const session = await Session.findOne({ phoneNumber });

    if (!session) {
      return res.status(403).json({
        success: false,
        message: 'No active session found',
        canAccess: false,
      });
    }

    const now = new Date();

    // Check if expired
    if (now > session.expiryTime) {
      session.status = 'expired';
      session.isDisconnected = true;
      await session.save();

      return res.status(403).json({
        success: false,
        message: 'Session expired',
        canAccess: false,
      });
    }

    // Check if in grace period
    if (!session.gracePeriodEnd) {
      session.gracePeriodEnd = new Date(session.expiryTime.getTime() + 60000);
    }

    if (now > session.expiryTime && now <= session.gracePeriodEnd) {
      session.status = 'grace_period';
      await session.save();

      return res.status(200).json({
        success: true,
        message: 'Session in grace period',
        canAccess: true,
        status: 'grace_period',
        timeRemaining: Math.floor((session.gracePeriodEnd - now) / 1000),
      });
    }

    // Session is active
    res.status(200).json({
      success: true,
      message: 'Session valid',
      canAccess: true,
      status: 'active',
      timeRemaining: Math.floor((session.expiryTime - now) / 1000),
    });
  } catch (error) {
    console.error('Session check error:', error);
    res.status(500).json({
      success: false,
      message: 'Error checking session',
    });
  }
};
