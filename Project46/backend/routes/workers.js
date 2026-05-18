const express = require('express');
const Worker = require('../models/Worker');
const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const { skill, verifiedOnly } = req.query;
    let query = { isActive: true };
    if (skill) {
      query.skills = skill;
    }
    if (verifiedOnly === 'true') {
      query.verificationStatus = '审核通过';
      query.canReceiveOrders = true;
    }
    const workers = await Worker.find(query).sort({ rating: -1 });
    res.json(workers);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const worker = await Worker.findById(req.params.id);
    if (!worker) {
      return res.status(404).json({ message: '服务人员不存在' });
    }
    res.json(worker);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/', async (req, res) => {
  const worker = new Worker({
    name: req.body.name,
    phone: req.body.phone,
    skills: req.body.skills,
    schedule: req.body.schedule || [],
    isActive: req.body.isActive
  });

  try {
    const newWorker = await worker.save();
    res.status(201).json(newWorker);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const worker = await Worker.findById(req.params.id);
    if (!worker) {
      return res.status(404).json({ message: '服务人员不存在' });
    }

    if (req.body.name != null) worker.name = req.body.name;
    if (req.body.phone != null) worker.phone = req.body.phone;
    if (req.body.skills != null) worker.skills = req.body.skills;
    if (req.body.schedule != null) worker.schedule = req.body.schedule;
    if (req.body.isActive != null) worker.isActive = req.body.isActive;

    const updatedWorker = await worker.save();
    res.json(updatedWorker);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const worker = await Worker.findById(req.params.id);
    if (!worker) {
      return res.status(404).json({ message: '服务人员不存在' });
    }

    await worker.deleteOne();
    res.json({ message: '服务人员已删除' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
