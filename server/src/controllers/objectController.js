const Course = require('../models/Course');
const Professor = require('../models/Professor');
const TeachingAssistant = require('../models/TeachingAssistant');
const University = require('../models/University');
const Review = require('../models/Review');

exports.searchObjects = async (req, res) => {
  try {
    const { universityId, type, q } = req.query;
    let results = [];
    const query = { universityId };
    if (q) query.name = new RegExp(q, 'i');

    if (type === 'course') {
      results = await Course.find(query).limit(20);
    } else if (type === 'professor') {
      results = await Professor.find(query).limit(20);
    } else if (type === 'ta') {
      results = await TeachingAssistant.find(query).limit(20);
    } else {
      // Return university search if type is not specified
      results = await University.find({ name: new RegExp(q || '', 'i') }).limit(20);
    }
    
    res.json(results);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getObjectDetails = async (req, res) => {
  try {
    const { type, id } = req.params;
    let object = null;
    
    if (type === 'course') object = await Course.findById(id);
    else if (type === 'professor') object = await Professor.findById(id);
    else if (type === 'ta') object = await TeachingAssistant.findById(id);

    if (!object) return res.status(404).json({ error: 'Object not found' });

    // In a real app we would aggregate standard stats here
    const reviews = await Review.find({ objectId: id, objectType: type }).sort('-createdAt').limit(20);
    
    res.json({ object, stats: { avgDifficulty: 3.5 }, reviews });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Admin creating an object (MVP stub)
exports.createObject = async (req, res) => {
  try {
    const { type, data } = req.body;
    let newObject;
    if (type === 'course') newObject = await Course.create(data);
    else if (type === 'professor') newObject = await Professor.create(data);
    else if (type === 'ta') newObject = await TeachingAssistant.create(data);
    else if (type === 'university') newObject = await University.create(data);

    res.json(newObject);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
