const Router = require('koa-router');
const { run, get, all } = require('../database/db');

const router = new Router({ prefix: '/api/transactions' });

router.get('/', async (ctx) => {
  const { member_id, type } = ctx.query;
  let sql = `
    SELECT t.*, m.name as member_name, mc.card_number
    FROM transactions t
    JOIN members m ON t.member_id = m.id
    LEFT JOIN member_cards mc ON t.member_card_id = mc.id
  `;
  let params = [];
  
  if (member_id || type) {
    sql += ' WHERE 1=1';
    if (member_id) {
      sql += ' AND t.member_id = ?';
      params.push(member_id);
    }
    if (type) {
      sql += ' AND t.type = ?';
      params.push(type);
    }
  }
  sql += ' ORDER BY t.created_at DESC';
  
  const transactions = await all(sql, params);
  ctx.body = { success: true, data: transactions };
});

router.get('/stats', async (ctx) => {
  const totalRevenue = await get('SELECT SUM(amount) as total FROM transactions WHERE type IN (?, ?, ?)', ['buy_card', 'recharge', 'consumption']);
  const totalMembers = await get('SELECT COUNT(*) as count FROM members');
  const todayAppointments = await get("SELECT COUNT(*) as count FROM appointments WHERE appointment_date = DATE('now')");
  
  ctx.body = {
    success: true,
    data: {
      total_revenue: totalRevenue.total || 0,
      total_members: totalMembers.count,
      today_appointments: todayAppointments.count
    }
  };
});

module.exports = router;