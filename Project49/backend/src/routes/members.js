const Router = require('koa-router');
const { run, get, all } = require('../database/db');
const moment = require('moment');

const router = new Router({ prefix: '/api/members' });

router.get('/', async (ctx) => {
  const members = await all('SELECT * FROM members ORDER BY id DESC');
  ctx.body = { success: true, data: members };
});

router.get('/:id', async (ctx) => {
  const member = await get('SELECT * FROM members WHERE id = ?', [ctx.params.id]);
  if (!member) {
    ctx.status = 404;
    ctx.body = { success: false, message: '会员不存在' };
    return;
  }
  const cards = await all(`
    SELECT mc.*, ct.name as card_type_name, ct.type as card_type 
    FROM member_cards mc 
    JOIN card_types ct ON mc.card_type_id = ct.id 
    WHERE mc.member_id = ?
  `, [ctx.params.id]);
  ctx.body = { success: true, data: { ...member, cards } };
});

router.post('/', async (ctx) => {
  const { name, phone, gender, birthday } = ctx.request.body;
  try {
    const result = await run(
      'INSERT INTO members (name, phone, gender, birthday) VALUES (?, ?, ?, ?)',
      [name, phone, gender, birthday]
    );
    ctx.body = { success: true, data: { id: result.lastID } };
  } catch (err) {
    if (err.message.includes('UNIQUE constraint failed')) {
      ctx.status = 400;
      ctx.body = { success: false, message: '该手机号已存在' };
    } else {
      throw err;
    }
  }
});

router.put('/:id', async (ctx) => {
  const { name, phone, gender, birthday } = ctx.request.body;
  await run(
    'UPDATE members SET name = ?, phone = ?, gender = ?, birthday = ? WHERE id = ?',
    [name, phone, gender, birthday, ctx.params.id]
  );
  ctx.body = { success: true, message: '更新成功' };
});

router.post('/:id/buy-card', async (ctx) => {
  const memberId = ctx.params.id;
  const { card_type_id } = ctx.request.body;
  
  const cardType = await get('SELECT * FROM card_types WHERE id = ?', [card_type_id]);
  if (!cardType) {
    ctx.status = 404;
    ctx.body = { success: false, message: '会员卡类型不存在' };
    return;
  }

  const startDate = moment().format('YYYY-MM-DD');
  const endDate = moment().add(cardType.duration_days, 'days').format('YYYY-MM-DD');
  const cardNumber = 'C' + Date.now() + Math.floor(Math.random() * 1000);

  const result = await run(`
    INSERT INTO member_cards (member_id, card_type_id, card_number, balance, remaining_sessions, start_date, end_date, status)
    VALUES (?, ?, ?, 0, ?, ?, ?, 'active')
  `, [memberId, card_type_id, cardNumber, cardType.sessions || 0, startDate, endDate]);

  await run(`
    INSERT INTO transactions (member_id, member_card_id, type, amount, sessions, description)
    VALUES (?, ?, 'buy_card', ?, ?, ?)
  `, [memberId, result.lastID, cardType.price, cardType.sessions || 0, `购买${cardType.name}`]);

  ctx.body = { success: true, data: { id: result.lastID, card_number: cardNumber } };
});

router.post('/:id/recharge', async (ctx) => {
  const memberId = ctx.params.id;
  const { member_card_id, amount, sessions } = ctx.request.body;
  
  const memberCard = await get('SELECT * FROM member_cards WHERE id = ? AND member_id = ?', [member_card_id, memberId]);
  if (!memberCard) {
    ctx.status = 404;
    ctx.body = { success: false, message: '会员卡不存在' };
    return;
  }

  await run('UPDATE member_cards SET balance = balance + ?, remaining_sessions = remaining_sessions + ? WHERE id = ?',
    [amount, sessions || 0, member_card_id]);

  await run(`
    INSERT INTO transactions (member_id, member_card_id, type, amount, sessions, description)
    VALUES (?, ?, 'recharge', ?, ?, '会员卡充值')
  `, [memberId, member_card_id, amount, sessions || 0]);

  ctx.body = { success: true, message: '充值成功' };
});

module.exports = router;