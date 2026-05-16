const express = require('express');
const router = express.Router();
const Schedule = require('../models/Schedule');
const Seat = require('../models/Seat');

router.get('/', async (req, res) => {
  try {
    const { movieId } = req.query;
    let query = {};
    if (movieId) {
      query.movie = movieId;
    }
    const schedules = await Schedule.find(query).populate('movie').sort({ startTime: 1 });
    res.json(schedules);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const schedule = await Schedule.findById(req.params.id).populate('movie');
    if (!schedule) {
      return res.status(404).json({ error: 'Schedule not found' });
    }
    res.json(schedule);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const schedule = new Schedule(req.body);
    await schedule.save();

    const seats = [];
    for (let row = 1; row <= schedule.rows; row++) {
      for (let col = 1; col <= schedule.cols; col++) {
        const seatNumber = `${String.fromCharCode(64 + row)}${col}`;
        seats.push({
          schedule: schedule._id,
          row,
          col,
          seatNumber,
          status: 'available'
        });
      }
    }
    await Seat.insertMany(seats);

    await schedule.populate('movie');
    res.status(201).json(schedule);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const schedule = await Schedule.findByIdAndUpdate(req.params.id, req.body, { new: true }).populate('movie');
    if (!schedule) {
      return res.status(404).json({ error: 'Schedule not found' });
    }
    res.json(schedule);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const schedule = await Schedule.findByIdAndDelete(req.params.id);
    if (!schedule) {
      return res.status(404).json({ error: 'Schedule not found' });
    }
    await Seat.deleteMany({ schedule: req.params.id });
    res.json({ message: 'Schedule deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
