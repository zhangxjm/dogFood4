const express = require('express');
const router = express.Router();
const Seat = require('../models/Seat');

const LOCK_TIMEOUT = 5 * 60 * 1000;

router.get('/schedule/:scheduleId', async (req, res) => {
  try {
    const now = new Date();
    await Seat.updateMany(
      {
        schedule: req.params.scheduleId,
        status: 'locked',
        lockedAt: { $lt: new Date(now - LOCK_TIMEOUT) }
      },
      { $set: { status: 'available', lockedBy: null, lockedAt: null } }
    );

    const seats = await Seat.find({ schedule: req.params.scheduleId }).sort({ row: 1, col: 1 });
    res.json(seats);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/lock', async (req, res) => {
  try {
    const { seatIds, userId } = req.body;
    const now = new Date();

    await Seat.updateMany(
      {
        _id: { $in: seatIds },
        status: 'locked',
        lockedAt: { $lt: new Date(now - LOCK_TIMEOUT) }
      },
      { $set: { status: 'available', lockedBy: null, lockedAt: null } }
    );

    const seats = await Seat.find({ _id: { $in: seatIds } });
    
    const unavailableSeats = seats.filter(s => s.status !== 'available');
    if (unavailableSeats.length > 0) {
      return res.status(400).json({
        error: 'Some seats are unavailable',
        unavailableSeats: unavailableSeats.map(s => s.seatNumber)
      });
    }

    await Seat.updateMany(
      { _id: { $in: seatIds } },
      { $set: { status: 'locked', lockedBy: userId, lockedAt: now } }
    );

    const updatedSeats = await Seat.find({ _id: { $in: seatIds } });
    res.json(updatedSeats);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/unlock', async (req, res) => {
  try {
    const { seatIds } = req.body;
    await Seat.updateMany(
      { _id: { $in: seatIds }, status: 'locked' },
      { $set: { status: 'available', lockedBy: null, lockedAt: null } }
    );
    res.json({ message: 'Seats unlocked successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
