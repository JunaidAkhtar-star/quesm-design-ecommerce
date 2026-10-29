const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/ques_m_design');
    console.log(`[Database] MongoDB Connected: ${conn.connection.host}/${conn.connection.name}`);

    // Auto-seed catalog & settings if database is newly initialized
    try {
      const Category = require('../models/Category');
      const catCount = await Category.countDocuments();
      if (catCount === 0) {
        console.log('[Database] Empty database detected. Auto-seeding initial catalog and boutique settings...');
        const { seedDB } = require('../utils/seed');
        await seedDB();
        console.log('[Database] Auto-seeding completed successfully.');
      }
    } catch (seedErr) {
      console.warn('[Database] Auto-seed check notice:', seedErr.message);
    }
  } catch (error) {
    console.error(`[Database Error] ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
