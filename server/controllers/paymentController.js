import Payment from '../models/Payment.js';
import Session from '../models/Session.js';
import Device from '../models/Device.js';
import payHeroService from '../utils/payHeroService.js';

// Initiate payment for a device
export const initiatePayment = async (req, res) => {
  try {
    const { deviceMac, hours } = req.body;

    if (!deviceMac || !hours) {
      return res.status(400).json({
        success: false,
        message: 'Device MAC address and hours are required',
      });
    }

    // Validate hours
    const validHours = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 12, 24];
    if (!validHours.includes(hours)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid hours. Must be one of: 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 12, 24',
      });
    }

    // Get or create device
    let device = await Device.findOne({ macAddress: deviceMac.toUpperCase() });
    if (!device) {
      device = await Device.create({
        macAddress: deviceMac.toUpperCase(),
      });
    }

    // Calculate amount (10 KES per hour)
    const pricePerHour = 10;
    const amount = hours * pricePerHour;

    // Create payment record
    const payment = await Payment.create({
      deviceMac: deviceMac.toUpperCase(),
      amount,
      hoursAllowed: hours,
      pricePerHour,
      status: 'pending',
    });

    // Initiate PayHero STK Push
    try {
      const stkResponse = await payHeroService.initiateStkPush(
        deviceMac.toUpperCase(),
        amount,
        payment._id
      );

      return res.status(200).json({
        success: true,
        message: 'STK Push initiated. Check your phone for payment prompt.',
        payment: {
          id: payment._id,
          amount,
          hours,
          status: 'pending',
        },
        checkoutRequestId: stkResponse.checkoutRequestId,
      });
    } catch (stkerror) {
      payment.status = 'failed';
      await payment.save();
      return res.status(500).json({
        success: false,
        message: 'Failed to initiate payment. Please try again.',
        error: stkerror.message,
      });
    }
  } catch (error) {
    console.error('Payment initiation error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message,
    });
  }
};

// Handle PayHero callback
export const paymentCallback = async (req, res) => {
  try {
    const callbackData = req.body;
    console.log('PayHero Callback:', callbackData);

    // Verify signature
    const isValid = await payHeroService.verifySignature(req);
    if (!isValid) {
      console.error('Invalid PayHero signature');
      return res.status(401).json({
        success: false,
        message: 'Invalid signature',
      });
    }

    // Find payment by transaction ID
    const payment = await Payment.findOne({
      transactionId: callbackData.transaction_id,
    });

    if (!payment) {
      console.error('Payment not found:', callbackData.transaction_id);
      return res.status(404).json({
        success: false,
        message: 'Payment not found',
      });
    }

    // Update payment status
    if (callbackData.status === 'completed') {
      payment.status = 'completed';
      payment.completedAt = new Date();
      payment.payHeroCallbackData = callbackData;

      // Delete old session if exists
      await Session.deleteOne({ deviceMac: payment.deviceMac });

      // Create new session
      const expiryTime = new Date(Date.now() + payment.hoursAllowed * 60 * 60 * 1000);
      const gracePeriodEnd = new Date(expiryTime.getTime() + 60 * 1000); // 1 minute grace

      const session = await Session.create({
        deviceMac: payment.deviceMac,
        paymentId: payment._id,
        hoursAllowed: payment.hoursAllowed,
        expiryTime,
        gracePeriodEnd,
        status: 'active',
      });

      payment.sessionId = session._id;

      // Update device
      const device = await Device.findOne({ macAddress: payment.deviceMac });
      if (device) {
        device.totalSpent += payment.amount;
        device.lastConnected = new Date();
        await device.save();
      }

      await payment.save();

      return res.status(200).json({
        success: true,
        message: 'Payment successful. Internet access granted.',
        session: {
          id: session._id,
          deviceMac: session.deviceMac,
          expiryTime: session.expiryTime,
          hoursAllowed: session.hoursAllowed,
        },
      });
    } else if (callbackData.status === 'failed') {
      payment.status = 'failed';
      payment.payHeroCallbackData = callbackData;
      await payment.save();

      return res.status(200).json({
        success: false,
        message: 'Payment failed',
      });
    }

    await payment.save();
    res.status(200).json({
      success: true,
      message: 'Callback received',
    });
  } catch (error) {
    console.error('Callback error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message,
    });
  }
};

