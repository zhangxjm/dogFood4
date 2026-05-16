const Router = require('koa-router');
const { run, get, all } = require('../database/db');
const moment = require('moment');

const router = new Router({ prefix: '/api/appointments' });

router.get('/', async (ctx) => {
  const appointments = await all(`
    SELECT a.*, m.name as member_name, t.name as trainer_name, mc.card_number
    FROM appointments a
    JOIN members m ON a.member_id = m.id
    JOIN trainers t ON a.trainer_id = t.id
    JOIN member_cards mc ON a.member_card_id = mc.id
    ORDER BY a.appointment_date DESC, a.start_time DESC
  `);
  ctx.body = { success: true, data: appointments };
});

router.get('/:id', async (ctx) => {
  const appointment = await get(`
    SELECT a.*, m.name as member_name, t.name as trainer_name
    FROM appointments a
    JOIN members m ON a.member_id = m.id
    JOIN trainers t ON a.trainer_id = t.id
    WHERE a.id = ?
  `, [ctx.params.id]);
  if (!appointment) {
    ctx.status = 404;
    ctx.body = { success: false, message: '预约不存在' };
    return;
  }
  ctx.body = { success: true, data: appointment };
});

router.post('/', async (ctx) => {
  const { member_id, trainer_id, member_card_id, appointment_date, start_time, end_time, notes } = ctx.request.body;
  
  const memberCard = await get('SELECT * FROM member_cards WHERE id = ? AND member_id = ?', [member_card_id, member_id]);
  if (!memberCard) {
    ctx.status = 400;
    ctx.body = { success: false, message: '会员卡不存在' };
    return;
  }

  if (memberCard.status !== 'active' || moment(memberCard.end_date).isBefore(moment())) {
    ctx.status = 400;
    ctx.body = { success: false, message: '会员卡已过期或未激活' };
    return;
  }

  if (memberCard.remaining_sessions <= 0) {
    ctx.status = 400;
    ctx.body = { success: false, message: '课时不足' };
    return;
  }

  const conflict = await get(`
    SELECT * FROM appointments 
    WHERE trainer_id = ? 
      AND appointment_date = ? 
      AND status IN ('pending', 'confirmed')
      AND (
        (start_time <= ? AND end_time > ?) OR
        (start_time < ? AND end_time >= ?) OR
        (start_time >= ? AND end_time <= ?)
      )
  `, [trainer_id, appointment_date, start_time, start_time, end_time, end_time, start_time, end_time]);

  if (conflict) {
    ctx.status = 400;
    ctx.body = { success: false, message: '该时间段已有预约' };
    return;
  }

  const result = await run(`
    INSERT INTO appointments (member_id, trainer_id, member_card_id, appointment_date, start_time, end_time, status, notes)
    VALUES (?, ?, ?, ?, ?, ?, 'pending', ?)
  `, [member_id, trainer_id, member_card_id, appointment_date, start_time, end_time, notes]);

  ctx.body = { success: true, data: { id: result.lastID } };
});

router.put('/:id/confirm', async (ctx) => {
  const appointment = await get('SELECT * FROM appointments WHERE id = ?', [ctx.params.id]);
  if (!appointment) {
    ctx.status = 404;
    ctx.body = { success: false, message: '预约不存在' };
    return;
  }

  await run('UPDATE appointments SET status = ? WHERE id = ?', ['confirmed', ctx.params.id]);
  ctx.body = { success: true, message: '预约已确认' };
});

router.put('/:id/complete', async (ctx) => {
  const appointment = await get('SELECT * FROM appointments WHERE id = ?', [ctx.params.id]);
  if (!appointment) {
    ctx.status = 404;
    ctx.body = { success: false, message: '预约不存在' };
    return;
  }

  if (appointment.session_deducted === 0) {
    const memberCard = await get('SELECT * FROM member_cards WHERE id = ?', [appointment.member_card_id]);
    if (memberCard && memberCard.remaining_sessions > 0) {
      await run('UPDATE member_cards SET remaining_sessions = remaining_sessions - 1 WHERE id = ?', [appointment.member_card_id]);
      await run(`
        INSERT INTO transactions (member_id, member_card_id, type, amount, sessions, description)
        VALUES (?, ?, 'deduct_session', 0, -1, '课时扣减-私教预约')
      `, [appointment.member_id, appointment.member_card_id]);
    }
    await run('UPDATE appointments SET status = ?, session_deducted = 1 WHERE id = ?', ['completed', ctx.params.id]);
  } else {
    await run('UPDATE appointments SET status = ? WHERE id = ?', ['completed', ctx.params.id]);
  }

  ctx.body = { success: true, message: '预约已完成，课时已扣减' };
});

router.put('/:id/cancel', async (ctx) => {
  await run('UPDATE appointments SET status = ? WHERE id = ?', ['cancelled', ctx.params.id]);
  ctx.body = { success: true, message: '预约已取消' };
});

module.exports = router;