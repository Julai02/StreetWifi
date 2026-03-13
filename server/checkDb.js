import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

async function checkDatabase() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    const Admin = mongoose.model('Admin', new mongoose.Schema({ username: String, email: String, fullName: String }));
    const User = mongoose.model('User', new mongoose.Schema({ phoneNumber: String, firstName: String, lastName: String }));
    const Device = mongoose.model('Device', new mongoose.Schema({ macAddress: String, deviceName: String }));
    const Payment = mongoose.model('Payment', new mongoose.Schema({ deviceMac: String, amount: Number, status: String }));
    const Session = mongoose.model('Session', new mongoose.Schema({ deviceMac: String, status: String }));

    const adminCount = await Admin.countDocuments();
    const userCount = await User.countDocuments();
    const deviceCount = await Device.countDocuments();
    const paymentCount = await Payment.countDocuments();
    const sessionCount = await Session.countDocuments();

    console.log(`Admins: ${adminCount}`);
    console.log(`Users: ${userCount}`);
    console.log(`Devices: ${deviceCount}`);
    console.log(`Payments: ${paymentCount}`);
    console.log(`Sessions: ${sessionCount}`);

    if (adminCount > 0) {
      const admin = await Admin.findOne();
      console.log('Sample Admin:', admin);
    }

  } catch (error) {
    console.error('Error checking database:', error);
  } finally {
    await mongoose.connection.close();
    console.log('Database connection closed');
  }
}

checkDatabase();