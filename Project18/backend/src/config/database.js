const initSqlJs = require('sql.js');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const dbPath = process.env.DB_PATH || path.join(__dirname, '../../data/database.sqlite');

class DatabaseWrapper {
  constructor(db, filePath) {
    this.db = db;
    this.filePath = filePath;
  }

  prepare(sql) {
    const self = this;
    return {
      run(...params) {
        const stmt = self.db.prepare(sql);
        stmt.bind(params);
        stmt.step();
        stmt.free();
        self._save();
        const changes = self.db.getRowsModified();
        const lastInsertRowid = self.db.exec('SELECT last_insert_rowid() as id')[0]?.values[0]?.[0];
        return { changes, lastInsertRowid };
      },
      get(...params) {
        const results = self.db.exec(sql, params);
        if (!results || results.length === 0 || !results[0].values || results[0].values.length === 0) {
          return undefined;
        }
        const columns = results[0].columns;
        const values = results[0].values[0];
        const row = {};
        columns.forEach((col, i) => {
          row[col] = values[i];
        });
        return row;
      },
      all(...params) {
        const results = self.db.exec(sql, params);
        if (!results || results.length === 0 || !results[0].values) {
          return [];
        }
        const columns = results[0].columns;
        return results[0].values.map(values => {
          const row = {};
          columns.forEach((col, i) => {
            row[col] = values[i];
          });
          return row;
        });
      }
    };
  }

  exec(sql) {
    this.db.run(sql);
    this._save();
  }

  pragma(sql) {
    this.db.run(`PRAGMA ${sql}`);
  }

  close() {
    this.db.close();
  }

  _save() {
    const data = this.db.export();
    const buffer = Buffer.from(data);
    const dir = path.dirname(this.filePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(this.filePath, buffer);
  }
}

let dbInstance = null;

async function initDatabase() {
  const SQL = await initSqlJs();
  
  const dir = path.dirname(dbPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  let db;
  if (fs.existsSync(dbPath)) {
    const fileBuffer = fs.readFileSync(dbPath);
    db = new SQL.Database(fileBuffer);
  } else {
    db = new SQL.Database();
  }

  dbInstance = new DatabaseWrapper(db, dbPath);
  return dbInstance;
}

const dbPromise = initDatabase();

module.exports = {
  getDb: async () => {
    return await dbPromise;
  }
};
