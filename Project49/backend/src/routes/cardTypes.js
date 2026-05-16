const Router = require('koa-router');
const { run, get, all } = require('../database/db');

const router = new Router({ prefix: '/api/card-types' });

router.get('/', async (ctx) => {
  const cardTypes = await all('SELECT * FROM card_types ORDER BY id');
  ctx.body = { success: true, data: cardTypes };
});

router.get('/:id', async (ctx) => {
  const cardType = await get('SELECT * FROM card_types WHERE id = ?', [ctx.params.id]);
  if (!cardType) {
    ctx.status = 404;
    ctx.body = { success: false, message: '会员卡类型不存在' };
    return;
  }
  ctx.body = { success: true, data: cardType };
});

router.post('/', async (ctx) => {
  const { name, type, price, duration_days, sessions, description } = ctx.request.body;
  const result = await run(
    'INSERT INTO card_types (name, type, price, duration_days, sessions, description) VALUES (?, ?, ?, ?, ?, ?)',
    [name, type, price, duration_days, sessions, description]
  );
  ctx.body = { success: true, data: { id: result.lastID } };
});

router.put('/:id', async (ctx) => {
  const { name, type, price, duration_days, sessions, description } = ctx.request.body;
  await run(
    'UPDATE card_types SET name = ?, type = ?, price = ?, duration_days = ?, sessions = ?, description = ? WHERE id = ?',
    [name, type, price, duration_days, sessions, description, ctx.params.id]
  );
  ctx.body = { success: true, message: '更新成功' };
});

router.delete('/:id', async (ctx) => {
  await run('DELETE FROM card_types WHERE id = ?', [ctx.params.id]);
  ctx.body = { success: true, message: '删除成功' };
});

module.exports = router;