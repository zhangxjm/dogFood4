const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

const categorySchema = new mongoose.Schema({
  name: { type: String, required: true },
  type: { type: String, enum: ['income', 'expense'], required: true },
  icon: { type: String, default: '' }
});

const recordSchema = new mongoose.Schema({
  amount: { type: Number, required: true },
  type: { type: String, enum: ['income', 'expense'], required: true },
  category: { type: String, required: true },
  description: { type: String, default: '' },
  date: { type: Date, default: Date.now }
});

const Category = mongoose.model('Category', categorySchema);
const Record = mongoose.model('Record', recordSchema);

mongoose.connect('mongodb://localhost:27017/account-book')
  .then(async () => {
    console.log('MongoDB 连接成功');
    const count = await Category.countDocuments();
    if (count === 0) {
      const defaultCategories = [
        { name: '工资', type: 'income', icon: '💰' },
        { name: '奖金', type: 'income', icon: '🎁' },
        { name: '投资收益', type: 'income', icon: '📈' },
        { name: '其他收入', type: 'income', icon: '💵' },
        { name: '餐饮', type: 'expense', icon: '🍔' },
        { name: '交通', type: 'expense', icon: '🚗' },
        { name: '购物', type: 'expense', icon: '🛒' },
        { name: '娱乐', type: 'expense', icon: '🎮' },
        { name: '医疗', type: 'expense', icon: '💊' },
        { name: '教育', type: 'expense', icon: '📚' },
        { name: '住房', type: 'expense', icon: '🏠' },
        { name: '其他支出', type: 'expense', icon: '📝' }
      ];
      await Category.insertMany(defaultCategories);
      console.log('默认分类已创建');
    }
  })
  .catch(err => console.error('MongoDB 连接失败:', err));

app.get('/api/categories', async (req, res) => {
  try {
    const categories = await Category.find();
    res.json({ success: true, data: categories });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.post('/api/categories', async (req, res) => {
  try {
    const category = new Category(req.body);
    await category.save();
    res.json({ success: true, data: category });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

app.get('/api/records', async (req, res) => {
  try {
    const { startDate, endDate, type } = req.query;
    let query = {};
    
    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) {
        const eDate = new Date(endDate);
        eDate.setHours(23, 59, 59, 999);
        query.date.$lte = eDate;
      }
    }
    if (type) query.type = type;
    
    const records = await Record.find(query).sort({ date: -1 });
    res.json({ success: true, data: records });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.post('/api/records', async (req, res) => {
  try {
    const record = new Record(req.body);
    await record.save();
    res.json({ success: true, data: record });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

app.put('/api/records/:id', async (req, res) => {
  try {
    const record = await Record.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!record) return res.status(404).json({ success: false, message: '记录不存在' });
    res.json({ success: true, data: record });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

app.delete('/api/records/:id', async (req, res) => {
  try {
    const record = await Record.findByIdAndDelete(req.params.id);
    if (!record) return res.status(404).json({ success: false, message: '记录不存在' });
    res.json({ success: true, message: '删除成功' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.get('/api/stats/month', async (req, res) => {
  try {
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    lastDay.setHours(23, 59, 59, 999);

    const records = await Record.find({
      date: { $gte: firstDay, $lte: lastDay }
    });

    let totalIncome = 0;
    let totalExpense = 0;
    const categoryStats = {};

    records.forEach(r => {
      if (r.type === 'income') totalIncome += r.amount;
      else totalExpense += r.amount;
      
      if (!categoryStats[r.category]) {
        categoryStats[r.category] = { category: r.category, type: r.type, total: 0 };
      }
      categoryStats[r.category].total += r.amount;
    });

    res.json({
      success: true,
      data: {
        totalIncome,
        totalExpense,
        balance: totalIncome - totalExpense,
        categoryStats: Object.values(categoryStats),
        records: records.sort((a, b) => new Date(b.date) - new Date(a.date))
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`服务已启动: http://localhost:${PORT}`);
});
