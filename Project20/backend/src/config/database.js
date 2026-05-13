const initSqlJs = require('sql.js');
const path = require('path');
const fs = require('fs');

const dbDir = path.join(__dirname, '../../data');
const dbPath = path.join(dbDir, 'milktea.db');

if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

let db;
let SQL;

const initDatabase = async () => {
  SQL = await initSqlJs();
  
  if (fs.existsSync(dbPath)) {
    const fileBuffer = fs.readFileSync(dbPath);
    db = new SQL.Database(fileBuffer);
  } else {
    db = new SQL.Database();
  }

  db.run(`
    CREATE TABLE IF NOT EXISTS drinks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      price REAL NOT NULL,
      category TEXT NOT NULL,
      description TEXT,
      image TEXT,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS orders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      orderNo TEXT NOT NULL UNIQUE,
      totalPrice REAL NOT NULL,
      status TEXT DEFAULT 'pending',
      tableNo TEXT,
      remark TEXT,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS order_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      orderId INTEGER NOT NULL,
      drinkId INTEGER NOT NULL,
      drinkName TEXT NOT NULL,
      price REAL NOT NULL,
      quantity INTEGER NOT NULL,
      sugar TEXT DEFAULT 'normal',
      ice TEXT DEFAULT 'normal',
      FOREIGN KEY (orderId) REFERENCES orders(id)
    );
  `);

  const drinksData = [
    { name: '珍珠奶茶', price: 15, category: '经典奶茶', description: '香浓奶茶搭配Q弹珍珠' },
    { name: '芋泥奶茶', price: 18, category: '经典奶茶', description: '绵密芋泥与奶茶的完美结合' },
    { name: '红豆奶茶', price: 16, category: '经典奶茶', description: '香甜红豆搭配醇厚奶茶' },
    { name: '椰果奶茶', price: 15, category: '经典奶茶', description: '清爽椰果配丝滑奶茶' },
    { name: '柠檬绿茶', price: 12, category: '果茶系列', description: '清新柠檬与绿茶的碰撞' },
    { name: '蜜桃乌龙', price: 16, category: '果茶系列', description: '甜蜜蜜桃配香醇乌龙' },
    { name: '芒果冰沙', price: 18, category: '冰沙系列', description: '新鲜芒果打制冰沙' },
    { name: '草莓奶昔', price: 16, category: '冰沙系列', description: '草莓与牛奶的甜蜜组合' }
  ];

  const countResult = db.exec('SELECT COUNT(*) as count FROM drinks');
  if (countResult.length === 0 || countResult[0].values[0][0] === 0) {
    const stmt = db.prepare('INSERT INTO drinks (name, price, category, description) VALUES (?, ?, ?, ?)');
    drinksData.forEach(drink => {
      stmt.run([drink.name, drink.price, drink.category, drink.description]);
    });
    stmt.free();
    saveDatabase();
  }
};

const saveDatabase = () => {
  const data = db.export();
  const buffer = Buffer.from(data);
  fs.writeFileSync(dbPath, buffer);
};

const query = (sql, params = []) => {
  const stmt = db.prepare(sql);
  if (params.length > 0) {
    stmt.bind(params);
  }
  const results = [];
  while (stmt.step()) {
    const row = stmt.getAsObject();
    results.push(row);
  }
  stmt.free();
  return results;
};

const run = (sql, params = []) => {
  db.run(sql, params);
  return {
    changes: db.getRowsModified(),
    lastInsertRowid: db.exec('SELECT last_insert_rowid() as id')[0].values[0][0]
  };
};

const transaction = (fn) => {
  db.run('BEGIN TRANSACTION');
  try {
    const result = fn();
    db.run('COMMIT');
    saveDatabase();
    return result;
  } catch (error) {
    try {
      db.run('ROLLBACK');
    } catch (e) {
    }
    throw error;
  }
};

const prepare = (sql) => {
  return {
    run: (...params) => {
      const p = params.length === 1 && Array.isArray(params[0]) ? params[0] : params;
      const result = run(sql, p);
      saveDatabase();
      return result;
    },
    get: (...params) => {
      const p = params.length === 1 && Array.isArray(params[0]) ? params[0] : params;
      const results = query(sql, p);
      return results[0] || null;
    },
    all: (...params) => {
      const p = params.length === 1 && Array.isArray(params[0]) ? params[0] : params;
      return query(sql, p);
    }
  };
};

const database = {
  initDatabase,
  query,
  run,
  transaction,
  prepare
};

module.exports = database;
module.exports.initDatabase = initDatabase;
module.exports.query = query;
module.exports.run = run;
module.exports.transaction = transaction;
module.exports.prepare = prepare;
