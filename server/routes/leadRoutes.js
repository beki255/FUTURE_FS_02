const express = require('express');
const { body, validationResult } = require('express-validator');
const Lead = require('../models/Lead');
const User = require('../models/User');
const Notification = require('../models/Notification');
const { protect, admin } = require('../middleware/auth');

const router = express.Router();

// Helper function to create notification
const createNotification = async (userId, type, title, message, leadId = null) => {
  await Notification.create({
    user: userId,
    type,
    title,
    message,
    leadId
  });
};

// ========== PUBLIC: SUBMIT LEAD (For website contact form) ==========
// POST /api/leads/public
router.post('/public', [
  body('name').notEmpty().withMessage('Name is required').trim(),
  body('email').isEmail().withMessage('Please enter a valid email').normalizeEmail(),
  body('source').optional().isIn(['website', 'referral', 'social_media', 'email_campaign', 'other'])
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    // Find admin user - leads go to admin first
    const admin = await User.findOne({ role: 'admin' });
    
    if (!admin) {
      // If no admin, assign to first available agent
      const agent = await User.findOne({ role: 'agent' });
      if (!agent) {
        return res.status(400).json({ message: 'No user available. Please try again later.' });
      }
      
      const lead = await Lead.create({
        ...req.body,
        user: agent._id,
        assignedTo: agent.username,
        fromPublicForm: true,
        status: 'new',
        assignedBy: 'auto'
      });

      return res.status(201).json({ 
        message: 'Thank you! We have received your inquiry. Our team will contact you shortly.',
        lead 
      });
    }

    // Lead goes to admin first (pending admin assignment)
    const lead = await Lead.create({
      ...req.body,
      user: admin._id,
      assignedTo: 'Admin (Pending)',
      fromPublicForm: true,
      status: 'pending_admin',
      assignedBy: 'auto'
    });

    // Notify admin about new lead
    await createNotification(
      admin._id,
      'new_lead',
      'New Lead Submitted',
      `New lead from ${req.body.name} (${req.body.email}) needs assignment.`,
      lead._id
    );

    res.status(201).json({ 
      message: 'Thank you! We have received your inquiry. Our team will contact you shortly.',
      lead 
    });
  } catch (error) {
    console.error('Public lead submission error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// ========== GET ALL LEADS (Only user's own leads) ==========
// GET /api/leads?status=new&source=website&search=john
router.get('/', protect, async (req, res) => {
  try {
    // Build filter object based on query parameters
    const { status, source, search } = req.query;
    
    // Admin sees all leads, Agent sees only their own
    let filter = {};
    if (req.user.role !== 'admin') {
      filter = { user: req.user._id };
    }

    // Add status filter if provided
    if (status) filter.status = status;
    
    // Add source filter if provided
    if (source) filter.source = source;
    
    // Add search filter if provided (search in name and email)
    if (search) {
      if (req.user.role === 'admin') {
        filter.$or = [
          { name: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } }
        ];
      } else {
        filter.$and = [
          { user: req.user._id },
          {
            $or: [
              { name: { $regex: search, $options: 'i' } },
              { email: { $regex: search, $options: 'i' } }
            ]
          }
        ];
      }
    }

    // Fetch leads from database, sorted by newest first
    const leads = await Lead.find(filter).sort({ createdAt: -1 });
    
    res.json(leads);
  } catch (error) {
    console.error('Get leads error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// ========== GET SINGLE LEAD ==========
// GET /api/leads/:id
router.get('/:id', protect, async (req, res) => {
  try {
    const lead = await Lead.findById(req.params.id);
    
    if (!lead) {
      return res.status(404).json({ message: 'Lead not found' });
    }
    
    // Check if lead belongs to current user (allow admin to see all)
    if (req.user.role !== 'admin' && lead.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to access this lead' });
    }
    
    res.json(lead);
  } catch (error) {
    console.error('Get lead error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// ========== CREATE NEW LEAD ==========
// POST /api/leads
router.post('/', [
  protect,
  body('name').notEmpty().withMessage('Name is required').trim(),
  body('email').isEmail().withMessage('Please enter a valid email').normalizeEmail(),
  body('source').isIn(['website', 'referral', 'social_media', 'email_campaign', 'other'])
    .withMessage('Invalid source'),
  body('status').optional().isIn(['new', 'contacted', 'converted'])
], async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    // Create new lead with user ID (manually created by agent)
    const lead = await Lead.create({
      ...req.body,
      user: req.user._id,
      assignedTo: req.user.username,
      fromPublicForm: false
    });
    
    res.status(201).json(lead);
  } catch (error) {
    console.error('Create lead error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// ========== UPDATE LEAD ==========
// PUT /api/leads/:id
router.put('/:id', protect, async (req, res) => {
  try {
    // Find lead by ID
    const lead = await Lead.findById(req.params.id);
    
    if (!lead) {
      return res.status(404).json({ message: 'Lead not found' });
    }

    // Check if lead belongs to current user (allow admin to update any)
    if (req.user.role !== 'admin' && lead.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this lead' });
    }

    // Update the lead
    const updatedLead = await Lead.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedAt: Date.now() },
      { new: true, runValidators: true }
    );
    
    res.json(updatedLead);
  } catch (error) {
    console.error('Update lead error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// ========== ADD NOTE TO LEAD ==========
// POST /api/leads/:id/notes
router.post('/:id/notes', [
  protect,
  body('content').notEmpty().withMessage('Note content is required').trim()
], async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    // Find lead by ID
    const lead = await Lead.findById(req.params.id);
    
    if (!lead) {
      return res.status(404).json({ message: 'Lead not found' });
    }

    // Check if lead belongs to current user (allow admin to add notes to any)
    if (req.user.role !== 'admin' && lead.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to add note to this lead' });
    }

    // Add new note to the notes array
    lead.notes.push({
      content: req.body.content,
      createdBy: req.user.username
    });
    
    // Save the updated lead
    await lead.save();

    res.json(lead);
  } catch (error) {
    console.error('Add note error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// ========== DELETE LEAD (ADMIN ONLY) ==========
// DELETE /api/leads/:id
router.delete('/:id', protect, admin, async (req, res) => {
  try {
    const lead = await Lead.findById(req.params.id);
    
    if (!lead) {
      return res.status(404).json({ message: 'Lead not found' });
    }

    await lead.deleteOne();
    res.json({ message: 'Lead deleted successfully' });
  } catch (error) {
    console.error('Delete lead error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// ========== ADMIN: ASSIGN LEAD TO AGENT ==========
// PUT /api/leads/:id/assign
router.put('/:id/assign', protect, admin, async (req, res) => {
  try {
    const { userId, username } = req.body;
    
    const lead = await Lead.findById(req.params.id);
    if (!lead) {
      return res.status(404).json({ message: 'Lead not found' });
    }

    const newAgent = await User.findById(userId);
    if (!newAgent) {
      return res.status(404).json({ message: 'Agent not found' });
    }

    if (newAgent.role !== 'agent' && newAgent.role !== 'admin') {
      return res.status(400).json({ message: 'Can only assign to agents' });
    }

    // Only allow assigning leads that are pending_admin (from public form waiting for assignment)
    if (lead.status !== 'pending_admin') {
      return res.status(400).json({ message: 'This lead has already been assigned. Only pending_admin leads can be assigned.' });
    }

    // Only allow assigning leads that came from public form
    if (!lead.fromPublicForm) {
      return res.status(400).json({ message: 'Cannot reassign leads created manually by agents' });
    }

    // Check if lead was created by the target agent - don't allow reassigning own leads
    if (lead.user.toString() === userId) {
      return res.status(400).json({ message: 'This lead is already assigned to this agent' });
    }

    // Assign lead to new agent - directly set as new, no need for accept
    lead.user = userId;
    lead.assignedTo = username;
    lead.status = 'new'; // Directly assigned, no need for accept
    lead.assignedBy = 'admin';
    await lead.save();

    // Notify agent about new lead assignment
    await createNotification(
      userId,
      'lead_assigned',
      'New Lead Assigned',
      `You have been assigned a new lead: ${lead.name} (${lead.email}).`,
      lead._id
    );

    res.json(lead);
  } catch (error) {
    console.error('Assign lead error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// ========== AGENT: ACCEPT/REJECT LEAD ==========
// PUT /api/leads/:id/respond
router.put('/:id/respond', protect, async (req, res) => {
  try {
    const { action } = req.body; // 'accept' or 'reject'
    
    const lead = await Lead.findById(req.params.id);
    if (!lead) {
      return res.status(404).json({ message: 'Lead not found' });
    }

    // Only the assigned agent can respond
    if (lead.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    if (action === 'accept') {
      lead.status = 'new';
    } else if (action === 'reject') {
      lead.status = 'rejected';
    }

    await lead.save();
    res.json(lead);
  } catch (error) {
    console.error('Respond to lead error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// ========== ADMIN: GET LEADS BY AGENT ==========
// GET /api/leads/by-agent/:userId
router.get('/by-agent/:userId', protect, admin, async (req, res) => {
  try {
    const leads = await Lead.find({ user: req.params.userId }).sort({ createdAt: -1 });
    res.json(leads);
  } catch (error) {
    console.error('Get leads by agent error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;