const mongoose = require('mongoose');

const anniversarySchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  type: {
    type: String,
    enum: ['birthday', 'festival', 'other'],
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  note: {
    type: String,
    trim: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Anniversary', anniversarySchema);
