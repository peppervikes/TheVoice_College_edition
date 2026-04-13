const Course = require('../models/Course');
const Professor = require('../models/Professor');
const TeachingAssistant = require('../models/TeachingAssistant');
const University = require('../models/University');
const Review = require('../models/Review');

/**
 * Helper: Get the right model for a given type string.
 */
function getModel(type) {
  if (type === 'course') return Course;
  if (type === 'professor') return Professor;
  if (type === 'ta') return TeachingAssistant;
  if (type === 'university') return University;
  return null;
}

/**
 * GET /api/search
 * Search universities (no universityId) or search within a university (with universityId + type).
 * Query: ?universityId=&type=course|professor|ta&q=searchterm
 */
exports.searchObjects = async (req, res) => {
  try {
    const { universityId, type, q } = req.query;
    let results = [];

    if (!universityId) {
      // Search universities
      const filter = {};
      if (q) filter.name = new RegExp(q, 'i');
      results = await University.find(filter).limit(20);
    } else {
      // Search within a university
      const filter = { universityId };
      if (q) filter.name = new RegExp(q, 'i');

      const Model = getModel(type);
      if (!Model) {
        return res.status(400).json({ error: 'Invalid type. Use: course, professor, or ta.' });
      }

      results = await Model.find(filter).limit(20);
    }

    res.json(results);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * GET /api/object/:type/:id
 * Get object details with aggregated review statistics.
 * Uses MongoDB aggregation pipeline for real-time stats.
 */
exports.getObjectDetails = async (req, res) => {
  try {
    const { type, id } = req.params;

    const Model = getModel(type);
    if (!Model) {
      return res.status(400).json({ error: 'Invalid type. Use: course, professor, or ta.' });
    }

    const object = await Model.findById(id);
    if (!object) return res.status(404).json({ error: 'Object not found' });

    // --- Real aggregation pipeline ---
    const statsResult = await Review.aggregate([
      { $match: { objectId: object._id, objectType: type } },
      {
        $group: {
          _id: null,
          totalReviews: { $sum: 1 },
          avgDifficulty: { $avg: '$ratings.difficulty' },
          avgAssignmentDifficulty: { $avg: '$ratings.assignmentDifficulty' },
          wouldTakeAgainCount: {
            $sum: { $cond: ['$ratings.wouldTakeAgain', 1, 0] }
          },
          wouldTakeAgainTotal: {
            $sum: { $cond: [{ $ne: ['$ratings.wouldTakeAgain', null] }, 1, 0] }
          },
          totalLikes: { $sum: '$likes' },
          totalDislikes: { $sum: '$dislikes' }
        }
      }
    ]);

    const rawStats = statsResult[0] || {};
    const stats = {
      totalReviews: rawStats.totalReviews || 0,
      avgDifficulty: rawStats.avgDifficulty ? parseFloat(rawStats.avgDifficulty.toFixed(1)) : null,
      avgAssignmentDifficulty: rawStats.avgAssignmentDifficulty
        ? parseFloat(rawStats.avgAssignmentDifficulty.toFixed(1))
        : null,
      wouldTakeAgainPct: (rawStats.wouldTakeAgainTotal > 0)
        ? parseFloat(((rawStats.wouldTakeAgainCount / rawStats.wouldTakeAgainTotal) * 100).toFixed(0))
        : null,
      totalLikes: rawStats.totalLikes || 0,
      totalDislikes: rawStats.totalDislikes || 0
    };

    // Fetch reviews (paginated, newest first)
    const reviews = await Review.find({ objectId: id, objectType: type })
      .sort({ createdAt: -1 })
      .limit(20);

    res.json({ object, stats, reviews });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * POST /api/admin/object
 * Admin: Create a new university, course, professor, or TA.
 * Requires: requireAuth + requireRole('admin')
 */
exports.createObject = async (req, res) => {
  try {
    const { type, data } = req.body;

    if (!type || !data) {
      return res.status(400).json({ error: 'type and data are required.' });
    }

    const Model = getModel(type);
    if (!Model) {
      return res.status(400).json({ error: 'Invalid type. Use: university, course, professor, or ta.' });
    }

    const newObject = await Model.create(data);
    res.status(201).json(newObject);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ error: 'This object already exists (duplicate).' });
    }
    res.status(500).json({ error: error.message });
  }
};

/**
 * GET /api/universities
 * Get all universities. Public access.
 */
exports.getUniversities = async (req, res) => {
  try {
    const universities = await University.find().sort({ name: 1 });
    res.json(universities);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
