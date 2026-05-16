const { initDB, run, get, all } = require('./db');
const moment = require('moment');

async function initDatabase() {
  await initDB();
  await run(`
    CREATE TABLE IF NOT EXISTS card_types (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      type TEXT NOT NULL,
      price REAL NOT NULL,
      duration_days INTEGER,
      sessions INTEGER,
      description TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await run(`
    CREATE TABLE IF NOT EXISTS members (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      phone TEXT NOT NULL UNIQUE,
      gender TEXT,
      birthday TEXT,
      avatar TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await run(`
    CREATE TABLE IF NOT EXISTS member_cards (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      member_id INTEGER NOT NULL,
      card_type_id INTEGER NOT NULL,
      card_number TEXT NOT NULL UNIQUE,
      balance REAL DEFAULT 0,
      remaining_sessions INTEGER DEFAULT 0,
      start_date TEXT NOT NULL,
      end_date TEXT NOT NULL,
      status TEXT DEFAULT 'active',
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (member_id) REFERENCES members(id),
      FOREIGN KEY (card_type_id) REFERENCES card_types(id)
    )
  `);

  await run(`
    CREATE TABLE IF NOT EXISTS trainers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      phone TEXT NOT NULL,
      specialty TEXT,
      avatar TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await run(`
    CREATE TABLE IF NOT EXISTS appointments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      member_id INTEGER NOT NULL,
      trainer_id INTEGER NOT NULL,
      member_card_id INTEGER NOT NULL,
      appointment_date TEXT NOT NULL,
      start_time TEXT NOT NULL,
      end_time TEXT NOT NULL,
      status TEXT DEFAULT 'pending',
      session_deducted INTEGER DEFAULT 0,
      notes TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (member_id) REFERENCES members(id),
      FOREIGN KEY (trainer_id) REFERENCES trainers(id),
      FOREIGN KEY (member_card_id) REFERENCES member_cards(id)
    )
  `);

  await run(`
    CREATE TABLE IF NOT EXISTS transactions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      member_id INTEGER NOT NULL,
      member_card_id INTEGER,
      type TEXT NOT NULL,
      amount REAL NOT NULL,
      sessions INTEGER DEFAULT 0,
      description TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (member_id) REFERENCES members(id),
      FOREIGN KEY (member_card_id) REFERENCES member_cards(id)
    )
  `);

  await run(`
    CREATE TABLE IF NOT EXISTS reminders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      member_id INTEGER NOT NULL,
      type TEXT NOT NULL,
      message TEXT NOT NULL,
      is_read INTEGER DEFAULT 0,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (member_id) REFERENCES members(id)
    )
  `);

  const cardTypes = [
    { name: '月卡', type: 'time', price: 299, duration_days: 30, sessions: null, description: '30天不限次会员卡' },
    { name: '季卡', type: 'time', price: 799, duration_days: 90, sessions: null, description: '90天不限次会员卡' },
    { name: '年卡', type: 'time', price: 2999, duration_days: 365, sessions: null, description: '365天不限次会员卡' },
    { name: '10次卡', type: 'session', price: 500, duration_days: 180, sessions: 10, description: '10次课时卡，有效期180天' },
    { name: '30次卡', type: 'session', price: 1200, duration_days: 365, sessions: 30, description: '30次课时卡，有效期365天' },
    { name: '私教10次卡', type: 'personal', price: 3000, duration_days: 180, sessions: 10, description: '私教10次卡' },
  ];

  for (const ct of cardTypes) {
    const existing = await get('SELECT id FROM card_types WHERE name = ?', [ct.name]);
    if (!existing) {
      await run(
        'INSERT INTO card_types (name, type, price, duration_days, sessions, description) VALUES (?, ?, ?, ?, ?, ?)',
        [ct.name, ct.type, ct.price, ct.duration_days, ct.sessions, ct.description]
      );
    }
  }

  const trainers = [
    { name: '王教练', phone: '13800138001', specialty: '增肌、力量训练' },
    { name: '李教练', phone: '13800138002', specialty: '减脂、有氧训练' },
    { name: '张教练', phone: '13800138003', specialty: '瑜伽、普拉提' },
  ];

  for (const t of trainers) {
    const existing = await get('SELECT id FROM trainers WHERE phone = ?', [t.phone]);
    if (!existing) {
      await run(
        'INSERT INTO trainers (name, phone, specialty) VALUES (?, ?, ?)',
        [t.name, t.phone, t.specialty]
      );
    }
  }

  console.log('数据库初始化完成！');
}

module.exports = initDatabase;