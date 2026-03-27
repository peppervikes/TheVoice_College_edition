const mongoose = require('mongoose');

const universitySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  country: {
    type: String,
    required: true
  },
  domain: {
    type: String
  }
}, { timestamps: true });

module.exports = mongoose.model('University', universitySchema);
