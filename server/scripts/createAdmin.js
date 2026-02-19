import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import Admin from '../models/Admin.js';

dotenv.config();

const createAdmin = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/streetwifi');
    console.log('Connected to MongoDB');

    // Admin details
    const adminUsername = process.argv[2] || 'admin';
    const adminPassword = process.argv[3] || 'admin123';
    const adminEmail = process.argv[4] || 'admin@streetwifi.com';
    const adminFullName = process.argv[5] || 'Admin User';

    console.log('\n================================');
    console.log('Creating Admin User');
    console.log('================================');
    console.log(`Username: ${adminUsername}`);
    console.log(`Email: ${adminEmail}`);
    console.log(`Full Name: ${adminFullName}`);
    console.log(`Password: ${adminPassword}`);
    console.log('================================\n');

    // Check if admin already exists
    const existingAdmin = await Admin.findOne({ username: adminUsername });
    if (existingAdmin) {
      console.log('❌ Admin with this username already exists!');
      process.exit(1);
    }

    // Hash password directly (don't rely on pre-save hook)
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(adminPassword, salt);

    // Insert directly into MongoDB to bypass mongoose pre-save hooks
    const adminData = {
      username: adminUsername,
      email: adminEmail,
      password: hashedPassword,
      fullName: adminFullName,
      role: 'super_admin',
      isActive: true,
      permissions: {
        canViewUsers: true,
        canViewPayments: true,
        canViewSessions: true,
        canManageRates: true,
        canManageAdmins: true,
      },
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await mongoose.connection.collection('admins').insertOne(adminData);
    const admin = { _id: result.insertedId, ...adminData };

    console.log('✅ Admin user created successfully!');
    console.log(`\nAdmin ID: ${admin._id}`);
    console.log(`\nLogin Credentials:`);
    console.log(`  Username: ${adminUsername}`);
    console.log(`  Password: ${adminPassword}`);
    console.log(`\nAdmin Panel URL: http://localhost:5173/admin/login`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating admin:', error.message);
    process.exit(1);
  }
};

createAdmin();
