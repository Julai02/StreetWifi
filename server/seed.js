import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

// Import models
import Admin from './models/Admin.js';
import User from './models/User.js';
import Session from './models/Session.js';
import Device from './models/Device.js';
import Payment from './models/Payment.js';

dotenv.config();

async function seedDatabase() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Clear existing data (optional, remove if you want to keep existing data)
    await Admin.deleteMany({});
    await User.deleteMany({});
    await Session.deleteMany({});
    await Device.deleteMany({});
    await Payment.deleteMany({});
    console.log('Cleared existing data');

    // Create admin
    const adminPassword = await bcrypt.hash('admin123', 10);
    const admin = new Admin({
      username: 'admin',
      password: adminPassword,
      email: 'admin@streetwifi.com',
      fullName: 'StreetWifi Administrator'
    });
    await admin.save();
    console.log('Admin created');

    // Create sample users
    const user1Password = await bcrypt.hash('user123', 10);
    const user1 = new User({
      phoneNumber: '+1234567890',
      password: user1Password,
      email: 'user1@example.com',
      firstName: 'John',
      lastName: 'Doe'
    });
    await user1.save();

    const user2Password = await bcrypt.hash('user123', 10);
    const user2 = new User({
      phoneNumber: '+1234567891',
      password: user2Password,
      email: 'user2@example.com',
      firstName: 'Jane',
      lastName: 'Smith'
    });
    await user2.save();
    console.log('Sample users created');

    // Create sample devices
    const device1 = new Device({
      macAddress: 'AA:BB:CC:DD:EE:11',
      deviceName: 'Downtown Cafe Router'
    });
    await device1.save();

    const device2 = new Device({
      macAddress: 'AA:BB:CC:DD:EE:22',
      deviceName: 'Central Park Hotspot'
    });
    await device2.save();
    console.log('Sample devices created');

    // Create sample payments
    const payment1 = new Payment({
      userId: user1._id,
      deviceMac: 'AA:BB:CC:DD:EE:11',
      amount: 20.00,
      hoursAllowed: 2,
      status: 'completed',
      transactionId: 'txn_123456'
    });
    await payment1.save();

    const payment2 = new Payment({
      userId: user2._id,
      deviceMac: 'AA:BB:CC:DD:EE:22',
      amount: 10.00,
      hoursAllowed: 1,
      status: 'pending',
      transactionId: 'txn_789012'
    });
    await payment2.save();
    console.log('Sample payments created');

    // Create sample sessions
    const session1 = new Session({
      userId: user1._id,
      deviceMac: 'AA:BB:CC:DD:EE:11',
      paymentId: payment1._id,
      hoursAllowed: 2,
      expiryTime: new Date(Date.now() + 2 * 60 * 60 * 1000), // 2 hours from now
      status: 'active'
    });
    await session1.save();

    const session2 = new Session({
      userId: user2._id,
      deviceMac: 'AA:BB:CC:DD:EE:22',
      paymentId: payment2._id,
      hoursAllowed: 1,
      expiryTime: new Date(Date.now() - 30 * 60 * 1000), // 30 min ago (expired)
      status: 'expired'
    });
    await session2.save();
    console.log('Sample sessions created');

    console.log('Database seeded successfully!');
  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    await mongoose.connection.close();
    console.log('Database connection closed');
  }
}

// Run the seed function
seedDatabase();