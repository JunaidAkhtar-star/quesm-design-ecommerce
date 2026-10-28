const ContactMessage = require('../models/ContactMessage');
const ActivityLog = require('../models/ActivityLog');

// @desc    Submit contact message
// @route   POST /api/contact
// @access  Public
exports.submitContactMessage = async (req, res) => {
  try {
    const { name, email, phone, subject, message } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({ success: false, message: 'Please provide your name, email, and message' });
    }

    const contact = await ContactMessage.create({
      name,
      email,
      phone: phone || '',
      subject: subject || 'General Inquiry',
      message
    });

    res.status(201).json({
      success: true,
      message: 'Thank you for reaching out! We will get back to you shortly.',
      contact
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all contact messages (Admin)
// @route   GET /api/contact/admin
// @access  Private (Admin)
exports.getAdminContactMessages = async (req, res) => {
  try {
    const messages = await ContactMessage.find().sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      count: messages.length,
      messages
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update contact message status
// @route   PUT /api/contact/admin/:id
// @access  Private (Admin)
exports.updateMessageStatus = async (req, res) => {
  try {
    const { isRead, isResolved } = req.body;
    const message = await ContactMessage.findByIdAndUpdate(
      req.params.id,
      { isRead, isResolved },
      { new: true }
    );

    if (!message) {
      return res.status(404).json({ success: false, message: 'Message not found' });
    }

    res.status(200).json({
      success: true,
      message: 'Message status updated',
      data: message
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete contact message
// @route   DELETE /api/contact/admin/:id
// @access  Private (Admin)
exports.deleteMessage = async (req, res) => {
  try {
    const message = await ContactMessage.findById(req.params.id);
    if (!message) {
      return res.status(404).json({ success: false, message: 'Message not found' });
    }

    await message.deleteOne();
    res.status(200).json({ success: true, message: 'Message deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
