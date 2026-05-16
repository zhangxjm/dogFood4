const express = require('express');
const Service = require('../models/Service');
const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const services = await Service.find().sort({ createdAt: -1 });
    res.json(services);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const service = await Service.findById(req.params.id);
    if (!service) {
      return res.status(404).json({ message: '服务不存在' });
    }
    res.json(service);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/', async (req, res) => {
  const service = new Service({
    name: req.body.name,
    description: req.body.description,
    price: req.body.price,
    duration: req.body.duration,
    category: req.body.category,
    isActive: req.body.isActive
  });

  try {
    const newService = await service.save();
    res.status(201).json(newService);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const service = await Service.findById(req.params.id);
    if (!service) {
      return res.status(404).json({ message: '服务不存在' });
    }

    if (req.body.name != null) service.name = req.body.name;
    if (req.body.description != null) service.description = req.body.description;
    if (req.body.price != null) service.price = req.body.price;
    if (req.body.duration != null) service.duration = req.body.duration;
    if (req.body.category != null) service.category = req.body.category;
    if (req.body.isActive != null) service.isActive = req.body.isActive;

    const updatedService = await service.save();
    res.json(updatedService);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const service = await Service.findById(req.params.id);
    if (!service) {
      return res.status(404).json({ message: '服务不存在' });
    }

    await service.deleteOne();
    res.json({ message: '服务已删除' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
