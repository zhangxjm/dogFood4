const Koa = require('koa');
const Router = require('koa-router');
const bodyParser = require('koa-bodyparser');
const serve = require('koa-static');
const cors = require('@koa/cors');
const mongoose = require('mongoose');
const path = require('path');

const Anniversary = require('./models/Anniversary');

const app = new Koa();
const router = new Router();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/anniversary';
const PORT = process.env.PORT || 3000;

mongoose.connect(MONGODB_URI)
  .then(() => console.log('MongoDB 连接成功'))
  .catch(err => console.error('MongoDB 连接失败:', err));

router.get('/api/anniversaries', async (ctx) => {
  try {
    const anniversaries = await Anniversary.find().sort({ date: 1 });
    ctx.body = {
      success: true,
      data: anniversaries
    };
  } catch (err) {
    ctx.status = 500;
    ctx.body = {
      success: false,
      message: err.message
    };
  }
});

router.post('/api/anniversaries', async (ctx) => {
  try {
    const { title, type, date, note } = ctx.request.body;
    
    if (!title || !type || !date) {
      ctx.status = 400;
      ctx.body = {
        success: false,
        message: '标题、类型和日期为必填项'
      };
      return;
    }

    const anniversary = new Anniversary({
      title,
      type,
      date: new Date(date),
      note: note || ''
    });

    const saved = await anniversary.save();
    ctx.status = 201;
    ctx.body = {
      success: true,
      data: saved
    };
  } catch (err) {
    ctx.status = 500;
    ctx.body = {
      success: false,
      message: err.message
    };
  }
});

router.put('/api/anniversaries/:id', async (ctx) => {
  try {
    const { title, type, date, note } = ctx.request.body;
    const updateData = {};
    
    if (title) updateData.title = title;
    if (type) updateData.type = type;
    if (date) updateData.date = new Date(date);
    if (note !== undefined) updateData.note = note;

    const updated = await Anniversary.findByIdAndUpdate(
      ctx.params.id,
      updateData,
      { new: true }
    );

    if (!updated) {
      ctx.status = 404;
      ctx.body = {
        success: false,
        message: '纪念日不存在'
      };
      return;
    }

    ctx.body = {
      success: true,
      data: updated
    };
  } catch (err) {
    ctx.status = 500;
    ctx.body = {
      success: false,
      message: err.message
    };
  }
});

router.delete('/api/anniversaries/:id', async (ctx) => {
  try {
    const deleted = await Anniversary.findByIdAndDelete(ctx.params.id);
    
    if (!deleted) {
      ctx.status = 404;
      ctx.body = {
        success: false,
        message: '纪念日不存在'
      };
      return;
    }

    ctx.body = {
      success: true,
      message: '删除成功'
    };
  } catch (err) {
    ctx.status = 500;
    ctx.body = {
      success: false,
      message: err.message
    };
  }
});

app.use(cors());
app.use(bodyParser());
app.use(serve(path.join(__dirname, '../public')));
app.use(router.routes());
app.use(router.allowedMethods());

app.listen(PORT, () => {
  console.log(`服务器运行在 http://localhost:${PORT}`);
});
