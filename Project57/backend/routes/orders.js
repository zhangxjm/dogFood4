const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const Seat = require('../models/Seat');

function generateOrderNo() {
  const date = new Date();
  const timestamp = date.getTime().toString().slice(-6);
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `ORD${timestamp}${random}`;
}

router.get('/', async (req, res) => {
  try {
    const { phone, orderNo } = req.query;
    let query = {};
    if (phone) {
      query.customerPhone = phone;
    }
    if (orderNo) {
      query.orderNo = orderNo;
    }
    const orders = await Order.find(query)
      .populate('movie')
      .populate('schedule')
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('movie')
      .populate('schedule');
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }
    res.json(order);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const { scheduleId, movieId, seatIds, customerName, customerPhone, totalPrice } = req.body;
    
    const seats = await Seat.find({ _id: { $in: seatIds } });
    const lockedSeats = seats.filter(s => s.status === 'locked');
    if (lockedSeats.length !== seatIds.length) {
      return res.status(400).json({ error: 'Some seats are not locked' });
    }

    const orderNo = generateOrderNo();
    const order = new Order({
      orderNo,
      schedule: scheduleId,
      movie: movieId,
      seats: seatIds,
      seatNumbers: seats.map(s => s.seatNumber),
      totalPrice,
      customerName,
      customerPhone,
      status: 'paid'
    });
    await order.save();

    await Seat.updateMany(
      { _id: { $in: seatIds } },
      { $set: { status: 'sold', order: order._id, lockedBy: null, lockedAt: null } }
    );

    await order.populate('movie');
    await order.populate('schedule');
    res.status(201).json(order);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.put('/:id/cancel', async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }
    if (order.status === 'cancelled') {
      return res.status(400).json({ error: 'Order already cancelled' });
    }

    order.status = 'cancelled';
    await order.save();

    await Seat.updateMany(
      { _id: { $in: order.seats } },
      { $set: { status: 'available', order: null } }
    );

    res.json(order);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
