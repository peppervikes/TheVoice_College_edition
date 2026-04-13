const Flag = require('../models/Flag');

/**
 * POST /api/flags
 * Flag a review for moderation. Requires authentication.
 */
exports.createFlag = async (req, res) => {
  try {
    const { reviewId, reason } = req.body;

    if (!reviewId || !reason) {
      return res.status(400).json({ error: 'reviewId and reason are required.' });
    }

    const flag = await Flag.create({
      reviewId,
      reasonText: reason,
      reportedBy: req.user.id
    });

    res.status(201).json(flag);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * GET /api/flags
 * Admin/Moderator: Get all flags with review data.
 */
exports.getFlags = async (req, res) => {
  try {
    const { status } = req.query;
    const filter = {};
    if (status) filter.status = status;

    const flags = await Flag.find(filter)
      .populate('reviewId')
      .populate('reportedBy', 'pseudonym email')
      .sort({ createdAt: -1 });

    res.json(flags);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * PUT /api/flags/:id
 * Admin/Moderator: Update flag status (mark as reviewed).
 */
exports.updateFlagStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['pending', 'reviewed'].includes(status)) {
      return res.status(400).json({ error: 'Status must be "pending" or "reviewed".' });
    }

    const flag = await Flag.findByIdAndUpdate(id, { status }, { new: true });
    if (!flag) return res.status(404).json({ error: 'Flag not found.' });

    res.json(flag);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
