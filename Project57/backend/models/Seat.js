const mongoose = require('mongoose');

const seatSchema = new mongoose.Schema({
  schedule: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Schedule',
    required: true
  },
  row: {
    type: Number,
    required: true
  },
  col: {
    type: Number,
    required: true
  },
  seatNumber: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['available', 'locked', 'sold'],
    default: 'available'
  },
  lockedBy: {
    type: String,
    default: null
  },
  lockedAt: {
    type: Date,
    default: null
  },
  order: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
    default: null
  }
});

seatSchema.index({ schedule: 1, row: 1, col: 1 }, { unique: true });

module.exports = mongoose.model('Seat', seatSchema);