// Check payment status
export const checkPaymentStatus = async (req, res) => {
  try {
    const { paymentId } = req.params;

    const payment = await Payment.findById(paymentId);
    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found',
      });
    }

    res.status(200).json({
      success: true,
      payment: {
        id: payment._id,
        amount: payment.amount,
        hours: payment.hoursAllowed,
        status: payment.status,
        createdAt: payment.createdAt,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message,
    });
  }
};

// Verify device session access
export const verifyDeviceAccess = async (req, res) => {
  try {
    const { deviceMac } = req.body;

    if (!deviceMac) {
      return res.status(400).json({
        success: false,
        message: 'Device MAC address is required',
      });
    }

    const device = await Device.findOne({ macAddress: deviceMac.toUpperCase() });

    if (device && device.isBlocked) {
      return res.status(403).json({
        success: false,
        canAccess: false,
        message: 'Device is blocked',
      });
    }

    const session = await Session.findOne({ deviceMac: deviceMac.toUpperCase() });

    if (!session) {
      return res.status(200).json({
        success: true,
        canAccess: false,
        message: 'No active session. Payment required.',
        status: 'no_session',
      });
    }

    const now = new Date();

    // Check if expired
    if (now > session.expiryTime) {
      session.status = 'expired';
      await session.save();
      return res.status(200).json({
        success: true,
        canAccess: false,
        message: 'Session expired. Payment required.',
        status: 'expired',
      });
    }

    // Check if in grace period
    if (now > session.gracePeriodEnd) {
      session.status = 'grace_period';
      await session.save();
      const timeRemaining = Math.floor((session.gracePeriodEnd - now) / 1000);
      return res.status(200).json({
        success: true,
        canAccess: true,
        message: 'Session in grace period. Please renew.',
        status: 'grace_period',
        timeRemaining,
      });
    }

    // Session is active
    const timeRemaining = Math.floor((session.expiryTime - now) / 1000);
    const hoursRemaining = Math.floor(timeRemaining / 3600);
    const minutesRemaining = Math.floor((timeRemaining % 3600) / 60);

    res.status(200).json({
      success: true,
      canAccess: true,
      message: 'Session active. Internet access granted.',
      status: 'active',
      timeRemaining,
      hoursRemaining,
      minutesRemaining,
      expiryTime: session.expiryTime,
    });
  } catch (error) {
    console.error('Access verification error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message,
    });
  }
};

// Extend session (buy more hours)
export const extendSession = async (req, res) => {
  try {
    const { deviceMac, hours } = req.body;

    if (!deviceMac || !hours) {
      return res.status(400).json({
        success: false,
        message: 'Device MAC and hours are required',
      });
    }

    const validHours = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 12, 24];
    if (!validHours.includes(hours)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid hours',
      });
    }

    const session = await Session.findOne({ deviceMac: deviceMac.toUpperCase() });
    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'No active session found',
      });
    }

    const amount = hours * 10; // 10 KES per hour

    const payment = await Payment.create({
      deviceMac: deviceMac.toUpperCase(),
      amount,
      hoursAllowed: hours,
      pricePerHour: 10,
      status: 'pending',
    });

    try {
      const stkreesponse = await payHeroService.initiateStkPush(
        deviceMac.toUpperCase(),
        amount,
        payment._id
      );

      return res.status(200).json({
        success: true,
        message: 'Extension payment initiated. Check your phone.',
        payment: {
          id: payment._id,
          amount,
          hours,
        },
      });
    } catch (error) {
      payment.status = 'failed';
      await payment.save();
      throw error;
    }
  } catch (error) {
    console.error('Extension error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message,
    });
  }
};

// Get device payment history
export const getPaymentHistory = async (req, res) => {
  try {
    const { deviceMac } = req.query;

    if (!deviceMac) {
      return res.status(400).json({
        success: false,
        message: 'Device MAC is required',
      });
    }

    const payments = await Payment.find({ deviceMac: deviceMac.toUpperCase() })
      .sort({ createdAt: -1 })
      .limit(50);

    res.status(200).json({
      success: true,
      payments,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message,
    });
  }
};
