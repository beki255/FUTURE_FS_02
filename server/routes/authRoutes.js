const express = require('express');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const Lead = require('../models/Lead');
const { protect, admin } = require('../middleware/auth');

const router = express.Router();

// ========== HELPER FUNCTION ==========
// Generate JWT token for a user
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE
  });
};

// ========== REGISTER ROUTE ==========
// POST /api/auth/register
router.post('/register', [
  // Validation rules
  body('username').notEmpty().withMessage('Username is required').trim(),
  body('email').isEmail().withMessage('Please enter a valid email').normalizeEmail(),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
], async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { username, email, password, photo } = req.body;

    // Check if user already exists
    const userExists = await User.findOne({ 
      $or: [{ email }, { username }] 
    });
    
    if (userExists) {
      return res.status(400).json({ 
        message: 'User already exists with this email or username' 
      });
    }

    // Create new user (auto-approved if admin, otherwise pending)
    const user = await User.create({
      username,
      email,
      password,
      photo: photo || null,
      role: 'agent',
      isApproved: false // All new registrations need admin approval
    });

    // Don't return token - user needs admin approval first
    res.status(201).json({
      message: 'Registration successful! Your account is pending approval by admin.',
      requiresApproval: true
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// ========== LOGIN ROUTE ==========
// POST /api/auth/login
router.post('/login', [
  body('email').isEmail().withMessage('Please enter a valid email').normalizeEmail(),
  body('password').notEmpty().withMessage('Password is required')
], async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    // Find user by email (include password for comparison)
    const user = await User.findOne({ email }).select('+password');
    
    // Check if user exists
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Check if account is locked
    if (user.isLocked()) {
      return res.status(423).json({ 
        message: 'Account temporarily locked. Please try again later.' 
      });
    }

    // Check if user is approved
    if (!user.isApproved && user.role !== 'admin') {
      return res.status(403).json({ message: 'Your account is pending approval. Please contact admin.' });
    }
    
    // Check if password is correct
    const isMatch = await user.comparePassword(password);
    
    if (isMatch) {
      // Reset login attempts on successful login
      await user.resetLoginAttempts();

      // Check if 2FA is enabled
      if (user.twoFactorEnabled) {
        // Return user info but require 2FA
        return res.json({
          _id: user._id,
          username: user.username,
          email: user.email,
          role: user.role,
          isApproved: user.isApproved,
          requiresTwoFactor: true
        });
      }

      // Update last login
      user.lastLogin = new Date();
      await user.save();

      // Return user data with token
      res.json({
        _id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        isApproved: user.isApproved,
        twoFactorEnabled: user.twoFactorEnabled,
        token: generateToken(user._id)
      });
    } else {
      // Increment failed login attempts
      await user.incrementLoginAttempts();
      
      // Check if account is now locked
      if (user.loginAttempts + 1 >= 5) {
        return res.status(423).json({ 
          message: 'Too many failed attempts. Account locked for 30 minutes.' 
        });
      }
      
      const attemptsLeft = 5 - (user.loginAttempts + 1);
      res.status(401).json({ 
        message: `Invalid email or password. ${attemptsLeft} attempts remaining.` 
      });
    }
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// ========== GET CURRENT USER ROUTE ==========
// GET /api/auth/me
router.get('/me', protect, async (req, res) => {
  // Check if user is approved
  if (!req.user.isApproved && req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Your account is pending approval.' });
  }
  // The protect middleware already added the user to req
  res.json(req.user);
});

// ========== ADMIN: GET ALL USERS ==========
// GET /api/auth/users
router.get('/users', protect, admin, async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// ========== ADMIN: GET SINGLE USER ==========
// GET /api/auth/users/:id
router.get('/users/:id', protect, admin, async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// ========== ADMIN: UPDATE USER ==========
// PUT /api/auth/users/:id
router.put('/users/:id', protect, admin, async (req, res) => {
  try {
    const { username, email, role, password, isApproved } = req.body;
    
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update fields
    if (username) user.username = username;
    if (email) user.email = email;
    if (role) user.role = role;
    if (password) user.password = password;
    if (isApproved !== undefined) user.isApproved = isApproved;

    await user.save();
    
    res.json({
      _id: user._id,
      username: user.username,
      email: user.email,
      role: user.role,
      isApproved: user.isApproved
    });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// ========== ADMIN: APPROVE/REJECT USER ==========
// PUT /api/auth/users/:id/approve
router.put('/users/:id/approve', protect, admin, async (req, res) => {
  try {
    const { isApproved } = req.body;
    
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.isApproved = isApproved;
    await user.save();
    
    res.json({
      _id: user._id,
      username: user.username,
      email: user.email,
      role: user.role,
      isApproved: user.isApproved,
      message: isApproved ? 'User approved successfully' : 'User rejected successfully'
    });
  } catch (error) {
    console.error('Approve user error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// ========== ADMIN: DELETE USER ==========
// DELETE /api/auth/users/:id
router.delete('/users/:id', protect, admin, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Prevent deleting yourself
    if (user._id.toString() === req.user._id.toString()) {
      return res.status(400).json({ message: 'Cannot delete your own account' });
    }

    // Delete all leads associated with this user
    await Lead.deleteMany({ user: user._id });
    
    await user.deleteOne();
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// ========== ADMIN: GET AGENT LEADS STATS ==========
// GET /api/auth/agent-stats
router.get('/agent-stats', protect, admin, async (req, res) => {
  try {
    const agents = await User.find({ role: 'agent' }).select('-password');
    
    const agentStats = await Promise.all(agents.map(async (agent) => {
      const leads = await Lead.find({ user: agent._id });
      return {
        agent: {
          _id: agent._id,
          username: agent.username,
          email: agent.email
        },
        totalLeads: leads.length,
        newLeads: leads.filter(l => l.status === 'new').length,
        contactedLeads: leads.filter(l => l.status === 'contacted').length,
        convertedLeads: leads.filter(l => l.status === 'converted').length,
        pendingAcceptance: leads.filter(l => l.status === 'pending').length
      };
    }));

    res.json(agentStats);
  } catch (error) {
    console.error('Get agent stats error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// ========== USER: UPDATE OWN PROFILE ==========
// PUT /api/auth/profile
router.put('/profile', protect, async (req, res) => {
  try {
    const { username, email, currentPassword, newPassword } = req.body;
    
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update basic info
    if (username) user.username = username;
    if (email) user.email = email;

    // Change password if provided
    if (currentPassword && newPassword) {
      const isMatch = await user.comparePassword(currentPassword);
      if (!isMatch) {
        return res.status(400).json({ message: 'Current password is incorrect' });
      }
      user.password = newPassword;
    }

    await user.save();
    
    res.json({
      _id: user._id,
      username: user.username,
      email: user.email,
      role: user.role,
      message: 'Profile updated successfully'
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// ========== FORGOT PASSWORD ==========
// POST /api/auth/forgot-password
router.post('/forgot-password', [
  body('email').isEmail().withMessage('Please enter a valid email').normalizeEmail()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const user = await User.findOne({ email: req.body.email });
    if (!user) {
      return res.status(404).json({ message: 'No user found with this email' });
    }

    const resetToken = user.getResetPasswordToken();
    await user.save();

    // In production, send email with reset link
    // For demo, return the token
    res.json({ 
      message: 'Password reset token generated',
      resetToken, // Remove in production
      resetUrl: `/reset-password?token=${resetToken}`
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// ========== RESET PASSWORD ==========
// POST /api/auth/reset-password
router.post('/reset-password', [
  body('token').notEmpty().withMessage('Token is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const hashedToken = require('crypto').createHash('sha256').update(req.body.token).digest('hex');
    
    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired token' });
    }

    user.password = req.body.password;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    res.json({ message: 'Password reset successful' });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// ========== ENABLE 2FA ==========
// POST /api/auth/enable-2fa
router.post('/enable-2fa', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    
    const speakeasy = require('speakeasy');
    const secret = speakeasy.generateSecret({
      name: `MiniCRM:${user.email}`,
      issuer: 'MiniCRM'
    });

    user.twoFactorSecret = secret.base32;
    await user.save();

    res.json({
      message: '2FA secret generated',
      secret: secret.base32,
      qrCodeUrl: secret.otpauth_url
    });
  } catch (error) {
    console.error('Enable 2FA error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// ========== VERIFY 2FA ==========
// POST /api/auth/verify-2fa
router.post('/verify-2fa', [
  body('code').notEmpty().withMessage('Code is required')
], async (req, res) => {
  try {
    const { email, password, code } = req.body;
    
    const user = await User.findOne({ email }).select('+twoFactorSecret +password');
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    if (!user.twoFactorSecret) {
      return res.status(400).json({ message: '2FA not enabled for this user' });
    }

    const speakeasy = require('speakeasy');
    const verified = speakeasy.totp.verify({
      secret: user.twoFactorSecret,
      encoding: 'base32',
      token: code,
      window: 1
    });

    if (!verified) {
      return res.status(400).json({ message: 'Invalid 2FA code' });
    }

    const token = generateToken(user._id);
    user.lastLogin = new Date();
    await user.save();

    res.json({
      _id: user._id,
      username: user.username,
      email: user.email,
      role: user.role,
      twoFactorEnabled: user.twoFactorEnabled,
      token
    });
  } catch (error) {
    console.error('Verify 2FA error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// ========== CONFIRM 2FA ==========
// POST /api/auth/confirm-2fa
router.post('/confirm-2fa', protect, [
  body('code').notEmpty().withMessage('Code is required')
], async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('+twoFactorSecret');
    
    const speakeasy = require('speakeasy');
    const verified = speakeasy.totp.verify({
      secret: user.twoFactorSecret,
      encoding: 'base32',
      token: req.body.code,
      window: 1
    });

    if (!verified) {
      return res.status(400).json({ message: 'Invalid code' });
    }

    user.twoFactorEnabled = true;
    await user.save();

    res.json({ message: '2FA enabled successfully' });
  } catch (error) {
    console.error('Confirm 2FA error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// ========== DISABLE 2FA ==========
// POST /api/auth/disable-2fa
router.post('/disable-2fa', protect, [
  body('code').notEmpty().withMessage('Code is required')
], async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('+twoFactorSecret');
    
    const speakeasy = require('speakeasy');
    const verified = speakeasy.totp.verify({
      secret: user.twoFactorSecret,
      encoding: 'base32',
      token: req.body.code,
      window: 1
    });

    if (!verified) {
      return res.status(400).json({ message: 'Invalid code' });
    }

    user.twoFactorEnabled = false;
    user.twoFactorSecret = undefined;
    await user.save();

    res.json({ message: '2FA disabled successfully' });
  } catch (error) {
    console.error('Disable 2FA error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// ========== GET 2FA STATUS ==========
// GET /api/auth/2fa-status
router.get('/2fa-status', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    res.json({ twoFactorEnabled: user.twoFactorEnabled });
  } catch (error) {
    console.error('Get 2FA status error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;