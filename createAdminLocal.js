// use CommonJS require to avoid ESM URL issues
const path = require('path');

// load dependencies from server/node_modules
const mongoose = require(path.resolve('server/node_modules/mongoose'));
const bcrypt = require(path.resolve('server/node_modules/bcryptjs'));

// load Admin model (ES module) using createRequire hack
const { createRequire } = require('module');
const requireFromServer = createRequire(path.resolve('server')); 
const Admin = requireFromServer('./models/Admin.js').default;

// Adjust the URI as needed or provide via MONGODB_URI env var
const uri =
  process.env.MONGODB_URI ||
  'mongodb+srv://mwawasijulai_db_user:qsJHsYvWeeoRHx0f@cluster0.d3u1mpx.mongodb.net/?';

async function run() {
  try {
    // mongoose v6+ no longer needs the old options
    await mongoose.connect(uri);
    console.log('Connected to MongoDB');

    // import Admin model within run so mongoose already exists in resolution path
    const mod = await import(path.resolve('server/models/Admin.js'));
    const AdminModel = mod.default;

    const username = process.env.ADMIN_USERNAME || 'admin';
    const email = process.env.ADMIN_EMAIL || 'admin@example.com';
    const fullName = process.env.ADMIN_FULLNAME || 'Super Admin';
    const password = process.env.ADMIN_PASSWORD || 'admin123';

    const existing = await mongoose.connection.collection('admins').findOne({ username });
    if (existing) {
      console.log(`Admin with username ${username} already exists:`, existing._id);
      process.exit(0);
    }

    const hash = await bcrypt.hash(password, 10);
    const result = await mongoose.connection.collection('admins').insertOne({
      username,
      password: hash,
      email,
      fullName,
      role: 'super_admin',
      isActive: true,
    });

    console.log('Created admin with id', result.insertedId);
    console.log('Login credentials:');
    console.log('  username:', username);
    console.log('  password:', password);
  } catch (err) {
    console.error('Error creating admin:', err);
  } finally {
    mongoose.connection.close();
    process.exit(0);
  }
}

run();
