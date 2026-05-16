const express = require('express');
const Booking = require('../models/Booking');
const Service = require('../models/Service');
const Worker = require('../models/Worker');
const Review = require('../models/Review');
const router = express.Router();

router.get('/overview', async (req, res) => {
  try {
    const [
      totalBookings,
      pendingBookings,
      confirmedBookings,
      completedBookings,
      totalRevenue,
      totalServices,
      activeServices,
      totalWorkers,
      activeWorkers,
      totalReviews,
      avgRating
    ] = await Promise.all([
      Booking.countDocuments(),
      Booking.countDocuments({ status: '待确认' }),
      Booking.countDocuments({ status: '已确认' }),
      Booking.countDocuments({ status: '已完成' }),
      Booking.aggregate([
        { $match: { status: '已完成' } },
        { $group: { _id: null, total: { $sum: '$totalPrice' } } }
      ]),
      Service.countDocuments(),
      Service.countDocuments({ isActive: true }),
      Worker.countDocuments(),
      Worker.countDocuments({ isActive: true }),
      Review.countDocuments(),
      Worker.aggregate([
        { $match: { reviewCount: { $gt: 0 } } },
        { $group: { _id: null, avg: { $avg: '$rating' } } }
      ])
    ]);

    res.json({
      totalBookings,
      pendingBookings,
      confirmedBookings,
      completedBookings,
      totalRevenue: totalRevenue.length > 0 ? totalRevenue[0].total : 0,
      totalServices,
      activeServices,
      totalWorkers,
      activeWorkers,
      totalReviews,
      avgRating: avgRating.length > 0 ? parseFloat(avgRating[0].avg.toFixed(1)) : 0
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/bookings-by-status', async (req, res) => {
  try {
    const stats = await Booking.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          revenue: { $sum: '$totalPrice' }
        }
      },
      {
        $sort: { count: -1 }
      }
    ]);
    
    res.json(stats.map(s => ({
      status: s._id,
      count: s.count,
      revenue: s.revenue
    })));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/revenue-by-service', async (req, res) => {
  try {
    const stats = await Booking.aggregate([
      {
        $match: { status: '已完成' }
      },
      {
        $lookup: {
          from: 'services',
          localField: 'service',
          foreignField: '_id',
          as: 'serviceInfo'
        }
      },
      {
        $unwind: '$serviceInfo'
      },
      {
        $group: {
          _id: '$serviceInfo.name',
          count: { $sum: 1 },
          revenue: { $sum: '$totalPrice' }
        }
      },
      {
        $sort: { revenue: -1 }
      }
    ]);
    
    res.json(stats.map(s => ({
      service: s._id,
      count: s.count,
      revenue: s.revenue
    })));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/revenue-trend', async (req, res) => {
  try {
    const { days = 30 } = req.query;
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));
    
    const stats = await Booking.aggregate([
      {
        $match: {
          status: '已完成',
          date: {
            $gte: startDate,
            $lte: endDate
          }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$date' }
          },
          revenue: { $sum: '$totalPrice' },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { _id: 1 }
      }
    ]);
    
    res.json(stats.map(s => ({
      date: s._id,
      revenue: s.revenue,
      count: s.count
    })));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/top-workers', async (req, res) => {
  try {
    const workers = await Worker.find({ isActive: true })
      .sort({ rating: -1, reviewCount: -1 })
      .limit(10)
      .select('name rating reviewCount skills');
    
    res.json(workers);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
