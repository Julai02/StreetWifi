import Admin from '../models/Admin.js';
import User from '../models/User.js';
import Payment from '../models/Payment.js';
import Session from '../models/Session.js';
import Router from '../models/Router.js';
import { generateToken } from '../utils/authUtils.js';

/**
 * Admin Login
 */
export const adminLogin = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide username and password',
      });
    }

    const admin = await Admin.findOne({ username }).select('+password');

    if (!admin || !(await admin.matchPassword(password))) {
      return res.status(401).json({
        success: false,
        message: 'Invalid username or password',
      });
    }

    if (!admin.isActive) {
      return res.status(403).json({
        success: false,
        message: 'Your admin account has been deactivated',
      });
    }

    const token = generateToken(admin._id, admin.role);

    res.status(200).json({
      success: true,
      message: 'Admin login successful',
      admin: {
        id: admin._id,
        username: admin.username,
        fullName: admin.fullName,
        role: admin.role,
      },
      token,
    });
  } catch (error) {
    console.error('Admin login error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error logging in',
    });
  }
};

/**
 * Get dashboard statistics
 */
export const getDashboardStats = async (req, res) => {
  try {
    // Get total users
    const totalUsers = await User.countDocuments();
    const activeUsers = await User.countDocuments({ isActive: true });

    // Get total payments
    const totalPayments = await Payment.countDocuments();
    const completedPayments = await Payment.countDocuments({ status: 'completed' });
    const totalRevenue = await Payment.aggregate([
      { $match: { status: 'completed' } },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]);

    // Get active sessions
    const activeSessions = await Session.countDocuments({ status: 'active' });
    const gracePeriodSessions = await Session.countDocuments({ status: 'grace_period' });

    // Get top paying users
    const topUsers = await Payment.aggregate([
      { $match: { status: 'completed' } },
      {
        $group: {
          _id: '$userId',
          totalSpent: { $sum: '$amount' },
          transactionCount: { $sum: 1 },
        },
      },
      { $sort: { totalSpent: -1 } },
      { $limit: 10 },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'userInfo',
        },
      },
    ]);

    // Get daily revenue
    const dailyRevenue = await Payment.aggregate([
      { $match: { status: 'completed' } },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$createdAt' },
          },
          revenue: { $sum: '$amount' },
          transactions: { $sum: 1 },
        },
      },
      { $sort: { _id: -1 } },
      { $limit: 30 },
    ]);

    res.status(200).json({
      success: true,
      stats: {
        users: {
          total: totalUsers,
          active: activeUsers,
        },
        payments: {
          total: totalPayments,
          completed: completedPayments,
          totalRevenue: totalRevenue[0]?.total || 0,
        },
        sessions: {
          active: activeSessions,
          gracePeriod: gracePeriodSessions,
        },
        topUsers: topUsers.map(u => ({
          userId: u._id,
          phoneNumber: u.userInfo[0]?.phoneNumber,
          name: `${u.userInfo[0]?.firstName} ${u.userInfo[0]?.lastName}`,
          totalSpent: u.totalSpent,
          transactions: u.transactionCount,
        })),
        dailyRevenue,
      },
    });
  } catch (error) {
    console.error('Get dashboard stats error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error fetching dashboard statistics',
    });
  }
};

/**
 * Get all users with pagination
 */
export const getAllUsers = async (req, res) => {
  try {
    const { page = 1, limit = 20, search } = req.query;
    const skip = (page - 1) * limit;

    let query = {};
    if (search) {
      query = {
        $or: [
          { phoneNumber: { $regex: search, $options: 'i' } },
          { firstName: { $regex: search, $options: 'i' } },
          { lastName: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } },
        ],
      };
    }

    const users = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    const total = await User.countDocuments(query);

    res.status(200).json({
      success: true,
      users,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error fetching users',
    });
  }
};

/**
 * Get user details with transaction history
 */
export const getUserDetails = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    const payments = await Payment.find({ userId }).sort({ createdAt: -1 });
    const session = await Session.findOne({ userId });

    res.status(200).json({
      success: true,
      user,
      payments,
      activeSession: session || null,
      summary: {
        totalTransactions: payments.length,
        totalSpent: payments.reduce((sum, p) => sum + (p.amount || 0), 0),
        completedTransactions: payments.filter(p => p.status === 'completed').length,
        failedTransactions: payments.filter(p => p.status === 'failed').length,
      },
    });
  } catch (error) {
    console.error('Get user details error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error fetching user details',
    });
  }
};

/**
 * Get all payments with pagination
 */
export const getAllPayments = async (req, res) => {
  try {
    const { page = 1, limit = 50, status, startDate, endDate } = req.query;
    const skip = (page - 1) * limit;

    let query = {};
    if (status) query.status = status;
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    const payments = await Payment.find(query)
      .populate('userId', 'phoneNumber firstName lastName')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    const total = await Payment.countDocuments(query);

    res.status(200).json({
      success: true,
      payments,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Get payments error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error fetching payments',
    });
  }
};

/**
 * Get all active sessions
 */
