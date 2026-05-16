const Router = require('koa-router');
const { run, get, all } = require('../database/db');

const router = new Router({ prefix: '/api/trainers' });

router.get('/', async (ctx) => {
  const trainers = await all('SELECT * FROM trainers ORDER BY id');
  ctx.body = { success: true, data: trainers };
});

router.get('/:id', async (ctx) => {
  const trainer = await get('SELECT * FROM trainers WHERE id = ?', [ctx.params.id]);
  if (!trainer) {
    ctx.status = 404;
    ctx.body = { success: false, message: '教练不存在' };
    return;
  }
  ctx.body = { success: true, data: trainer };
});

router.post('/', async (ctx) => {
  const { name, phone, specialty } = ctx.request.body;
  const result = await run(
    'INSERT INTO trainers (name, phone, specialty) VALUES (?, ?, ?)',
    [name, phone, specialty]
  );
  ctx.body = { success: true, data: { id: result.lastID } };
});

router.put('/:id', async (ctx) => {
  const { name, phone, specialty } = ctx.request.body;
  await run(
    'UPDATE trainers SET name = ?, phone = ?, specialty = ? WHERE id = ?',
    [name, phone, specialty, ctx.params.id]
  );
  ctx.body = { success: true, message: '更新成功' };
});

router.delete('/:id', async (ctx) => {
  await run('DELETE FROM trainers WHERE id = ?', [ctx.params.id]);
  ctx.body = { success: true, message: '删除成功' };
});

module.exports = router;