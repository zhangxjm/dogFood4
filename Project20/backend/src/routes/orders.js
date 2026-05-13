const Router = require('@koa/router');
const db = require('../config/database');

const router = new Router({
  prefix: '/api/orders'
});

const generateOrderNo = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `MT${year}${month}${day}${random}`;
};

router.post('/', async (ctx) => {
  const { items, tableNo, remark } = ctx.request.body;

  if (!items || !Array.isArray(items) || items.length === 0) {
    ctx.status = 400;
    ctx.body = {
      code: 400,
      message: '请选择商品',
      data: null
    };
    return;
  }

  let totalPrice = 0;
  items.forEach(item => {
    totalPrice += item.price * item.quantity;
  });

  const orderNo = generateOrderNo();

  const insertOrder = db.transaction(() => {
    db.run(
      'INSERT INTO orders (orderNo, totalPrice, tableNo, remark) VALUES (?, ?, ?, ?)',
      [orderNo, totalPrice, tableNo || '', remark || '']
    );
    
    const orderResult = db.query('SELECT last_insert_rowid() as id');
    const orderId = orderResult[0].id;

    items.forEach(item => {
      db.run(
        'INSERT INTO order_items (orderId, drinkId, drinkName, price, quantity, sugar, ice) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [orderId, item.drinkId, item.drinkName, item.price, item.quantity, item.sugar || 'normal', item.ice || 'normal']
      );
    });

    return orderId;
  });

  const orderId = insertOrder;
  const order = db.prepare('SELECT * FROM orders WHERE id = ?').get([orderId]);
  const orderItems = db.prepare('SELECT * FROM order_items WHERE orderId = ?').all([orderId]);

  ctx.body = {
    code: 200,
    message: '下单成功',
    data: {
      ...order,
      items: orderItems
    }
  };
});

router.get('/', async (ctx) => {
  const orders = db.prepare('SELECT * FROM orders ORDER BY createdAt DESC').all();
  
  const ordersWithItems = orders.map(order => {
    const items = db.prepare('SELECT * FROM order_items WHERE orderId = ?').all(order.id);
    return {
      ...order,
      items
    };
  });

  ctx.body = {
    code: 200,
    message: 'success',
    data: ordersWithItems
  };
});

router.get('/:id', async (ctx) => {
  const { id } = ctx.params;
  const order = db.prepare('SELECT * FROM orders WHERE id = ?').get(id);

  if (!order) {
    ctx.status = 404;
    ctx.body = {
      code: 404,
      message: '订单不存在',
      data: null
    };
    return;
  }

  const items = db.prepare('SELECT * FROM order_items WHERE orderId = ?').all(id);

  ctx.body = {
    code: 200,
    message: 'success',
    data: {
      ...order,
      items
    }
  };
});

router.put('/:id/status', async (ctx) => {
  const { id } = ctx.params;
  const { status } = ctx.request.body;

  const validStatuses = ['pending', 'completed', 'cancelled'];
  if (!validStatuses.includes(status)) {
    ctx.status = 400;
    ctx.body = {
      code: 400,
      message: '无效的订单状态',
      data: null
    };
    return;
  }

  const result = db.prepare('UPDATE orders SET status = ? WHERE id = ?').run(status, id);
  
  if (result.changes === 0) {
    ctx.status = 404;
    ctx.body = {
      code: 404,
      message: '订单不存在',
      data: null
    };
    return;
  }

  ctx.body = {
    code: 200,
    message: '状态更新成功',
    data: null
  };
});

module.exports = router;