const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const Movie = require('../models/Movie');

router.get('/boxoffice', async (req, res) => {
  try {
    const result = await Order.aggregate([
      { $match: { status: 'paid' } },
      {
        $group: {
          _id: '$movie',
          totalSales: { $sum: '$totalPrice' },
          ticketCount: { $sum: { $size: '$seats' } },
          orderCount: { $sum: 1 }
        }
      },
      {
        $lookup: {
          from: 'movies',
          localField: '_id',
          foreignField: '_id',
          as: 'movie'
        }
      },
      { $unwind: '$movie' },
      {
        $project: {
          _id: 0,
          movieId: '$_id',
          movieTitle: '$movie.title',
          totalSales: 1,
          ticketCount: 1,
          orderCount: 1
        }
      },
      { $sort: { totalSales: -1 } }
    ]);

    const totalBoxOffice = result.reduce((sum, item) => sum + item.totalSales, 0);
    const totalTickets = result.reduce((sum, item) => sum + item.ticketCount, 0);
    const totalOrders = result.reduce((sum, item) => sum + item.orderCount, 0);

    res.json({
      movieStats: result,
      summary: {
        totalBoxOffice,
        totalTickets,
        totalOrders
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/daily', async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    let match = { status: 'paid' };
    
    if (startDate || endDate) {
      match.createdAt = {};
      if (startDate) match.createdAt.$gte = new Date(startDate);
      if (endDate) match.createdAt.$lte = new Date(endDate);
    }

    const result = await Order.aggregate([
      { $match: match },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          totalSales: { $sum: '$totalPrice' },
          ticketCount: { $sum: { $size: '$seats' } },
          orderCount: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
