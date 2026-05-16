const express = require('express');
const moment = require('moment');
const Booking = require('../models/Booking');
const Worker = require('../models/Worker');
const Service = require('../models/Service');
const router = express.Router();

const parseLocalDate = (dateStr) => {
  if (typeof dateStr === 'string' && dateStr.includes('-')) {
    const [year, month, day] = dateStr.split('-').map(Number);
    return new Date(year, month - 1, day);
  }
  const date = new Date(dateStr);
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
};

const checkTimeConflict = async (workerId, date, startTime, endTime, excludeBookingId = null) => {
  const startDate = parseLocalDate(date);
  const endDate = parseLocalDate(date);
  
  const bookings = await Booking.find({
    worker: workerId,
    date: {
      $gte: startDate.setHours(0, 0, 0, 0),
      $lte: endDate.setHours(23, 59, 59, 999)
    },
    status: { $in: ['待确认', '已确认'] },
    ...(excludeBookingId && { _id: { $ne: excludeBookingId } })
  });

  for (const booking of bookings) {
    const bookingStart = booking.startTime;
    const bookingEnd = booking.endTime;
    
    if ((startTime >= bookingStart && startTime < bookingEnd) ||
        (endTime > bookingStart && endTime <= bookingEnd) ||
        (startTime <= bookingStart && endTime >= bookingEnd)) {
      return { hasConflict: true, conflictingBooking: booking };
    }
  }
  return { hasConflict: false };
};

const isWorkerAvailable = (worker, date, startTime, endTime) => {
  if (!worker.schedule || worker.schedule.length === 0) {
    return false;
  }
  
  const localDate = parseLocalDate(date);
  const dayOfWeek = localDate.getDay();
  const daySchedule = worker.schedule.find(s => s.dayOfWeek === dayOfWeek);
  
  if (!daySchedule) {
    return false;
  }
  
  return startTime >= daySchedule.startTime && endTime <= daySchedule.endTime;
};

router.get('/', async (req, res) => {
  try {
    const { status } = req.query;
    let query = {};
    if (status) {
      query = { status };
    }
    const bookings = await Booking.find(query)
      .populate('service', 'name price')
      .populate('worker', 'name phone')
      .sort({ date: -1, startTime: -1 });
    res.json(bookings);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/available-slots', async (req, res) => {
  try {
    const { workerId, serviceId, date } = req.query;
    
    const worker = await Worker.findById(workerId);
    const service = await Service.findById(serviceId);
    
    if (!worker || !service) {
      return res.status(404).json({ message: '服务人员或服务不存在' });
    }
    
    const [year, month, day] = date.split('-').map(Number);
    const localDate = new Date(year, month - 1, day);
    const dayOfWeek = localDate.getDay();
    const daySchedule = worker.schedule.find(s => s.dayOfWeek === dayOfWeek);
    
    if (!daySchedule) {
      return res.json({ availableSlots: [] });
    }
    
    const startDate = new Date(date);
    const endDate = new Date(date);
    
    const existingBookings = await Booking.find({
      worker: workerId,
      date: {
        $gte: startDate.setHours(0, 0, 0, 0),
        $lte: endDate.setHours(23, 59, 59, 999)
      },
      status: { $in: ['待确认', '已确认'] }
    }).sort({ startTime: 1 });
    
    const slots = [];
    const duration = service.duration;
    
    let currentTime = moment(daySchedule.startTime, 'HH:mm');
    const endTime = moment(daySchedule.endTime, 'HH:mm');
    
    while (currentTime.isBefore(endTime)) {
      const slotEnd = moment(currentTime).add(duration, 'minutes');
      
      if (slotEnd.isAfter(endTime)) {
        break;
      }
      
      const startTimeStr = currentTime.format('HH:mm');
      const endTimeStr = slotEnd.format('HH:mm');
      
      let isAvailable = true;
      for (const booking of existingBookings) {
        if ((startTimeStr >= booking.startTime && startTimeStr < booking.endTime) ||
            (endTimeStr > booking.startTime && endTimeStr <= booking.endTime) ||
            (startTimeStr <= booking.startTime && endTimeStr >= booking.endTime)) {
          isAvailable = false;
          break;
        }
      }
      
      if (isAvailable) {
        slots.push({
          startTime: startTimeStr,
          endTime: endTimeStr
        });
      }
      
      currentTime = slotEnd;
    }
    
    res.json({ availableSlots: slots });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('service', 'name price duration')
      .populate('worker', 'name phone');
    if (!booking) {
      return res.status(404).json({ message: '预约不存在' });
    }
    res.json(booking);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const { service: serviceId, worker: workerId, date, startTime, endTime } = req.body;
    
    const service = await Service.findById(serviceId);
    const worker = await Worker.findById(workerId);
    
    if (!service || !worker) {
      return res.status(404).json({ message: '服务或服务人员不存在' });
    }
    
    if (!isWorkerAvailable(worker, date, startTime, endTime)) {
      return res.status(400).json({ 
        message: '该服务人员在该时间段不工作',
        code: 'NOT_IN_SCHEDULE'
      });
    }
    
    const conflict = await checkTimeConflict(workerId, date, startTime, endTime);
    if (conflict.hasConflict) {
      return res.status(400).json({ 
        message: '该时间段已被预约',
        code: 'TIME_CONFLICT',
        conflictingBooking: conflict.conflictingBooking
      });
    }
    
    const booking = new Booking({
      service: serviceId,
      worker: workerId,
      customerName: req.body.customerName,
      customerPhone: req.body.customerPhone,
      customerAddress: req.body.customerAddress,
      date: new Date(date),
      startTime,
      endTime,
      totalPrice: service.price,
      notes: req.body.notes
    });

    const newBooking = await booking.save();
    res.status(201).json(newBooking);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({ message: '预约不存在' });
    }
    
    if (booking.status === '已完成' || booking.status === '已取消') {
      return res.status(400).json({ message: '该预约状态无法修改' });
    }
    
    if (req.body.status != null) {
      booking.status = req.body.status;
    }
    
    if (req.body.date != null) booking.date = new Date(req.body.date);
    if (req.body.startTime != null) booking.startTime = req.body.startTime;
    if (req.body.endTime != null) booking.endTime = req.body.endTime;
    if (req.body.notes != null) booking.notes = req.body.notes;
    if (req.body.customerName != null) booking.customerName = req.body.customerName;
    if (req.body.customerPhone != null) booking.customerPhone = req.body.customerPhone;
    if (req.body.customerAddress != null) booking.customerAddress = req.body.customerAddress;

    if (req.body.startTime != null || req.body.endTime != null || req.body.worker != null || req.body.date != null) {
      const workerId = req.body.worker || booking.worker;
      const conflict = await checkTimeConflict(workerId, booking.date, booking.startTime, booking.endTime, booking._id);
      if (conflict.hasConflict) {
        return res.status(400).json({ 
          message: '该时间段已被预约',
          code: 'TIME_CONFLICT'
        });
      }
    }

    const updatedBooking = await booking.save();
    res.json(updatedBooking);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({ message: '预约不存在' });
    }

    await booking.deleteOne();
    res.json({ message: '预约已取消' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
