const express = require('express');
const Review = require('../models/Review');
const Booking = require('../models/Booking');
const Worker = require('../models/Worker');
const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const { workerId, serviceId } = req.query;
    let query = {};
    if (workerId) query.worker = workerId;
    if (serviceId) query.service = serviceId;
    
    const reviews = await Review.find(query)
      .populate('worker', 'name')
      .populate('service', 'name')
      .sort({ createdAt: -1 });
    res.json(reviews);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const review = await Review.findById(req.params.id)
      .populate('worker', 'name')
      .populate('service', 'name');
    if (!review) {
      return res.status(404).json({ message: '评价不存在' });
    }
    res.json(review);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/', async (req, res) => {
  const session = await Review.startSession();
  
  try {
    await session.withTransaction(async () => {
      const booking = await Booking.findById(req.body.booking);
      if (!booking) {
        throw new Error('预约不存在');
      }
      
      if (booking.status !== '已完成') {
        throw new Error('只能对已完成的服务进行评价');
      }
      
      const existingReview = await Review.findOne({ booking: req.body.booking });
      if (existingReview) {
        throw new Error('该预约已被评价');
      }
      
      const review = new Review({
        booking: req.body.booking,
        worker: booking.worker,
        service: booking.service,
        rating: req.body.rating,
        comment: req.body.comment,
        customerName: booking.customerName
      });

      const newReview = await review.save({ session });
      
      const reviews = await Review.find({ worker: booking.worker }).session(session);
      const totalRating = reviews.reduce((sum, r) => sum + r.rating, 0);
      const averageRating = (totalRating / reviews.length).toFixed(1);
      
      await Worker.findByIdAndUpdate(
        booking.worker,
        { 
          rating: parseFloat(averageRating),
          reviewCount: reviews.length
        },
        { session }
      );
      
      return newReview;
    });
    
    const newReview = await Review.findOne({ booking: req.body.booking })
      .populate('worker', 'name')
      .populate('service', 'name');
    
    res.status(201).json(newReview);
  } catch (err) {
    res.status(400).json({ message: err.message });
  } finally {
    session.endSession();
  }
});

router.put('/:id', async (req, res) => {
  const session = await Review.startSession();
  
  try {
    await session.withTransaction(async () => {
      const review = await Review.findById(req.params.id).session(session);
      if (!review) {
        throw new Error('评价不存在');
      }
      
      if (req.body.rating != null) review.rating = req.body.rating;
      if (req.body.comment != null) review.comment = req.body.comment;

      await review.save({ session });
      
      const reviews = await Review.find({ worker: review.worker }).session(session);
      const totalRating = reviews.reduce((sum, r) => sum + r.rating, 0);
      const averageRating = (totalRating / reviews.length).toFixed(1);
      
      await Worker.findByIdAndUpdate(
        review.worker,
        { rating: parseFloat(averageRating) },
        { session }
      );
      
      return review;
    });
    
    const updatedReview = await Review.findById(req.params.id)
      .populate('worker', 'name')
      .populate('service', 'name');
    
    res.json(updatedReview);
  } catch (err) {
    res.status(400).json({ message: err.message });
  } finally {
    session.endSession();
  }
});

router.delete('/:id', async (req, res) => {
  const session = await Review.startSession();
  
  try {
    await session.withTransaction(async () => {
      const review = await Review.findById(req.params.id).session(session);
      if (!review) {
        throw new Error('评价不存在');
      }
      
      const workerId = review.worker;
      await review.deleteOne({ session });
      
      const reviews = await Review.find({ worker: workerId }).session(session);
      const averageRating = reviews.length > 0 
        ? parseFloat((reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1))
        : 0;
      
      await Worker.findByIdAndUpdate(
        workerId,
        { 
          rating: averageRating,
          reviewCount: reviews.length
        },
        { session }
      );
    });
    
    res.json({ message: '评价已删除' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  } finally {
    session.endSession();
  }
});

module.exports = router;
