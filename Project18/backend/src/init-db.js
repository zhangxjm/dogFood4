const { getDb } = require('./config/database');

async function main() {
  console.log('Initializing database...');
  
  const db = await getDb();

  db.exec(`
    CREATE TABLE IF NOT EXISTS categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE,
      sort_order INTEGER DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      description TEXT,
      price REAL NOT NULL,
      image TEXT,
      category_id INTEGER,
      status INTEGER DEFAULT 1,
      sort_order INTEGER DEFAULT 0,
      FOREIGN KEY (category_id) REFERENCES categories(id)
    );

    CREATE TABLE IF NOT EXISTS orders (
      id TEXT PRIMARY KEY,
      order_no TEXT UNIQUE NOT NULL,
      total_amount REAL NOT NULL,
      status TEXT DEFAULT 'pending',
      remark TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS order_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      order_id TEXT NOT NULL,
      product_id INTEGER NOT NULL,
      product_name TEXT NOT NULL,
      price REAL NOT NULL,
      quantity INTEGER NOT NULL,
      FOREIGN KEY (order_id) REFERENCES orders(id)
    );
  `);

  console.log('Tables created successfully.');

  const categories = [
    { name: '招牌奶茶', sort_order: 1 },
    { name: '果茶系列', sort_order: 2 },
    { name: '鲜榨果汁', sort_order: 3 },
    { name: '咖啡系列', sort_order: 4 }
  ];

  for (const cat of categories) {
    const existing = db.prepare('SELECT id FROM categories WHERE name = ?').get(cat.name);
    if (!existing) {
      db.prepare('INSERT INTO categories (name, sort_order) VALUES (?, ?)').run(cat.name, cat.sort_order);
    }
  }

  console.log('Categories initialized.');

  const products = [
    { name: '珍珠奶茶', description: '香浓奶茶搭配Q弹珍珠', price: 12, category: '招牌奶茶', sort_order: 1 },
    { name: '椰果奶茶', description: '清爽椰果配上丝滑奶茶', price: 12, category: '招牌奶茶', sort_order: 2 },
    { name: '红豆奶茶', description: '甜蜜红豆与奶茶的完美结合', price: 13, category: '招牌奶茶', sort_order: 3 },
    { name: '芋圆奶茶', description: '手工芋圆，口感丰富', price: 14, category: '招牌奶茶', sort_order: 4 },
    { name: '柠檬绿茶', description: '清新柠檬与绿茶的碰撞', price: 10, category: '果茶系列', sort_order: 1 },
    { name: '百香果绿茶', description: '酸甜百香果，夏日必备', price: 12, category: '果茶系列', sort_order: 2 },
    { name: '芒果果茶', description: '新鲜芒果，浓郁果香', price: 14, category: '果茶系列', sort_order: 3 },
    { name: '西瓜汁', description: '新鲜西瓜鲜榨', price: 12, category: '鲜榨果汁', sort_order: 1 },
    { name: '橙汁', description: '香甜橙子鲜榨', price: 14, category: '鲜榨果汁', sort_order: 2 },
    { name: '苹果汁', description: '新鲜苹果鲜榨', price: 12, category: '鲜榨果汁', sort_order: 3 },
    { name: '美式咖啡', description: '经典美式，提神醒脑', price: 15, category: '咖啡系列', sort_order: 1 },
    { name: '拿铁咖啡', description: '丝滑牛奶配上香浓咖啡', price: 18, category: '咖啡系列', sort_order: 2 }
  ];

  for (const prod of products) {
    const category = db.prepare('SELECT id FROM categories WHERE name = ?').get(prod.category);
    if (category) {
      const existing = db.prepare('SELECT id FROM products WHERE name = ?').get(prod.name);
      if (!existing) {
        db.prepare(`
          INSERT INTO products (name, description, price, category_id, sort_order)
          VALUES (?, ?, ?, ?, ?)
        `).run(prod.name, prod.description, prod.price, category.id, prod.sort_order);
      }
    }
  }

  console.log('Products initialized.');
  console.log('Database initialization complete!');
}

main().catch(err => {
  console.error('Database initialization failed:', err);
  process.exit(1);
});
