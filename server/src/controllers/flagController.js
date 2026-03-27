const Flag = require('../models/Flag');

exports.createFlag = async (req, res) => {
  try {
    const { reviewId, reason } = req.body;
    const reportedBy = req.body.userId || "000000000000000000000000";
    
    const flag = await Flag.create({
      reviewId,
      reasonText: reason,
      reportedBy
    });
    
    res.status(201).json(flag);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Admin handler
exports.getFlags = async (req, res) => {
  try {
    const flags = await Flag.find().populate('reviewId');
    res.json(flags);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
