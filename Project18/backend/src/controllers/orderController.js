const { getDb } = require('../config/database');
const { v4: uuidv4 } = require('uuid');

const generateOrderNo = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const random = Math.floor(1000 + Math.random() * 9000);
  return `MT${year}${month}${day}${random}`;
};

const createOrder = async (ctx) => {
  try {
    const db = await getDb();
    const { items, remark } = ctx.request.body;
    
    if (!items || items.length === 0) {
      ctx.status = 400;
      ctx.body = { success: false, message: 'Order items are required' };
      return;
    }

    let totalAmount = 0;
    const orderItems = [];
    
    for (const item of items) {
      const product = db.prepare('SELECT * FROM products WHERE id = ?').get(item.productId);
      if (!product) {
        ctx.status = 404;
        ctx.body = { success: false, message: `Product with id ${item.productId} not found` };
        return;
      }
      
      const quantity = item.quantity || 1;
      const itemTotal = product.price * quantity;
      totalAmount += itemTotal;
      
      orderItems.push({
        productId: product.id,
        productName: product.name,
        price: product.price,
        quantity
      });
    }

    const orderId = uuidv4();
    const orderNo = generateOrderNo();

    const insertOrder = db.prepare(`
      INSERT INTO orders (id, order_no, total_amount, remark)
      VALUES (?, ?, ?, ?)
    `);
    insertOrder.run(orderId, orderNo, totalAmount, remark || '');

    const insertOrderItem = db.prepare(`
      INSERT INTO order_items (order_id, product_id, product_name, price, quantity)
      VALUES (?, ?, ?, ?, ?)
    `);

    for (const item of orderItems) {
      insertOrderItem.run(orderId, item.productId, item.productName, item.price, item.quantity);
    }

    ctx.body = {
      success: true,
      data: {
        id: orderId,
        orderNo,
        totalAmount,
        status: 'pending',
        remark: remark || '',
        items: orderItems
      }
    };
  } catch (error) {
    ctx.status = 500;
    ctx.body = { success: false, message: error.message };
  }
};

const getOrders = async (ctx) => {
  try {
    const db = await getDb();
    const { status } = ctx.query;
    let query = `
      SELECT o.*, 
             (SELECT COUNT(*) FROM order_items WHERE order_id = o.id) as item_count
      FROM orders o
    `;
    const params = [];
    
    if (status) {
      query += ' WHERE o.status = ?';
      params.push(status);
    }
    
    query += ' ORDER BY o.created_at DESC';
    const orders = db.prepare(query).all(...params);
    
    ctx.body = {
      success: true,
      data: orders
    };
  } catch (error) {
    ctx.status = 500;
    ctx.body = { success: false, message: error.message };
  }
};

const getOrderById = async (ctx) => {
  try {
    const db = await getDb();
    const { id } = ctx.params;
    
    const order = db.prepare(`
      SELECT * FROM orders WHERE id = ?
    `).get(id);
    
    if (!order) {
      ctx.status = 404;
      ctx.body = { success: false, message: 'Order not found' };
      return;
    }
    
    const items = db.prepare(`
      SELECT * FROM order_items WHERE order_id = ?
    `).all(id);
    
    ctx.body = {
      success: true,
      data: {
        ...order,
        items
      }
    };
  } catch (error) {
    ctx.status = 500;
    ctx.body = { success: false, message: error.message };
  }
};

const updateOrderStatus = async (ctx) => {
  try {
    const db = await getDb();
    const { id } = ctx.params;
    const { status } = ctx.request.body;
    
    const validStatuses = ['pending', 'completed', 'cancelled'];
    if (!validStatuses.includes(status)) {
      ctx.status = 400;
      ctx.body = { success: false, message: 'Invalid status' };
      return;
    }
    
    const result = db.prepare(`
      UPDATE orders SET status = ? WHERE id = ?
    `).run(status, id);
    
    if (result.changes === 0) {
      ctx.status = 404;
      ctx.body = { success: false, message: 'Order not found' };
      return;
    }
    
    ctx.body = {
      success: true,
      message: 'Order status updated'
    };
  } catch (error) {
    ctx.status = 500;
    ctx.body = { success: false, message: error.message };
  }
};

module.exports = {
  createOrder,
  getOrders,
  getOrderById,
  updateOrderStatus
};
