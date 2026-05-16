const initSqlJs = require('sql.js');
const fs = require('fs');
const path = require('path');

const dataDir = path.join(__dirname, '../../data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const dbPath = path.join(dataDir, 'gym.db');

let db = null;
let SQL = null;

async function initDB() {
  if (db) return;
  
  SQL = await initSqlJs();
  
  let dbData = null;
  if (fs.existsSync(dbPath)) {
    dbData = fs.readFileSync(dbPath);
  }
  
  db = new SQL.Database(dbData);
  console.log('数据库连接成功');
}

function saveDB() {
  const data = db.export();
  fs.writeFileSync(dbPath, Buffer.from(data));
}

function rowToObject(columns, values) {
  const obj = {};
  columns.forEach((col, i) => {
    obj[col] = values[i];
  });
  return obj;
}

function run(sql, params = []) {
  return new Promise((resolve, reject) => {
    try {
      db.run(sql, params);
      saveDB();
      
      const result = db.exec('SELECT last_insert_rowid() as id');
      resolve({
        lastID: result[0]?.values[0]?.[0] || 0,
        changes: 1
      });
    } catch (err) {
      reject(err);
    }
  });
}

function get(sql, params = []) {
  return new Promise((resolve, reject) => {
    try {
      const result = db.exec(sql, params);
      if (result.length > 0 && result[0].values.length > 0) {
        resolve(rowToObject(result[0].columns, result[0].values[0]));
      } else {
        resolve(null);
      }
    } catch (err) {
      reject(err);
    }
  });
}

function all(sql, params = []) {
  return new Promise((resolve, reject) => {
    try {
      const result = db.exec(sql, params);
      if (result.length > 0) {
        const rows = result[0].values.map(values => rowToObject(result[0].columns, values));
        resolve(rows);
      } else {
        resolve([]);
      }
    } catch (err) {
      reject(err);
    }
  });
}

module.exports = { initDB, run, get, all };