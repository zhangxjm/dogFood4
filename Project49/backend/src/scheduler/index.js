const schedule = require('node-schedule');
const { initDB, run, get, all } = require('../database/db');
const moment = require('moment');

async function checkExpiringCards() {
  console.log('检查即将到期的会员卡...');
  
  const expiringCards = await all(`
    SELECT mc.*, m.name, m.phone, ct.name as card_name
    FROM member_cards mc
    JOIN members m ON mc.member_id = m.id
    JOIN card_types ct ON mc.card_type_id = ct.id
    WHERE mc.status = 'active'
      AND DATE(mc.end_date) = DATE('now', '+7 days')
  `);

  for (const card of expiringCards) {
    const existing = await get(`
      SELECT * FROM reminders 
      WHERE member_id = ? AND type = 'expire' AND DATE(created_at) = DATE('now')
    `, [card.member_id]);

    if (!existing) {
      await run(`
        INSERT INTO reminders (member_id, type, message)
        VALUES (?, 'expire', ?)
      `, [card.member_id, `您的${card.card_name}将于7天后到期，请及时续费`]);
      console.log(`已为会员 ${card.name} 创建到期提醒`);
    }
  }

  const expiredCards = await all(`
    SELECT mc.*, m.name
    FROM member_cards mc
    JOIN members m ON mc.member_id = m.id
    WHERE mc.status = 'active'
      AND DATE(mc.end_date) < DATE('now')
  `);

  for (const card of expiredCards) {
    await run('UPDATE member_cards SET status = ? WHERE id = ?', ['expired', card.id]);
    console.log(`会员卡 ${card.card_number} 已标记为过期`);
  }
}

async function autoDeductSessionsForCompletedAppointments() {
  console.log('检查需要扣减课时的预约...');
  
  const appointments = await all(`
    SELECT a.*
    FROM appointments a
    WHERE a.status = 'confirmed'
      AND a.session_deducted = 0
      AND DATE(a.appointment_date || ' ' || a.end_time) < DATETIME('now')
  `);

  for (const apt of appointments) {
    const memberCard = await get('SELECT * FROM member_cards WHERE id = ?', [apt.member_card_id]);
    if (memberCard && memberCard.remaining_sessions > 0) {
      await run('UPDATE member_cards SET remaining_sessions = remaining_sessions - 1 WHERE id = ?', [apt.member_card_id]);
      await run(`
        INSERT INTO transactions (member_id, member_card_id, type, amount, sessions, description)
        VALUES (?, ?, 'deduct_session', 0, -1, '自动扣减课时')
      `, [apt.member_id, apt.member_card_id]);
      await run('UPDATE appointments SET status = ?, session_deducted = 1 WHERE id = ?', ['completed', apt.id]);
      console.log(`预约 ${apt.id} 已自动完成并扣减课时`);
    }
  }
}

function initScheduler() {
  schedule.scheduleJob('0 9 * * *', () => {
    checkExpiringCards();
  });

  schedule.scheduleJob('0 * * * *', () => {
    autoDeductSessionsForCompletedAppointments();
  });

  console.log('定时任务已启动');
  checkExpiringCards();
  autoDeductSessionsForCompletedAppointments();
}

module.exports = { initScheduler };