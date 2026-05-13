const { getDb } = require('../config/database');

const getCategories = async (ctx) => {
  try {
    const db = await getDb();
    const categories = db.prepare('SELECT * FROM categories ORDER BY sort_order').all();
    ctx.body = {
      success: true,
      data: categories
    };
  } catch (error) {
    ctx.status = 500;
    ctx.body = { success: false, message: error.message };
  }
};

const getProducts = async (ctx) => {
  try {
    const db = await getDb();
    const { categoryId } = ctx.query;
    let query = `
      SELECT p.*, c.name as category_name 
      FROM products p 
      LEFT JOIN categories c ON p.category_id = c.id 
      WHERE p.status = 1
    `;
    const params = [];
    
    if (categoryId) {
      query += ' AND p.category_id = ?';
      params.push(parseInt(categoryId));
    }
    
    query += ' ORDER BY p.sort_order';
    const products = db.prepare(query).all(...params);
    
    ctx.body = {
      success: true,
      data: products
    };
  } catch (error) {
    ctx.status = 500;
    ctx.body = { success: false, message: error.message };
  }
};

const getProductById = async (ctx) => {
  try {
    const db = await getDb();
    const { id } = ctx.params;
    const product = db.prepare(`
      SELECT p.*, c.name as category_name 
      FROM products p 
      LEFT JOIN categories c ON p.category_id = c.id 
      WHERE p.id = ?
    `).get(id);
    
    if (!product) {
      ctx.status = 404;
      ctx.body = { success: false, message: 'Product not found' };
      return;
    }
    
    ctx.body = {
      success: true,
      data: product
    };
  } catch (error) {
    ctx.status = 500;
    ctx.body = { success: false, message: error.message };
  }
};

module.exports = {
  getCategories,
  getProducts,
  getProductById
};