export const getActiveSessions = async (req, res) => {
  try {
    const { page = 1, limit = 50 } = req.query;
    const skip = (page - 1) * limit;

    const sessions = await Session.find({ status: { $in: ['active', 'grace_period'] } })
      .populate('userId', 'phoneNumber firstName lastName')
      .populate('paymentId', 'amount hoursAllowed')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    const total = await Session.countDocuments({ status: { $in: ['active', 'grace_period'] } });

    // Add time remaining to each session
    const now = new Date();
    const sessionsWithTimeRemaining = sessions.map(session => ({
      ...session.toObject(),
      timeRemaining: Math.floor((session.expiryTime - now) / 1000),
    }));

    res.status(200).json({
      success: true,
      sessions: sessionsWithTimeRemaining,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Get active sessions error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error fetching active sessions',
    });
  }
};

/**
 * Deactivate user account
 */
export const deactivateUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const { reason } = req.body;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    user.isActive = false;
    await user.save();

    // Disconnect any active sessions
    await Session.updateMany(
      { userId },
      { status: 'disconnected', isDisconnected: true }
    );

    res.status(200).json({
      success: true,
      message: 'User deactivated successfully',
    });
  } catch (error) {
    console.error('Deactivate user error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error deactivating user',
    });
  }
};

/**
 * Reactivate user account
 */
export const reactivateUser = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    user.isActive = true;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'User reactivated successfully',
    });
  } catch (error) {
    console.error('Reactivate user error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error reactivating user',
    });
  }
};

/**
 * Get all routers
 */
export const getAllRouters = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const routers = await Router.find()
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    const total = await Router.countDocuments();

    res.status(200).json({
      success: true,
      routers,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Get routers error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error fetching routers',
    });
  }
};

/**
 * Create new router
 */
export const createRouter = async (req, res) => {
  try {
    const { name, macAddress, location, ipAddress, bandwidth, description } = req.body;

    if (!name || !macAddress || !location) {
      return res.status(400).json({
        success: false,
        message: 'Name, MAC address, and location are required',
      });
    }

    // Check if router already exists
    const existingRouter = await Router.findOne({ macAddress: macAddress.toUpperCase() });
    if (existingRouter) {
      return res.status(400).json({
        success: false,
        message: 'Router with this MAC address already exists',
      });
    }

    const router = await Router.create({
      name,
      macAddress: macAddress.toUpperCase(),
      location,
      ipAddress,
      bandwidth: bandwidth || '10Mbps',
      description,
      createdBy: req.user._id,
      portalUrl: `/portal.html?mac=${macAddress.toUpperCase()}`,
    });

    res.status(201).json({
      success: true,
      message: 'Router created successfully',
      router,
    });
  } catch (error) {
    console.error('Create router error:', error);
      if (error.name === 'ValidationError') {
        // Mongoose validation errors -> send details
        const errors = Object.keys(error.errors || {}).reduce((acc, key) => {
          acc[key] = error.errors[key].message;
          return acc;
        }, {});
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors,
        });
      }

      res.status(500).json({
        success: false,
        message: error.message || 'Error creating router',
      });
  }
};

/**
 * Update router
 */
export const updateRouter = async (req, res) => {
  try {
    const { routerId } = req.params;
    const { name, location, ipAddress, bandwidth, status, description } = req.body;

    const router = await Router.findById(routerId);
    if (!router) {
      return res.status(404).json({
        success: false,
        message: 'Router not found',
      });
    }

    if (name) router.name = name;
    if (location) router.location = location;
    if (ipAddress) router.ipAddress = ipAddress;
    if (bandwidth) router.bandwidth = bandwidth;
    if (status) router.status = status;
    if (description) router.description = description;

    await router.save();

    res.status(200).json({
      success: true,
      message: 'Router updated successfully',
      router,
    });
  } catch (error) {
    console.error('Update router error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error updating router',
    });
  }
};

/**
 * Delete router
 */
export const deleteRouter = async (req, res) => {
  try {
    const { routerId } = req.params;

    const router = await Router.findByIdAndDelete(routerId);
    if (!router) {
      return res.status(404).json({
        success: false,
        message: 'Router not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Router deleted successfully',
    });
  } catch (error) {
    console.error('Delete router error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error deleting router',
    });
  }
};

/**
 * Get router details
 */
export const getRouterDetails = async (req, res) => {
  try {
    const { routerId } = req.params;

    const router = await Router.findById(routerId)
      .populate('createdBy', 'username fullName');

    if (!router) {
      return res.status(404).json({
        success: false,
        message: 'Router not found',
      });
    }

    // Get router statistics
    const activeSessions = await Session.countDocuments({
      status: 'active',
      deviceMac: { $regex: '.*' }, // Sessions related to this router
    });

    const routerRevenue = await Payment.aggregate([
      { $match: { status: 'completed' } },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]);

    res.status(200).json({
      success: true,
      router: {
        ...router.toObject(),
        activeSessions,
        totalRevenue: routerRevenue[0]?.total || 0,
      },
    });
  } catch (error) {
    console.error('Get router details error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error fetching router details',
    });
  }
};

