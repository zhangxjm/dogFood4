const Router = require('@koa/router');
const db = require('../config/database');

const router = new Router({
  prefix: '/api/drinks'
});

router.get('/', async (ctx) => {
  const drinks = db.prepare('SELECT * FROM drinks ORDER BY createdAt DESC').all();
  ctx.body = {
    code: 200,
    message: 'success',
    data: drinks
  };
});

router.get('/:id', async (ctx) => {
  const { id } = ctx.params;
  const drink = db.prepare('SELECT * FROM drinks WHERE id = ?').get(id);
  
  if (!drink) {
    ctx.status = 404;
    ctx.body = {
      code: 404,
      message: '饮品不存在',
      data: null
    };
    return;
  }

  ctx.body = {
    code: 200,
    message: 'success',
    data: drink
  };
});

module.exports = router;