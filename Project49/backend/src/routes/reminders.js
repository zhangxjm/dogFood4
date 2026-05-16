const Router = require('koa-router');
const { run, get, all } = require('../database/db');

const router = new Router({ prefix: '/api/reminders' });

router.get('/', async (ctx) => {
  const { is_read } = ctx.query;
  let sql = `
    SELECT r.*, m.name as member_name, m.phone
    FROM reminders r
    JOIN members m ON r.member_id = m.id
  `;
  let params = [];
  
  if (is_read !== undefined) {
    sql += ' WHERE r.is_read = ?';
    params.push(is_read);
  }
  sql += ' ORDER BY r.created_at DESC';
  
  const reminders = await all(sql, params);
  ctx.body = { success: true, data: reminders };
});

router.put('/:id/read', async (ctx) => {
  await run('UPDATE reminders SET is_read = 1 WHERE id = ?', [ctx.params.id]);
  ctx.body = { success: true, message: '标记已读' };
});

router.get('/expiring-members', async (ctx) => {
  const members = await all(`
    SELECT m.*, mc.end_date, mc.card_number, ct.name as card_name
    FROM members m
    JOIN member_cards mc ON m.id = mc.member_id
    JOIN card_types ct ON mc.card_type_id = ct.id
    WHERE mc.status = 'active'
      AND DATE(mc.end_date) BETWEEN DATE('now') AND DATE('now', '+7 days')
    ORDER BY mc.end_date ASC
  `);
  ctx.body = { success: true, data: members };
});

module.exports = router;