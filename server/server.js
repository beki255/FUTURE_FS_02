// Import required packages
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

// Load environment variables from .env file
dotenv.config();

// Create Express app
const app = express();

// ========== MIDDLEWARE ==========
// CORS - allows frontend to communicate with backend
app.use(cors());

// Parse JSON bodies (so we can get data from POST requests)
app.use(express.json());

// Parse URL-encoded bodies
app.use(express.urlencoded({ extended: true }));

// ========== DATABASE CONNECTION ==========
// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err.message);
    process.exit(1);
  });

// ========== IMPORT ROUTES ==========
const authRoutes = require('./routes/authRoutes');
const leadRoutes = require('./routes/leadRoutes');
const notificationRoutes = require('./routes/notificationRoutes');

// ========== USE ROUTES ==========
// All auth routes will be prefixed with /api/auth
app.use('/api/auth', authRoutes);

// All lead routes will be prefixed with /api/leads
app.use('/api/leads', leadRoutes);

// All notification routes will be prefixed with /api/notifications
app.use('/api/notifications', notificationRoutes);

// ========== BASIC ROUTE FOR TESTING ==========
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to Mini CRM API' });
});

// ========== SEED ADMIN ROUTE (run once) ==========
app.post('/api/seed-admin', async (req, res) => {
  try {
    const adminExists = await mongoose.model('User').findOne({ role: 'admin' });
    if (adminExists) {
      return res.json({ message: 'Admin already exists' });
    }
    
    const admin = await mongoose.model('User').create({
      username: 'Admin',
      email: 'admin@crm.com',
      password: 'admin123',
      role: 'admin',
      isApproved: true
    });
    
    res.json({ message: 'Admin created', admin: { username: admin.username, email: admin.email } });
  } catch (error) {
    res.status(500).json({ message: 'Error creating admin', error: error.message });
  }
});

// ========== START SERVER ==========
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
  console.log(`📝 API URL: http://localhost:${PORT}`);
});